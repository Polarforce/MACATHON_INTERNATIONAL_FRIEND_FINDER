import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Step1BasicProfile from './Step1BasicProfile'
import Step2University from './Step2University'
import Step3InterestsLanguages from './Step3InterestsLanguages'
import Step4ModeSelection from './Step4ModeSelection'
import Step5FlatmatePrefs from './Step5FlatmatePrefs'

const initialData = {
  // Step 1
  name: '',
  age: '',
  home_country: '',
  photo_file: null,
  photo_preview: null,
  // Step 2
  university: '',
  campus: '',
  residence_hall: '',
  // Step 3
  interests: [],
  languages: [],
  // Step 4
  mode: '',
  // Step 5
  budget_min: 200,
  budget_max: 600,
  preferred_suburbs: [],
  move_in_date: '',
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(initialData)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  function updateData(updates) {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Step 5 is only shown for flatmate or both modes
  function totalSteps() {
    return formData.mode === 'friend' ? 4 : 5
  }

  function nextStep() {
    if (step < totalSteps()) {
      setStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }

  function prevStep() {
    if (step > 1) setStep(s => s - 1)
  }

  async function handleSubmit() {
    setSubmitting(true)

    let photo_url = null

    if (formData.photo_file) {
      const ext = formData.photo_file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, formData.photo_file, { upsert: true })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(path)
        photo_url = publicUrl
      }
    }

    const payload = {
      id: user.id,
      name: formData.name.trim(),
      age: parseInt(formData.age),
      home_country: formData.home_country,
      photo_url,
      university: formData.university,
      campus: formData.campus,
      residence_hall: formData.residence_hall || null,
      interests: formData.interests,
      languages: formData.languages,
      mode: formData.mode,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    }

    if (formData.mode !== 'friend') {
      payload.budget_min = formData.budget_min
      payload.budget_max = formData.budget_max
      payload.preferred_suburbs = formData.preferred_suburbs
      payload.move_in_date = formData.move_in_date || null
    }

    const { error } = await supabase.from('profiles').upsert(payload)
    setSubmitting(false)

    if (error) {
      console.error('Profile save error:', error)
      alert('Something went wrong saving your profile. Please try again.')
      return
    }

    navigate('/top-ten')
  }

  const total = totalSteps()

  const stepProps = {
    formData,
    onChange: updateData,
    onNext: nextStep,
    onBack: prevStep,
    isFirst: step === 1,
    isLast: step === total,
    submitting,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-rose-500">UniSwipe</h1>
          <p className="text-gray-400 text-sm mt-1">
            Step {step} of {total}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-8">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 1 && <Step1BasicProfile {...stepProps} />}
          {step === 2 && <Step2University {...stepProps} />}
          {step === 3 && <Step3InterestsLanguages {...stepProps} />}
          {step === 4 && <Step4ModeSelection {...stepProps} />}
          {step === 5 && <Step5FlatmatePrefs {...stepProps} />}
        </div>
      </div>
    </div>
  )
}
