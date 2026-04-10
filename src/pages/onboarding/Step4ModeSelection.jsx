const MODES = [
  {
    id: 'friend',
    emoji: '👋',
    title: 'Friends',
    description: 'Meet new people, find your crew, and explore Melbourne together.',
  },
  {
    id: 'flatmate',
    emoji: '🏠',
    title: 'Flatmate',
    description: 'Find someone to share a place with — compatible lifestyles matter.',
  },
  {
    id: 'both',
    emoji: '✨',
    title: 'Both',
    description: 'Open to making friends and finding a flatmate at the same time.',
  },
]

export default function Step4ModeSelection({ formData, onChange, onNext, onBack }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">What are you looking for?</h2>
      <p className="text-gray-500 text-sm mb-6">You can always change this later in settings.</p>

      <div className="space-y-3">
        {MODES.map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange({ mode: mode.id })}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
              formData.mode === mode.id
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-rose-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{mode.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{mode.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">{mode.description}</div>
              </div>
              {formData.mode === mode.id && (
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!formData.mode}>
          {formData.mode === 'friend' ? 'Finish →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
