import { useRef } from 'react'

const COUNTRIES = [
  'Afghanistan', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium',
  'Brazil', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic',
  'Denmark', 'Egypt', 'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana',
  'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'South Korea', 'Laos', 'Lebanon', 'Malaysia', 'Mexico', 'Mongolia', 'Morocco',
  'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
  'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia',
  'Saudi Arabia', 'Singapore', 'South Africa', 'Spain', 'Sri Lanka', 'Sweden',
  'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'UAE', 'Ukraine',
  'United Kingdom', 'United States', 'Uzbekistan', 'Venezuela', 'Vietnam',
  'Zimbabwe',
]

export default function Step1BasicProfile({ formData, onChange, onNext }) {
  const fileInputRef = useRef(null)

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    onChange({
      photo_file: file,
      photo_preview: URL.createObjectURL(file),
    })
  }

  const isValid =
    formData.name.trim().length > 0 &&
    formData.age !== '' &&
    parseInt(formData.age) >= 16 &&
    parseInt(formData.age) <= 99 &&
    formData.home_country !== ''

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Tell us about you</h2>
      <p className="text-gray-500 text-sm mb-6">Your name, age, and where you're from.</p>

      {/* Photo upload */}
      <div className="flex flex-col items-center mb-8">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-rose-400 transition-colors overflow-hidden"
        >
          {formData.photo_preview ? (
            <img
              src={formData.photo_preview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-2xl">📷</div>
              <div className="text-xs text-gray-400 mt-1">Add photo</div>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <p className="text-xs text-gray-400 mt-2">Optional — tap to upload</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            className="input-base"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={e => onChange({ name: e.target.value })}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            className="input-base"
            type="number"
            placeholder="Your age"
            min={16}
            max={99}
            value={formData.age}
            onChange={e => onChange({ age: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Home country</label>
          <select
            className="input-base"
            value={formData.home_country}
            onChange={e => onChange({ home_country: e.target.value })}
          >
            <option value="">Select your country</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button className="btn-primary" onClick={onNext} disabled={!isValid}>
          Next →
        </button>
      </div>
    </div>
  )
}
