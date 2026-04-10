const INTERESTS = [
  'Coffee & Cafes', 'Cooking', 'Travel', 'Photography', 'Music', 'Dancing',
  'Gaming', 'Reading', 'Movies & TV', 'Art & Design', 'Hiking', 'Running',
  'Gym & Fitness', 'Yoga', 'Swimming', 'Soccer', 'Basketball', 'Tennis',
  'Badminton', 'Cricket', 'AFL', 'Volleyball', 'Cycling', 'Skateboarding',
  'Rock Climbing', 'Surfing', 'Study Groups', 'Research', 'Volunteering',
  'Language Exchange', 'Cultural Events', 'Karaoke', 'Board Games', 'Anime',
  'Podcasts', 'Meditation', 'Fashion', 'Sustainability', 'Entrepreneurship',
  'Nightlife', 'Farmers Markets', 'Thrifting', 'Baking', 'Camping',
]

const LANGUAGES = [
  'English', 'Mandarin', 'Cantonese', 'Hindi', 'Japanese', 'Korean',
  'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Arabic', 'Spanish',
  'French', 'Portuguese', 'German', 'Italian', 'Dutch', 'Swedish',
  'Tamil', 'Bengali', 'Urdu', 'Punjabi', 'Nepali', 'Sinhala',
  'Tagalog', 'Khmer', 'Burmese', 'Russian', 'Ukrainian', 'Polish',
  'Greek', 'Turkish', 'Persian', 'Swahili', 'Amharic',
]

const MIN_INTERESTS = 3

function TagGroup({ items, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button
          key={item}
          type="button"
          className={`tag-pill${selected.includes(item) ? ' selected' : ''}`}
          onClick={() => onToggle(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export default function Step3InterestsLanguages({ formData, onChange, onNext, onBack }) {
  function toggleInterest(item) {
    const current = formData.interests
    onChange({
      interests: current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item],
    })
  }

  function toggleLanguage(item) {
    const current = formData.languages
    onChange({
      languages: current.includes(item)
        ? current.filter(l => l !== item)
        : [...current, item],
    })
  }

  const interestCount = formData.interests.length
  const languageCount = formData.languages.length
  const isValid = interestCount >= MIN_INTERESTS && languageCount >= 1

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Interests & languages</h2>
      <p className="text-gray-500 text-sm mb-6">
        Pick at least {MIN_INTERESTS} interests and 1 language.
      </p>

      {/* Interests */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Interests</label>
          <span className={`text-xs font-medium ${interestCount >= MIN_INTERESTS ? 'text-rose-500' : 'text-gray-400'}`}>
            {interestCount >= MIN_INTERESTS
              ? `${interestCount} selected ✓`
              : `${interestCount} selected — need ${MIN_INTERESTS - interestCount} more`}
          </span>
        </div>
        <TagGroup items={INTERESTS} selected={formData.interests} onToggle={toggleInterest} />
      </div>

      {/* Languages */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Languages you speak</label>
          <span className={`text-xs font-medium ${languageCount >= 1 ? 'text-rose-500' : 'text-gray-400'}`}>
            {languageCount >= 1 ? `${languageCount} selected ✓` : 'Select at least 1'}
          </span>
        </div>
        <TagGroup items={LANGUAGES} selected={formData.languages} onToggle={toggleLanguage} />
      </div>

      <div className="flex justify-between mt-8">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!isValid}>
          Next →
        </button>
      </div>
    </div>
  )
}
