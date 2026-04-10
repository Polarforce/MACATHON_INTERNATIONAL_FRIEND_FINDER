import { useParams, useNavigate } from 'react-router-dom'

export default function Scheduler() {
  const { matchId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(`/chat/${matchId}`)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">Schedule a Meetup</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming in Phase 5</h2>
        <p className="text-gray-500 mb-8">
          Propose meeting times, pick a spot around Melbourne, and confirm with your match.
        </p>
        <button className="btn-secondary" onClick={() => navigate(`/chat/${matchId}`)}>
          ← Back to chat
        </button>
      </div>
    </div>
  )
}
