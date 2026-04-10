import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './contexts/ToastContext'
import DemoBanner from './components/DemoBanner'
import BottomNav from './components/BottomNav'
import Landing from './pages/Landing'
import OTPVerify from './pages/OTPVerify'
import OnboardingFlow from './pages/onboarding/OnboardingFlow'
import TopTen from './pages/TopTen'
import Swipe from './pages/Swipe'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Scheduler from './pages/Scheduler'
import Profile from './pages/Profile'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// Routes that show the bottom nav bar
const NAV_PATHS = ['/top-ten', '/swipe', '/matches', '/profile']

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return children
}

function AppShell() {
  const location = useLocation()
  const showNav = NAV_PATHS.includes(location.pathname)

  return (
    <>
      {DEMO_MODE && <DemoBanner />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<OTPVerify />} />
        <Route
          path="/onboarding"
          element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>}
        />
        <Route
          path="/top-ten"
          element={<ProtectedRoute><TopTen /></ProtectedRoute>}
        />
        <Route
          path="/swipe"
          element={<ProtectedRoute><Swipe /></ProtectedRoute>}
        />
        <Route
          path="/matches"
          element={<ProtectedRoute><Matches /></ProtectedRoute>}
        />
        <Route
          path="/chat/:matchId"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
        <Route
          path="/scheduler/:matchId"
          element={<ProtectedRoute><Scheduler /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}
