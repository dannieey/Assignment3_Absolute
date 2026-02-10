import { useEffect, useMemo, useState } from 'react'
import { categoriesApi, productsApi, cartApi, wishlistApi } from '../api'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'

function normalizeId(x) {
  return x?._id || x?.id || x?.categoryId || x?.productId || ''
}

export function ProductsPage({ auth, onCartChanged, onWishlistChanged }) {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')

  const [products, setProducts] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const [wishBusy, setWishBusy] = useState({})

  const categoryOptions = useMemo(() => {
    return [{ id: '', name: 'All categories' }, ...categories.map((c) => ({ id: normalizeId(c), name: c.name }))]
  }, [categories])

  useEffect(() => {
    const t = window.setTimeout(() => setQDebounced(q), 250)
    return () => window.clearTimeout(t)
  }, [q])

  useEffect(() => {
    categoriesApi
      .list()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr('')
    productsApi
      .list({ q: qDebounced, categoryId })
      .then((d) => {
        if (cancelled) return
        setProducts(Array.isArray(d) ? d : [])
      })
      .catch((e2) => {
        if (cancelled) return
        setErr(e2.message || 'Failed to load products')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [qDebounced, categoryId])

  async function addToCart(productId) {
    if (!auth?.isAuthed) {
      toast.push('First login to add products to the cart', { type: 'error' })
      return
    }
    try {
      await cartApi.add(productId, 1)
      toast.push('Added to cart', { type: 'success' })
      onCartChanged?.()
    } catch (e2) {
      toast.push(e2.message || 'Cart error', { type: 'error' })
    }
  }

  async function addToWishlist(productId) {
    if (!auth?.isAuthed) {
      toast.push('Login first to add products to wishlist', { type: 'error' })
      return
    }
    setWishBusy((s) => ({ ...s, [productId]: true }))
    try {
      await wishlistApi.add(productId)
      toast.push('added to wishlist', { type: 'success' })
      onWishlistChanged?.()
    } catch (e2) {
      toast.push(e2.message || 'error wishlist', { type: 'error' })
    } finally {
      setWishBusy((s) => ({ ...s, [productId]: false }))
    }
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-3xl font-extrabold text-slate-900">Catalog</div>
            <div className="mt-2 text-slate-600">GET /products?q=...&categoryId=...</div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <input
            className="px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-200"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categoryOptions.map((c) => (
              <option key={c.id || 'all'} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-slate-500 flex items-center">{loading ? 'Loading…' : `${products.length} items`}</div>
        </div>

        {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p, idx) => {
            const pid = normalizeId(p)
            const id = pid || idx
            return (
              <div key={id} className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col">
                <div className="h-24 rounded-xl bg-slate-50 border border-slate-100" />
                <div className="mt-3 text-xs text-slate-500">{p.categoryName || p.category || ''}</div>
                <div className="font-semibold text-slate-900 leading-tight line-clamp-2 min-h-[40px]">{p.name}</div>
                <div className="mt-2 font-bold text-emerald-700">{p.price != null ? `$${p.price}` : ''}</div>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
                    disabled={!pid}
                    onClick={() => addToCart(pid)}
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
                    disabled={!pid || wishBusy[pid]}
                    onClick={() => addToWishlist(pid)}
                  >
                    Add to wishlist
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && !err && products.length === 0 ? <div className="mt-6 text-slate-600">Ничего не найдено.</div> : null}
      </Container>
    </div>
  )
}
