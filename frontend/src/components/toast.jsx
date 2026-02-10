import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext(null)

function genId() {
  return Math.random().toString(36).slice(2)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback((msg, { type = 'info', ttl = 2500 } = {}) => {
    const id = genId()
    const toast = { id, msg, type }
    setToasts((t) => [...t, toast])

    if (ttl > 0) {
      window.setTimeout(() => remove(id), ttl)
    }

    return id
  }, [remove])

  const api = useMemo(() => ({ push, remove }), [push, remove])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed z-[9999] right-4 bottom-4 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "animate-[toastIn_120ms_ease-out] rounded-2xl border bg-white shadow-lg px-4 py-3 text-sm flex items-start justify-between gap-3 " +
              (t.type === 'success'
                ? 'border-emerald-200'
                : t.type === 'error'
                  ? 'border-rose-200'
                  : 'border-slate-200')
            }
          >
            <div className="text-slate-800">{t.msg}</div>
            <button className="text-slate-400 hover:text-slate-700" onClick={() => remove(t.id)} type="button">
              ×
            </button>
          </div>
        ))}
      </div>

      <style>{`@keyframes toastIn{from{transform:translateY(8px);opacity:.0}to{transform:translateY(0);opacity:1}}`}</style>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

