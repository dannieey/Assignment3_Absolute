import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categoriesApi, productsApi, cartApi, wishlistApi } from '../api'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'

function normalizeId(x) {
  return x?._id || x?.id || x?.categoryId || x?.productId || ''
}

function normalizeImgUrl(u) {
  const s = String(u || '').trim()
  if (!s) return ''
  if (s.startsWith('//')) return window.location.protocol + s
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s
  // fallback
  return s
}

export function ProductsPage({ auth, onCartChanged, onWishlistChanged }) {
  const toast = useToast()
  const [sp, setSp] = useSearchParams()
  const didInitFromUrl = useRef(false)
  const lastSynced = useRef('')

  const [categories, setCategories] = useState([])

  const [categoryId, setCategoryId] = useState('')
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')

  const [products, setProducts] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const [wishBusy, setWishBusy] = useState({})

  // init from URL (runs on first mount and when URL actually changes)
  useEffect(() => {
    const cid = sp.get('categoryId') || ''
    const qq = sp.get('q') || ''

    // on first run, always hydrate state from URL
    if (!didInitFromUrl.current) {
      didInitFromUrl.current = true
      setCategoryId(cid)
      setQ(qq)
      lastSynced.current = sp.toString()
      return
    }

    // if user navigated with back/forward or via link, update state
    const cur = sp.toString()
    if (cur !== lastSynced.current) {
      setCategoryId(cid)
      setQ(qq)
      lastSynced.current = cur
    }
  }, [sp])

  // keep URL in sync with state (after init)
  useEffect(() => {
    if (!didInitFromUrl.current) return

    const next = new URLSearchParams(sp)
    const cid = (categoryId || '').trim()
    const qq = (q || '').trim()

    if (cid) next.set('categoryId', cid)
    else next.delete('categoryId')

    if (qq) next.set('q', qq)
    else next.delete('q')

    const nextStr = next.toString()
    if (nextStr !== sp.toString()) {
      setSp(next, { replace: true })
      lastSynced.current = nextStr
    }
  }, [categoryId, q])

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
            <div className="mt-2 text-slate-600">Find products by category or search.</div>
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
                {(() => {
                  const img = normalizeImgUrl(p.imageUrl || p.imageURL || p.image || '')
                  return img ? (
                    <img
                      src={img}
                      alt={p.name || ''}
                      className="h-24 w-full rounded-xl border border-slate-100 object-cover bg-slate-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-24 rounded-xl bg-slate-50 border border-slate-100" />
                  )
                })()}
                <div className="mt-3 text-xs text-slate-500">{p.categoryName || p.category || ''}</div>
                <div className="font-semibold text-slate-900 leading-tight line-clamp-2 min-h-[40px]">{p.name}</div>
                <div className="mt-2 font-bold text-emerald-700">{p.price != null ? `${p.price} ₸` : ''}</div>
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
