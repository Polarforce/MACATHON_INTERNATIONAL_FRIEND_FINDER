/**
 * Full-screen overlay shown when a mutual match is detected.
 *
 * Props:
 *   match     — the matched candidate's profile object
 *   onClose   — called when user chooses "Keep swiping"
 *   onMessage — called when user chooses "Send a message"
 */
export default function MatchBanner({ match, onClose, onMessage }) {
  const initials = match.name
    ? match.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-500/90 backdrop-blur-sm px-6">
      <div className="text-center w-full max-w-xs">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white shadow-lg">
          {match.photo_url ? (
            <img src={match.photo_url} alt={match.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-rose-200 flex items-center justify-center">
              <span className="text-3xl font-bold text-rose-500">{initials}</span>
            </div>
          )}
        </div>

        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-2">It's a Match!</h2>
        <p className="text-rose-100 mb-8 leading-relaxed">
          You and <span className="font-semibold text-white">{match.name}</span> both liked each other.
        </p>

        <div className="space-y-3">
          <button
            onClick={onMessage}
            className="w-full bg-white text-rose-500 font-semibold px-6 py-3 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Send a message
          </button>
          <button
            onClick={onClose}
            className="block w-full text-center text-rose-100 hover:text-white text-sm transition-colors py-2 cursor-pointer"
          >
            Keep swiping →
          </button>
        </div>
      </div>
    </div>
  )
}
