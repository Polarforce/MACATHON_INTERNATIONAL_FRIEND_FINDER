import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'

// ── Constants ─────────────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

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

// ── Main component ─────────────────────────────────────────────────────────────

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState([])
  const [languages, setLanguages] = useState([])
  const [photoUrl, setPhotoUrl] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('name, bio, interests, languages, photo_url')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          toast.error('Could not load profile.')
        } else if (data) {
          setName(data.name ?? '')
          setBio(data.bio ?? '')
          setInterests(data.interests ?? [])
          setLanguages(data.languages ?? [])
          setPhotoUrl(data.photo_url ?? null)
        }
        setLoading(false)
      })
  }, [user])

  // ── Photo ────────────────────────────────────────────────────────────────────
  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  // ── Toggle helpers ────────────────────────────────────────────────────────────
  function toggleInterest(item) {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  function toggleLanguage(item) {
    setLanguages(prev =>
      prev.includes(item) ? prev.filter(l => l !== item) : [...prev, item]
    )
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!user) return
    setSaving(true)

    let newPhotoUrl = photoUrl

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, photoFile, { upsert: true })

      if (uploadError) {
        toast.error('Photo upload failed. Changes saved without new photo.')
      } else {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        newPhotoUrl = publicUrl
        setPhotoUrl(newPhotoUrl)
        setPhotoFile(null)
      }
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      bio: bio.trim(),
      interests,
      languages,
      photo_url: newPhotoUrl,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)

    if (error) {
      toast.error('Save failed. Please try again.')
    } else {
      toast.success('Profile updated!')
    }
  }

  // ── Sign out ──────────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  const displayPhoto = photoPreview ?? photoUrl
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl
                       hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors cursor-pointer"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 max-w-lg mx-auto pb-28">

        {/* Photo + name */}
        <Section title="About you">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center flex-shrink-0 border-2 border-dashed border-rose-300 hover:border-rose-500 transition-colors"
            >
              {displayPhoto ? (
                <img src={displayPhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-rose-400">{initials}</span>
              )}
            </button>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Profile photo</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
              >
                {displayPhoto ? 'Change photo' : 'Upload photo'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="input-base"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              className="input-base resize-none"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A little about yourself — where you're from, what you study, what you're looking for…"
              maxLength={280}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/280</p>
          </div>
        </Section>

        {/* Interests */}
        <Section title={`Interests${interests.length > 0 ? ` · ${interests.length} selected` : ''}`}>
          <TagGroup items={INTERESTS} selected={interests} onToggle={toggleInterest} />
        </Section>

        {/* Languages */}
        <Section title={`Languages${languages.length > 0 ? ` · ${languages.length} selected` : ''}`}>
          <TagGroup items={LANGUAGES} selected={languages} onToggle={toggleLanguage} />
        </Section>

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Account</h3>
          <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="w-full text-center text-sm font-semibold text-rose-500 border border-rose-200 py-3 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>

      </div>
    </div>
  )
}
