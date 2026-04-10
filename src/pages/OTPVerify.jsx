import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function OTPVerify() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const email = sessionStorage.getItem('otpEmail') || ''

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    // Check if onboarding is already complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (profile?.onboarding_complete) {
      navigate('/top-ten')
    } else {
      navigate('/onboarding')
    }
  }

  async function handleResend() {
    if (!email) return
    await supabase.auth.signInWithOtp({ email })
    setResent(true)
    setTimeout(() => setResent(false), 4000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-rose-500 mb-2">UniSwipe</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-gray-700">{email || 'your email'}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              className="input-base text-center text-2xl tracking-[0.5em] font-mono"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />

            {error && <p className="text-rose-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || code.length < 6}
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </form>

          <button
            onClick={handleResend}
            className="w-full text-center text-sm text-gray-400 hover:text-rose-500 mt-4 transition-colors"
          >
            {resent ? '✓ Code resent!' : 'Resend code'}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors w-full"
        >
          ← Use a different email
        </button>
      </div>
    </div>
  )
}
