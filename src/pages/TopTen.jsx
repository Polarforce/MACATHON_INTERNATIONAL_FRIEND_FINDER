import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'
import { rankCandidates } from '../lib/matching'
import SwipeCard from '../components/SwipeCard'
import MatchBanner from '../components/MatchBanner'

async function fetchViewerAndQueue(userId) {
  // 1. Viewer profile
  const { data: viewer, error: viewerErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (viewerErr || !viewer) return { viewer: null, queue: [] }

  // 2. Already-swiped IDs
  const { data: swipes } = await supabase
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', userId)

  const swipedIds = swipes?.map(s => s.swiped_id) ?? []

  // 3. Fetch 100 candidates (server-side excludes self + already swiped)
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('onboarding_complete', true)
    .neq('id', userId)
    .limit(100)

  if (swipedIds.length > 0) {
    query = query.not('id', 'in', `(${swipedIds.join(',')})`)
  }

  const { data: candidates } = await query

  // 4. Score + rank client-side, keep top 10
  const ranked = rankCandidates(viewer, candidates ?? [])
  const queue = ranked.slice(0, 10).map(r => r.profile)

  return { viewer, queue }
}

export default function TopTen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [viewer, setViewer] = useState(null)
  const [queue, setQueue] = useState([])
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const topCardRef = useRef(null)

  useEffect(() => {
    if (!user) return
    fetchViewerAndQueue(user.id).then(({ viewer, queue }) => {
      if (!viewer) toast.error('Could not load your profile. Please refresh.')
      setViewer(viewer)
      setQueue(queue)
      setLoading(false)
    })
  }, [user])

  async function handleSwipe(profileId, direction) {
    // Remove card from deck immediately
    setQueue(q => q.filter(p => p.id !== profileId))

    // Persist swipe
    await supabase.from('swipes').insert({
      swiper_id: user.id,
      swiped_id: profileId,
      direction,
    })

    if (direction !== 'right') return

    // Check for mutual right-swipe
    const { data: reverse } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_id', profileId)
      .eq('swiped_id', user.id)
      .eq('direction', 'right')
      .maybeSingle()

    if (reverse) {
      // Write match record (ignore conflict if trigger already created it)
      await supabase.from('matches').upsert(
        {
          user1_id: user.id < profileId ? user.id : profileId,
          user2_id: user.id < profileId ? profileId : user.id,
        },
        { ignoreDuplicates: true }
      )
      const matched = queue.find(p => p.id === profileId)
      if (matched) {
        setMatch(matched)
        toast.match(matched.name)
      }
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  // ── Empty / exhausted ──
  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {loading ? '' : 'You\'ve seen your top matches!'}
        </h2>
        <p className="text-gray-500 mb-8">Browse the full pool to find even more people.</p>
        <button className="btn-primary" onClick={() => navigate('/swipe')}>
          See everyone →
        </button>
      </div>
    )
  }

  // ── Main deck ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-rose-500">Your Top 10</h1>
        <button
          onClick={() => navigate('/swipe')}
          className="text-sm text-gray-500 hover:text-rose-500 transition-colors font-medium"
        >
          See everyone →
        </button>
      </div>
      <p className="px-6 text-xs text-gray-400 mb-4">
        {queue.length} match{queue.length !== 1 ? 'es' : ''} remaining — ranked by compatibility
      </p>

      {/* Card deck */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative w-full max-w-sm h-[520px]">
          {/* Background stack (visual only) */}
          {queue.slice(1, 3).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 bg-white rounded-2xl shadow-md"
              style={{
                transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * -10}px)`,
                zIndex: 10 - i,
              }}
            />
          ))}

          {/* Interactive top card */}
          <SwipeCard
            key={queue[0].id}
            ref={topCardRef}
            profile={queue[0]}
            onSwipe={handleSwipe}
          />
        </div>
      </div>

      {/* Action buttons — pb-24 clears the fixed BottomNav (64px) */}
      <div className="flex justify-center items-center gap-8 pb-24 pt-4">
        <button
          onClick={() => topCardRef.current?.triggerSwipe('left')}
          className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-2xl text-rose-400 hover:scale-110 active:scale-95 transition-transform"
          aria-label="Pass"
        >
          ✕
        </button>
        <button
          onClick={() => topCardRef.current?.triggerSwipe('right')}
          className="w-16 h-16 rounded-full bg-rose-500 shadow-md flex items-center justify-center text-2xl text-white hover:scale-110 active:scale-95 transition-transform"
          aria-label="Like"
        >
          ♥
        </button>
      </div>

      {/* Match banner */}
      {match && (
        <MatchBanner
          match={match}
          onClose={() => setMatch(null)}
          onMessage={() => {
            setMatch(null)
            navigate('/matches') // Phase 4
          }}
        />
      )}
    </div>
  )
}
