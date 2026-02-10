import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { wishlistApi } from '../api'

export function WishlistPage({ auth }) {
  const [wishlist, setWishlist] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const data = await wishlistApi.get()
      setWishlist(data)
    } catch (e2) {
      setErr(e2.message || 'Failed')
      setWishlist(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth?.isAuthed) load()
    else {
      setLoading(false)
      setWishlist(null)
    }
  }, [auth?.isAuthed])

  if (!auth?.isAuthed) {
    return (
      <div className="bg-slate-50">
        <Container className="py-10">
          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="text-3xl font-extrabold text-slate-900">Wishlist</div>
            <div className="mt-2 text-slate-600">Нужно залогиниться, чтобы смотреть избранное.</div>
            <Link to="/login" className="inline-block mt-6 px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500">
              Go to Login
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const items = wishlist?.items || wishlist || []
  const arr = Array.isArray(items) ? items : []

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="text-3xl font-extrabold text-slate-900">Wishlist</div>
        <div className="mt-2 text-slate-600">GET/POST/DELETE /wishlist</div>

        {loading ? <div className="mt-6 text-slate-600">Loading…</div> : null}
        {err ? <div className="mt-6 text-sm text-red-600">{err}</div> : null}

        <div className="mt-6 grid gap-3">
          {arr.map((it, idx) => (
            <div key={it.productId || it._id || idx} className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate">{it.name || it.productName || 'Item'}</div>
                {it.price != null ? <div className="text-sm text-slate-600">${it.price}</div> : null}
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                onClick={async () => {
                  const pid = it.productId || it._id
                  if (!pid) return
                  await wishlistApi.remove(pid)
                  await load()
                }}
              >
                Remove
              </button>
            </div>
          ))}
          {arr.length === 0 && !loading && !err ? <div className="text-slate-600">Wishlist пустой.</div> : null}
        </div>
      </Container>
    </div>
  )
}
