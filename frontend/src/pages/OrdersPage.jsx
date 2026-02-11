import { useEffect, useState } from 'react'
import { Container } from '../components/Container'
import { apiRequest } from '../api'

export function OrdersPage({ auth }) {
  const [orders, setOrders] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setErr('')
      try {
        const data = await apiRequest('/orders/history', { auth: true })
        if (!cancelled) setOrders(Array.isArray(data) ? data : [])
      } catch (e2) {
        if (!cancelled) setErr(e2.message || 'Failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (auth?.isAuthed) load()
    else {
      setLoading(false)
      setOrders([])
    }

    return () => {
      cancelled = true
    }
  }, [auth?.isAuthed])

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="text-3xl font-extrabold text-slate-900">My orders</div>
        <div className="mt-2 text-slate-600">Your order history and statuses.</div>

        {!auth?.isAuthed ? <div className="mt-6 text-slate-600">Нужно залогиниться.</div> : null}
        {loading ? <div className="mt-6 text-slate-600">Loading…</div> : null}
        {err ? <div className="mt-6 text-sm text-red-600">{err}</div> : null}

        <div className="mt-6 grid gap-3">
          {orders.map((o, idx) => (
            <div key={o._id || o.id || idx} className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="font-semibold text-slate-900">Order: {o._id || o.id}</div>
              <div className="text-sm text-slate-600">Status: {o.status}</div>
              {Array.isArray(o.items) ? <div className="text-sm text-slate-600">Items: {o.items.length}</div> : null}
            </div>
          ))}
          {orders.length === 0 && auth?.isAuthed && !loading && !err ? (
            <div className="text-slate-600">Пока заказов нет.</div>
          ) : null}
        </div>
      </Container>
    </div>
  )
}
