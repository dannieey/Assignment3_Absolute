import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ordersApi } from '../api'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'
import { OrderTrackingCard } from '../components/OrderTrackingCard'

export function TrackOrderPage() {
  const toast = useToast()
  const [sp] = useSearchParams()

  const [orderId, setOrderId] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fromQs = sp.get('orderId') || ''
    if (fromQs) setOrderId(fromQs)
  }, [sp])

  async function doTrack(id) {
    const trimmed = (id || '').trim()
    if (!trimmed) return

    setErr('')
    setResult(null)
    setLoading(true)
    try {
      const data = await ordersApi.tracking(trimmed)
      setResult(data)
      toast.push('Tracking updated', { type: 'success' })
    } catch (e2) {
      setErr(e2.message || 'Failed')
      toast.push(e2.message || 'Couldnt get tracking', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    await doTrack(orderId)
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="max-w-2xl">
          <div className="text-3xl font-extrabold text-slate-900">Track Order</div>
          <div className="mt-2 text-slate-600">Введи orderId, чтобы увидеть статус и историю.</div>

          <form className="mt-6 flex gap-2" onSubmit={onSubmit}>
            <input
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <button
              className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
              disabled={!orderId || loading}
            >
              {loading ? 'Loading…' : 'Track'}
            </button>
          </form>

          <div className="mt-3 text-xs text-slate-500">
            JWT is needed. <code>token</code>.
          </div>

          {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}
          {result ? <OrderTrackingCard tracking={result} /> : null}
        </div>
      </Container>
    </div>
  )
}
