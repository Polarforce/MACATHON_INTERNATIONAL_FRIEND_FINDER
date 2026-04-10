import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useChat } from '../hooks/useChat'
import { useToast } from '../contexts/ToastContext'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupMessages(messages) {
  // Group consecutive messages from the same sender so we only show
  // the sender label once per run, and the timestamp on the last message.
  const groups = []
  for (const msg of messages) {
    const last = groups[groups.length - 1]
    if (last && last.senderId === msg.sender_id) {
      last.messages.push(msg)
    } else {
      groups.push({ senderId: msg.sender_id, messages: [msg] })
    }
  }
  return groups
}

function Avatar({ profile }) {
  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  if (profile?.photo_url) {
    return (
      <img
        src={profile.photo_url}
        alt={profile.name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-rose-400">{initials}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Chat() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const toast = useToast()
  const { messages, sendMessage, loading } = useChat(matchId)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [otherProfile, setOtherProfile] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ── Load the other person's profile ──────────────────────────────────────
  useEffect(() => {
    if (!matchId || !user) return

    async function loadOther() {
      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single()

      if (!match) return

      const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, photo_url, mode, university, campus')
        .eq('id', otherId)
        .single()

      setOtherProfile(profile)
    }

    loadOther()
  }, [matchId, user])

  // ── Auto-scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send handler ─────────────────────────────────────────────────────────
  async function handleSend() {
    if (!draft.trim() || sending) return
    setSending(true)
    const ok = await sendMessage(draft)
    if (!ok) toast.error('Message failed to send. Try again.')
    else setDraft('')
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const groups = groupMessages(messages)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3 sticky top-0 z-10 flex items-center gap-3">
        <button
          onClick={() => navigate('/matches')}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Back to matches"
        >
          ←
        </button>

        {/* Other person's avatar + name */}
        <Avatar profile={otherProfile} />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-800 truncate">
            {otherProfile?.name ?? 'Loading…'}
          </h2>
          {otherProfile?.university && (
            <p className="text-xs text-gray-400 truncate">{otherProfile.university}</p>
          )}
        </div>

        {/* Schedule meetup */}
        <button
          onClick={() => navigate(`/scheduler/${matchId}`)}
          className="flex-shrink-0 text-xs font-medium text-rose-500 border border-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
        >
          📅 Meetup
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm pt-16">
            <div className="text-3xl mb-2">👋</div>
            <p>You matched! Say hello to {otherProfile?.name ?? 'them'}.</p>
          </div>
        )}

        {groups.map((group, gi) => {
          const isMe = group.senderId === user?.id
          return (
            <div key={gi} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar for other person only */}
              {!isMe && <Avatar profile={otherProfile} />}

              <div className={`flex flex-col gap-1 max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
                {group.messages.map((msg, mi) => {
                  const isLast = mi === group.messages.length - 1
                  const isOptimistic = msg.id?.startsWith('optimistic-')
                  return (
                    <div key={msg.id}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                          ${isMe
                            ? 'bg-rose-500 text-white rounded-tr-sm'
                            : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                          }
                          ${isOptimistic ? 'opacity-70' : ''}`}
                      >
                        {msg.content}
                      </div>
                      {/* Timestamp on last message of each group */}
                      {isLast && (
                        <p className={`text-xs text-gray-400 mt-0.5 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-3">
        <textarea
          ref={inputRef}
          className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent
                     placeholder-gray-400 leading-relaxed"
          placeholder={`Message ${otherProfile?.name ?? ''}…`}
          rows={1}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ maxHeight: '120px', overflowY: draft.split('\n').length > 3 ? 'auto' : 'hidden' }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center
                     text-white hover:bg-rose-600 active:bg-rose-700 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-90">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

    </div>
  )
}
