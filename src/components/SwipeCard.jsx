import { forwardRef, useImperativeHandle, useState, useRef } from 'react'

const SWIPE_THRESHOLD = 80 // px drag distance to commit a swipe

function Avatar({ profile }) {
  if (profile.photo_url) {
    return (
      <img
        src={profile.photo_url}
        alt={profile.name}
        className="w-full h-full object-cover"
        draggable={false}
      />
    )
  }
  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return (
    <div className="w-full h-full flex items-center justify-center bg-rose-100">
      <span className="text-5xl font-bold text-rose-400">{initials}</span>
    </div>
  )
}

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

/**
 * Interactive swipe card.
 *
 * Exposed via ref:
 *   cardRef.current.triggerSwipe('left' | 'right')
 *
 * Calls onSwipe(profileId, direction) after the exit animation finishes.
 */
const SwipeCard = forwardRef(function SwipeCard({ profile, onSwipe }, ref) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [swipeDir, setSwipeDir] = useState(null) // 'left' | 'right' | null
  const startPos = useRef({ x: 0, y: 0 })
  const cardRef = useRef(null)

  // Allow parent to trigger a swipe programmatically (button clicks)
  useImperativeHandle(ref, () => ({
    triggerSwipe(direction) {
      if (swipeDir) return // already animating
      setOffset({ x: 0, y: 0 })
      setSwipeDir(direction)
    },
  }))

  function onPointerDown(e) {
    if (swipeDir) return
    setDragging(true)
    startPos.current = { x: e.clientX, y: e.clientY }
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging) return
    setOffset({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    })
  }

  function onPointerUp() {
    if (!dragging) return
    setDragging(false)
    if (offset.x > SWIPE_THRESHOLD) {
      setSwipeDir('right')
      setOffset({ x: 0, y: 0 })
    } else if (offset.x < -SWIPE_THRESHOLD) {
      setSwipeDir('left')
      setOffset({ x: 0, y: 0 })
    } else {
      setOffset({ x: 0, y: 0 }) // snap back
    }
  }

  function onAnimationEnd() {
    if (swipeDir) onSwipe(profile.id, swipeDir)
  }

  const isAnimating = swipeDir !== null
  const rotation = offset.x * 0.07
  const showLike = !isAnimating && offset.x > 30
  const showNope = !isAnimating && offset.x < -30

  const moveInFormatted = profile.move_in_date
    ? new Date(profile.move_in_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
    : null

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 bg-white rounded-2xl shadow-xl overflow-y-auto
        cursor-grab active:cursor-grabbing select-none
        ${swipeDir === 'right' ? 'swipe-right' : swipeDir === 'left' ? 'swipe-left' : ''}`}
      style={{
        transform: isAnimating
          ? undefined
          : `translateX(${offset.x}px) translateY(${offset.y * 0.3}px) rotate(${rotation}deg)`,
        transition: dragging || isAnimating ? 'none' : 'transform 0.25s ease',
        zIndex: 20,
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onAnimationEnd={onAnimationEnd}
    >
      {/* LIKE / NOPE stamps */}
      {showLike && (
        <div className="absolute top-5 left-5 z-30 border-4 border-green-400 text-green-400 font-black text-xl px-3 py-1 rounded-lg -rotate-12 opacity-90 pointer-events-none">
          LIKE
        </div>
      )}
      {showNope && (
        <div className="absolute top-5 right-5 z-30 border-4 border-rose-500 text-rose-500 font-black text-xl px-3 py-1 rounded-lg rotate-12 opacity-90 pointer-events-none">
          NOPE
        </div>
      )}

      {/* Avatar */}
      <div className="h-56 bg-gray-100 overflow-hidden pointer-events-none flex-shrink-0">
        <Avatar profile={profile} />
      </div>

      {/* Content */}
      <div className="p-5 pointer-events-none">
        {/* Name / age / country */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <h3 className="text-xl font-bold text-gray-800 truncate">{profile.name}</h3>
          <span className="text-gray-500 text-sm flex-shrink-0">{profile.age}</span>
          {profile.home_country && (
            <span className="text-gray-400 text-sm flex-shrink-0 truncate">· {profile.home_country}</span>
          )}
        </div>

        {/* University */}
        <p className="text-sm text-gray-500 mb-3 truncate">
          {profile.university}
          {profile.campus ? ` · ${profile.campus}` : ''}
        </p>

        {/* Mode badge */}
        {profile.mode && (
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${MODE_STYLES[profile.mode] ?? ''}`}>
            {MODE_LABELS[profile.mode] ?? profile.mode}
          </span>
        )}

        {/* Languages */}
        {profile.languages?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {profile.languages.slice(0, 3).map(l => (
              <span key={l} className="tag-pill !text-xs !px-2.5 !py-1">
                🗣 {l}
              </span>
            ))}
            {profile.languages.length > 3 && (
              <span className="tag-pill !text-xs !px-2.5 !py-1 text-gray-400">
                +{profile.languages.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.interests.slice(0, 4).map(i => (
              <span key={i} className="tag-pill !text-xs !px-2.5 !py-1">{i}</span>
            ))}
            {profile.interests.length > 4 && (
              <span className="tag-pill !text-xs !px-2.5 !py-1 text-gray-400">
                +{profile.interests.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Flatmate details */}
        {(profile.mode === 'flatmate' || profile.mode === 'both') && (
          <div className="border-t border-gray-100 pt-3 mt-1 space-y-1 text-sm text-gray-500">
            {profile.budget_min != null && profile.budget_max != null && (
              <p>💰 ${profile.budget_min}–${profile.budget_max}/wk</p>
            )}
            {profile.preferred_suburbs?.length > 0 && (
              <p>
                📍 {profile.preferred_suburbs.slice(0, 2).join(', ')}
                {profile.preferred_suburbs.length > 2 ? ` +${profile.preferred_suburbs.length - 2} more` : ''}
              </p>
            )}
            {moveInFormatted && (
              <p>📅 Available from {moveInFormatted}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export default SwipeCard
