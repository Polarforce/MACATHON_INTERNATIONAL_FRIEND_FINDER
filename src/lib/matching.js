/**
 * Score compatibility between a viewer and a candidate profile.
 *
 * Scoring weights:
 *   40  — same residence hall
 *   25  — same campus
 *   20  — same faculty
 *   15  — shared languages  (5 pts each, capped)
 *   15  — shared interests  (3 pts each, capped)
 *   10  — flatmate suburb overlap (bonus)
 * Max  = 125 pts
 *
 * Returns null if the pair fails a hard filter (budget mismatch in flatmate mode).
 */
export function scoreMatch(viewer, candidate, mode) {
  // Hard filter: flatmate/both mode requires overlapping weekly budgets
  if (mode === 'flatmate' || mode === 'both') {
    const vMin = viewer.budget_min ?? 0
    const vMax = viewer.budget_max ?? 99999
    const cMin = candidate.budget_min ?? 0
    const cMax = candidate.budget_max ?? 99999
    // Ranges don't overlap if one is entirely above or below the other
    if (vMax < cMin || cMax < vMin) return null
  }

  let score = 0

  // Same residence hall — 40 pts
  if (
    viewer.residence_hall &&
    candidate.residence_hall &&
    viewer.residence_hall.trim().toLowerCase() === candidate.residence_hall.trim().toLowerCase()
  ) {
    score += 40
  }

  // Same campus — 25 pts
  if (viewer.campus && candidate.campus && viewer.campus === candidate.campus) {
    score += 25
  }

  // Same faculty — 20 pts
  if (viewer.faculty && candidate.faculty && viewer.faculty === candidate.faculty) {
    score += 20
  }

  // Shared languages — 5 pts each, max 15
  const sharedLangs = (viewer.languages ?? []).filter(l =>
    (candidate.languages ?? []).includes(l)
  )
  score += Math.min(sharedLangs.length * 5, 15)

  // Shared interests — 3 pts each, max 15
  const sharedInterests = (viewer.interests ?? []).filter(i =>
    (candidate.interests ?? []).includes(i)
  )
  score += Math.min(sharedInterests.length * 3, 15)

  // Flatmate suburb overlap — +10 pts
  if (mode === 'flatmate' || mode === 'both') {
    const vs = viewer.preferred_suburbs ?? []
    const cs = candidate.preferred_suburbs ?? []
    if (vs.some(s => cs.includes(s))) score += 10
  }

  return score
}

/**
 * Filter candidates to those compatible with the viewer's mode,
 * score each with scoreMatch, and return them sorted by score descending.
 *
 * @param {object} viewer  — viewer's full profile row
 * @param {object[]} candidates — array of candidate profile rows
 * @returns {{ profile: object, score: number }[]}
 */
export function rankCandidates(viewer, candidates) {
  const mode = viewer.mode ?? 'friend'
  const results = []

  for (const candidate of candidates) {
    // Mode compatibility filter
    if (mode === 'friend' && candidate.mode === 'flatmate') continue
    if (mode === 'flatmate' && candidate.mode === 'friend') continue

    const score = scoreMatch(viewer, candidate, mode)
    if (score === null) continue // failed hard budget filter

    results.push({ profile: candidate, score })
  }

  return results.sort((a, b) => b.score - a.score)
}
