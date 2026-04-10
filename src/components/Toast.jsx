const TYPE_STYLES = {
  success: 'bg-green-500 text-white',
  error:   'bg-rose-600 text-white',
  match:   'bg-rose-500 text-white',
  info:    'bg-gray-800 text-white',
}

const ICONS = {
  success: '✓',
  error:   '✕',
  match:   '🎉',
  info:    'ℹ',
}

function Toast({ id, message, type, removing, onDismiss }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg
        max-w-sm w-full pointer-events-auto cursor-pointer
        ${TYPE_STYLES[type] ?? TYPE_STYLES.info}
        ${removing ? 'toast-exit' : 'toast-enter'}`}
      onClick={() => onDismiss(id)}
      role="alert"
    >
      <span className="flex-shrink-0 font-bold text-sm mt-0.5">{ICONS[type]}</span>
      <p className="text-sm font-medium leading-snug">{message}</p>
    </div>
  )
}

/**
 * Renders at the bottom of the viewport, above the bottom nav.
 * Sits inside the ToastProvider — no separate mount needed.
 */
export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map(t => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
