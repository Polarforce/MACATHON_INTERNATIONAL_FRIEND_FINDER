/**
 * Shown when VITE_DEMO_MODE=true so judges know it's a hackathon demo.
 * Sticky at the top of the page flow — no fixed positioning needed because
 * App.jsx renders this before the route outlet, so pages naturally start below it.
 */
export default function DemoBanner() {
  return (
    <div className="sticky top-0 z-50 bg-rose-500 text-white text-center text-xs font-semibold py-2 px-4 tracking-wide select-none">
      🏆 MACathon Demo &nbsp;·&nbsp; UniSwipe &nbsp;·&nbsp; International Friend Finder
    </div>
  )
}
