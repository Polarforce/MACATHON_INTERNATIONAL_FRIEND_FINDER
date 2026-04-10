"""
comparator.py

Detects ALL meaningful stock changes — any direction.

Current mode: alert on ANY change (up, down, new store, store gone).
Future mode:  comment out the 'decreased' and 'removed' blocks below
              to only alert on increases >= 15.

Store format: {"name": "Dandenong", "quantity": 7}
"""

from __future__ import annotations
from typing import Any
import re
from utils import get_logger

logger = get_logger("comparator")

HIGH_QTY_THRESHOLD = 15


def compare_states(previous: dict, current: dict) -> tuple[bool, str]:
    """
    Returns (should_alert: bool, reason: str).
    Compares every store by name and quantity in both directions.
    """
    prev_map = _to_store_map(previous)
    curr_map = _to_store_map(current)

    # ── First run ─────────────────────────────────────────────────────────────
    if not prev_map and not curr_map:
        logger.info("First run — no stock. Baseline saved.")
        return False, "First run — no stock. Baseline saved."

    if not prev_map and curr_map:
        summary = ", ".join(f"{n} ({q})" for n, q in curr_map.items())
        logger.info(f"First run — stock found: {summary}")
        return True, f"First run — stock found: {summary}"

    prev_names = set(prev_map.keys())
    curr_names = set(curr_map.keys())

    # ── New stores that gained stock ──────────────────────────────────────────
    added = {n: curr_map[n] for n in sorted(curr_names - prev_names)}

    # ── Stores that disappeared entirely ──────────────────────────────────────
    removed = {n: prev_map[n] for n in sorted(prev_names - curr_names)}

    # ── Stores whose quantity changed (either direction) ──────────────────────
    increased = {}
    decreased = {}
    for name in sorted(prev_names & curr_names):
        old, new = prev_map[name], curr_map[name]
        if new > old:
            increased[name] = (old, new)
        elif new < old:
            decreased[name] = (old, new)

    # ── Stores newly crossing the high-qty threshold ──────────────────────────
    prev_high = {n for n, q in prev_map.items() if q >= HIGH_QTY_THRESHOLD}
    curr_high = {n for n, q in curr_map.items() if q >= HIGH_QTY_THRESHOLD}
    newly_high = {n: curr_map[n] for n in sorted(curr_high - prev_high)}

    # ── Build reason string ───────────────────────────────────────────────────
    parts = []

    if added:
        parts.append("New stores with stock: " +
            ", ".join(f"{n} ({q})" for n, q in added.items()))

    if removed:
        parts.append("Stores lost stock: " +
            ", ".join(f"{n} (was {q})" for n, q in removed.items()))

    if increased:
        parts.append("Quantity up: " +
            ", ".join(f"{n} {o}→{nw}" for n, (o, nw) in increased.items()))

    if decreased:
        parts.append("Quantity down: " +
            ", ".join(f"{n} {o}→{nw}" for n, (o, nw) in decreased.items()))

    if newly_high:
        parts.append(f"HIGH STOCK (≥{HIGH_QTY_THRESHOLD}): " +
            ", ".join(f"{n} ({q})" for n, q in newly_high.items()))

    if parts:
        reason = " | ".join(parts)
        logger.info(f"Alert triggered: {reason}")
        return True, reason

    logger.info(f"No change. {len(curr_map)} stores tracked.")
    return False, "No change detected."


def _to_store_map(state: dict | None) -> dict[str, int]:
    """Convert state dict to {store_name: quantity}. Includes zero quantities."""
    if not state:
        return {}
    result: dict[str, int] = {}
    for store in state.get("stores", []):
        name = str(store.get("name", "")).strip()
        if name:
            result[name] = _safe_int(store.get("quantity", 0))
    return result


def _safe_int(value: Any) -> int:
    if isinstance(value, int):
        return value
    match = re.search(r"\d+", str(value))
    return int(match.group()) if match else 0