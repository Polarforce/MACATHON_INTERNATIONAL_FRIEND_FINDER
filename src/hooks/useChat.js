import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Manages message history and a Supabase Realtime subscription for one match.
 *
 * @param {string|null} matchId
 * @returns {{ messages: object[], sendMessage: (content: string) => Promise<boolean>, loading: boolean }}
 */
export function useChat(matchId) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return

    let cancelled = false

    // ── 1. Load history ──────────────────────────────────────────────────────
    supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setMessages(data ?? [])
          setLoading(false)
        }
      })

    // ── 2. Realtime subscription ─────────────────────────────────────────────
    // Channel name matches the filter so we can reuse it in Chat.jsx header
    const channel = supabase
      .channel(`messages:match_id=eq.${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (cancelled) return
          setMessages(prev => {
            // Deduplicate: skip if the real ID already exists (handles the case
            // where our optimistic-→-real replacement raced with the RT event)
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [matchId])

  // ── 3. Send with optimistic update ────────────────────────────────────────
  // Returns true on success, false on failure so callers can show error toasts
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || !user || !matchId) return false

    const optimisticId = `optimistic-${Date.now()}`
    const optimistic = {
      id: optimisticId,
      match_id: matchId,
      sender_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, optimistic])

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      // Roll back optimistic message
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      console.error('Send failed:', error)
      return false
    }

    // Replace optimistic with the persisted row.
    // If the RT event already landed first, just drop the optimistic instead.
    setMessages(prev => {
      if (prev.some(m => m.id === data.id)) {
        return prev.filter(m => m.id !== optimisticId)
      }
      return prev.map(m => (m.id === optimisticId ? data : m))
    })
    return true
  }, [user, matchId])

  return { messages, sendMessage, loading }
}
