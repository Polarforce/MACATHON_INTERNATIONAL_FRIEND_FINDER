import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'

const MODE_STYLES = {
  friend:  'bg-blue-100 text-blue-600',
  flatmate:'bg-amber-100 text-amber-600',
  both:    'bg-purple-100 text-purple-600',
}
const MODE_LABELS = {
  friend:  'Friends',
  flatmate:'Flatmate',
  both:    'Friends & Flatmate',
}

function Avatar({ profile, size = 'md' }) {
  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const sizeClass = size === 'lg'
    ? 'w-16 h-16 text-xl'
    : 'w-12 h-12 text-base'

  if (profile.photo_url) {
    return (
      <img
        src={profile.photo_url}
        alt={profile.name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    )
  }
  return (
    <div className={`${sizeClass} rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-rose-400">{initials}</span>
    </div>
  )
}

export default function Matches() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [matches, setMatches] = useState([]) // [{ matchId, profile }]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      // 1. Fetch all matches involving the current user
      const { data: matchRows, error } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, created_at')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Could not load matches. Please refresh.')
        setLoading(false)
        return
      }

      if (!matchRows?.length) {
        setLoading(false)
        return
      }

      // 2. Collect the other person's ID for each match
      const otherIds = matchRows.map(m =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
      )

      // 3. Batch-fetch their profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url, mode, university, home_country')
        .in('id', otherIds)

      const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

      // 4. Merge
      const enriched = matchRows.map(m => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id
        return {
          matchId: m.id,
          matchedAt: m.created_at,
          profile: profileMap[otherId] ?? { id: otherId, name: 'Unknown' },
        }
      })

      setMatches(enriched)
      setLoading(false)
    }

    load()
  }, [user])

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/top-ten')}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            ← Discover
          </button>
          <h1 className="text-xl font-bold text-gray-800">Matches</h1>
          <span className="text-sm text-gray-400">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 max-w-lg mx-auto pb-24">
        {matches.length === 0 ? (
          // ── Empty state ──
          <div className="flex flex-col items-center justify-center text-center pt-24 px-8">
            <div className="text-5xl mb-4">💫</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No matches yet</h2>
            <p className="text-gray-500 mb-8">
              Keep swiping — your people are out there.
            </p>
            <button className="btn-primary" onClick={() => navigate('/top-ten')}>
              Back to swiping
            </button>
          </div>
        ) : (
          // ── Match list ──
          <div className="space-y-3">
            {matches.map(({ matchId, matchedAt, profile }) => (
              <div
                key={matchId}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
              >
                {/* Avatar */}
                <Avatar profile={profile} size="lg" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{profile.name}</h3>
                    {profile.mode && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${MODE_STYLES[profile.mode] ?? ''}`}>
                        {MODE_LABELS[profile.mode] ?? profile.mode}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {profile.university ?? profile.home_country ?? ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Matched {formatMatchDate(matchedAt)}
                  </p>
                </div>

                {/* Chat button */}
                <button
                  onClick={() => navigate(`/chat/${matchId}`)}
                  className="flex-shrink-0 bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-rose-600 active:bg-rose-700 transition-colors cursor-pointer"
                >
                  Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatMatchDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}
