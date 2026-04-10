import { createContext, useContext, useState, useCallback } from 'react'
import ToastContainer from '../components/Toast'

const ToastContext = createContext(null)

let _nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    // Mark as removing first so the exit animation plays
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320)
  }, [])

  const add = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = _nextId++
    setToasts(prev => [...prev.slice(-2), { id, message, type, removing: false }])
    setTimeout(() => remove(id), duration)
    return id
  }, [remove])

  const toast = {
    success: (message) => add({ message, type: 'success' }),
    error:   (message) => add({ message, type: 'error', duration: 5000 }),
    match:   (name)    => add({ message: `🎉 It's a match with ${name}!`, type: 'match', duration: 6000 }),
    info:    (message) => add({ message, type: 'info' }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
