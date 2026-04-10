import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function isEduAu(email) {
  return email.toLowerCase().trim().endsWith('.edu.au')
}

export default function Landing() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isEduAu(email)) {
      setError('Please use your university .edu.au email address.')
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

    sessionStorage.setItem('otpEmail', email.trim())
    navigate('/verify')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-rose-500 mb-2">UniSwipe</h1>
          <p className="text-gray-500 text-lg">Find your people in Melbourne</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Get started</h2>
          <p className="text-gray-500 text-sm mb-6">
            Use your university email to sign in or create an account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                className="input-base"
                type="email"
                placeholder="you@student.unimelb.edu.au"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending code…' : 'Send verification code'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Only .edu.au emails accepted — keeping it campus-safe.
          </p>
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
