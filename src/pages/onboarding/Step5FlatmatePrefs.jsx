const SUBURBS = [
  'CBD / City', 'Carlton', 'Fitzroy', 'Collingwood', 'Richmond', 'South Yarra',
  'Prahran / Windsor', 'St Kilda', 'Elwood', 'Port Melbourne', 'Hawthorn',
  'Camberwell', 'Box Hill', 'Clayton', 'Caulfield', 'Glen Waverley',
  'Footscray', 'Sunshine', 'Flemington', 'North Melbourne', 'West Melbourne',
  'Brunswick', 'Coburg', 'Preston', 'Thornbury', 'Northcote', 'Doncaster',
  'Ringwood', 'Dandenong', 'Frankston', 'Bundoora', 'Reservoir', 'Heidelberg',
  'Kew', 'Malvern', 'Glen Iris', 'Abbotsford',
]

const BUDGET_MIN_FLOOR = 100
const BUDGET_MIN_CEIL = 800
const BUDGET_MAX_FLOOR = 100
const BUDGET_MAX_CEIL = 1200
const BUDGET_STEP = 25

function BudgetSlider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-rose-500">${value}/wk</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={BUDGET_STEP}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-rose-500"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  )
}

export default function Step5FlatmatePrefs({ formData, onChange, onNext, onBack, submitting }) {
  function handleMinChange(val) {
    onChange({ budget_min: Math.min(val, formData.budget_max - BUDGET_STEP) })
  }

  function handleMaxChange(val) {
    onChange({ budget_max: Math.max(val, formData.budget_min + BUDGET_STEP) })
  }

  function toggleSuburb(suburb) {
    const current = formData.preferred_suburbs
    onChange({
      preferred_suburbs: current.includes(suburb)
        ? current.filter(s => s !== suburb)
        : [...current, suburb],
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Flatmate preferences</h2>
      <p className="text-gray-500 text-sm mb-6">Help us match you with compatible housemates.</p>

      {/* Budget */}
      <div className="mb-7">
        <label className="block text-sm font-medium text-gray-700 mb-3">Weekly budget</label>
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <BudgetSlider
            label="Minimum"
            value={formData.budget_min}
            min={BUDGET_MIN_FLOOR}
            max={BUDGET_MIN_CEIL}
            onChange={handleMinChange}
          />
          <BudgetSlider
            label="Maximum"
            value={formData.budget_max}
            min={BUDGET_MAX_FLOOR}
            max={BUDGET_MAX_CEIL}
            onChange={handleMaxChange}
          />
          <p className="text-center text-sm text-gray-600">
            Range:{' '}
            <span className="font-semibold text-rose-500">
              ${formData.budget_min} – ${formData.budget_max}/wk
            </span>
          </p>
        </div>
      </div>

      {/* Preferred suburbs */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Preferred areas</label>
          <span className="text-xs text-gray-400">
            {formData.preferred_suburbs.length > 0
              ? `${formData.preferred_suburbs.length} selected`
              : 'Any area'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUBURBS.map(suburb => (
            <button
              key={suburb}
              type="button"
              className={`tag-pill${formData.preferred_suburbs.includes(suburb) ? ' selected' : ''}`}
              onClick={() => toggleSuburb(suburb)}
            >
              {suburb}
            </button>
          ))}
        </div>
      </div>

      {/* Move-in date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Earliest move-in date{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          className="input-base"
          type="date"
          value={formData.move_in_date}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => onChange({ move_in_date: e.target.value })}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext} disabled={submitting}>
          {submitting ? 'Saving profile…' : 'Finish 🎉'}
        </button>
      </div>
    </div>
  )
}
