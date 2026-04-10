const UNIVERSITIES = [
  {
    name: 'University of Melbourne',
    campuses: ['Parkville', 'Southbank', 'Burnley', 'Dookie', 'Werribee', 'Creswick'],
  },
  {
    name: 'Monash University',
    campuses: ['Clayton', 'Caulfield', 'Peninsula', 'Parkville', 'City (Monash)'],
  },
  {
    name: 'RMIT University',
    campuses: ['City', 'Bundoora', 'Brunswick'],
  },
  {
    name: 'Deakin University',
    campuses: ['Melbourne Burwood', 'Geelong Waurn Ponds', 'Geelong Waterfront', 'Warrnambool'],
  },
  {
    name: 'La Trobe University',
    campuses: ['Melbourne (Bundoora)', 'Bendigo', 'Albury-Wodonga', 'Mildura', 'Shepparton', 'City (Franklin St)'],
  },
  {
    name: 'Swinburne University',
    campuses: ['Hawthorn', 'Croydon', 'Wantirna', 'City (Swinburne)'],
  },
  {
    name: 'Victoria University',
    campuses: ['City Flinders', 'City Queen', 'Footscray Park', 'Footscray Nicholson', 'Sunshine', 'St Albans', 'Werribee (VU)'],
  },
  {
    name: 'Australian Catholic University',
    campuses: ["Melbourne (St Patrick's)"],
  },
  {
    name: 'Federation University',
    campuses: ['Ballarat', 'Gippsland', 'Berwick'],
  },
]

export default function Step2University({ formData, onChange, onNext, onBack }) {
  const selectedUni = UNIVERSITIES.find(u => u.name === formData.university)

  function handleUniChange(e) {
    // Reset campus when uni changes
    onChange({ university: e.target.value, campus: '' })
  }

  const isValid = formData.university && formData.campus

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Your university</h2>
      <p className="text-gray-500 text-sm mb-6">Where are you studying in Melbourne?</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
          <select
            className="input-base"
            value={formData.university}
            onChange={handleUniChange}
          >
            <option value="">Select your university</option>
            {UNIVERSITIES.map(u => (
              <option key={u.name} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>

        {selectedUni && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
            <select
              className="input-base"
              value={formData.campus}
              onChange={e => onChange({ campus: e.target.value })}
            >
              <option value="">Select campus</option>
              {selectedUni.campuses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Residence hall{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className="input-base"
            type="text"
            placeholder="e.g. Trinity College, University House, Mannix…"
            value={formData.residence_hall}
            onChange={e => onChange({ residence_hall: e.target.value })}
          />
        </div>
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
