import { NavLink } from 'react-router-dom'

function DiscoverIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.518 4.318 1 7.689 1c1.83 0 3.504.804 4.311 2.083C12.796 1.813 14.459 1 16.311 1 19.68 1 23 3.518 23 7.19c0 4.106-5.421 8.862-11 14.403z" />
    </svg>
  )
}

function MatchesIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function ProfileIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const TABS = [
  { to: '/top-ten',  label: 'Discover', Icon: DiscoverIcon },
  { to: '/matches',  label: 'Matches',  Icon: MatchesIcon  },
  { to: '/profile',  label: 'Profile',  Icon: ProfileIcon  },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors
             ${isActive ? 'text-rose-500' : 'text-gray-400 hover:text-gray-500'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
