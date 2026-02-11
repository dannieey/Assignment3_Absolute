import { useEffect, useState } from 'react'
import { Container } from '../components/Container'
import { cartApi, ordersApi } from '../api'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../components/toast'

export function CartPage({ auth }) {
  const toast = useToast()
  const nav = useNavigate()
  const [cart, setCart] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const data = await cartApi.get()
      setCart(data)
    } catch (e2) {
      setErr(e2.message || 'Failed')
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth?.isAuthed) load()
    else {
      setLoading(false)
      setCart(null)
    }
  }, [auth?.isAuthed])

  if (!auth?.isAuthed) {
    return (
      <div className="bg-slate-50">
        <Container className="py-10">
          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="text-3xl font-extrabold text-slate-900">Cart</div>
            <div className="mt-2 text-slate-600">Login first to add to cart</div>
            <Link to="/login" className="inline-block mt-6 px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500">
              Go to Login
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const items = cart?.items || []

  async function checkout() {
    if (items.length === 0) {
      toast.push('Cart is empty', { type: 'error' })
      return
    }

    setCheckingOut(true)
    setErr('')

    try {
      const payloadItems = items.map((it) => ({ productId: it.productId, quantity: it.quantity }))
      const res = await ordersApi.create(payloadItems)

      toast.push('Order is created. ', { type: 'success' })

      await cartApi.clear()
      await load()

      const orderId = res?.id
      if (orderId) nav(`/track?orderId=${encodeURIComponent(orderId)}`)
      else nav('/orders')
    } catch (e2) {
      toast.push(e2.message || 'Couldnt place an order', { type: 'error' })
      setErr(e2.message || 'Failed')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-extrabold text-slate-900">Cart</div>
            <div className="mt-2 text-slate-600">Review items and proceed to checkout.</div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await cartApi.clear()
              toast.push('Cart is cleared', { type: 'success' })
              await load()
            }}
            className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
            disabled={loading || checkingOut}
          >
            Clear
          </button>
        </div>

        {loading ? <div className="mt-6 text-slate-600">Loading…</div> : null}
        {err ? <div className="mt-6 text-sm text-red-600">{err}</div> : null}

        <div className="mt-6 grid gap-3">
          {items.map((it) => (
            <div key={it.productId} className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{it.name}</div>
                <div className="text-sm text-slate-600">{it.price} ₸ × {it.quantity} = {it.subtotal} ₸</div>
                {it.inStock === false ? <div className="text-xs text-red-600">Out of stock</div> : null}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
                  disabled={checkingOut}
                  onClick={async () => {
                    const next = Math.max(1, (it.quantity || 1) - 1)
                    await cartApi.update(it.productId, next)
                    toast.push('Count is updated', { type: 'success' })
                    await load()
                  }}
                >
                  -
                </button>
                <div className="w-10 text-center font-semibold">{it.quantity}</div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
                  disabled={checkingOut}
                  onClick={async () => {
                    const next = (it.quantity || 1) + 1
                    await cartApi.update(it.productId, next)
                    toast.push('Count is updated', { type: 'success' })
                    await load()
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  className="ml-2 px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-60"
                  disabled={checkingOut}
                  onClick={async () => {
                    await cartApi.remove(it.productId)
                    toast.push('Removed from the cart', { type: 'success' })
                    await load()
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && !loading && !err ? (
            <div className="text-slate-600">Cart is empty</div>
          ) : null}
        </div>

        {cart ? (
          <div className="mt-8 rounded-3xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-slate-700">
              <div>Total items: <b>{cart.totalItems}</b></div>
              <div>Total price: <b>{cart.totalPrice} ₸</b></div>
            </div>
            <button
              type="button"
              onClick={checkout}
              disabled={checkingOut || loading || items.length === 0}
              className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {checkingOut ? 'Processing…' : 'Checkout'}
            </button>
          </div>
        ) : null}
      </Container>
    </div>
  )
}
