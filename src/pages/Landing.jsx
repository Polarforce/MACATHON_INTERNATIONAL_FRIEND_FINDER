import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function isEdu(email) {
  return email.toLowerCase().trim().endsWith('.edu')
}

export default function Landing() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  // If already signed in, skip straight to the app
  useEffect(() => {
    if (authLoading) return
    if (!user) return

    supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        navigate(data?.onboarding_complete ? '/top-ten' : '/onboarding', { replace: true })
      })
  }, [user, authLoading])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isEdu(email)) {
      setError('Please use your university .edu email address.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-rose-500 mb-2">UniSwipe</h1>
          <p className="text-gray-500 text-lg">Find your people in Melbourne</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {sent ? (
            // ── Sent state ──
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">
                We sent a sign-in link to{' '}
                <span className="font-medium text-gray-700">{email}</span>.
                Click the link to continue.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-rose-500 hover:text-rose-600 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            // ── Email entry ──
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Get started</h2>
              <p className="text-gray-500 text-sm mb-6">
                Use your university email to sign in or create an account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    className="input-base"
                    type="email"
                    placeholder="you@student.unimelb.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
                </div>

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Sending link…' : 'Send sign-in link'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Only .edu emails accepted — keeping it campus-safe.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-center gap-8 mt-10 text-sm text-gray-400">
          <span>🌏 International students</span>
          <span>🏠 Friends & flatmates</span>
          <span>🎓 Melbourne unis</span>
        </div>
      </div>
    </div>
  )
}
