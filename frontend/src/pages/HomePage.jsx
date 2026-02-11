import { useEffect, useMemo, useState } from 'react'
import { categoriesApi, productsApi, cartApi, wishlistApi } from '../api'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'
import { Link } from 'react-router-dom'

function Pill({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        active
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
      }`}
    >
      {children}
    </button>
  )
}

function CategoryCard({ name, items, color, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-5 border transition ${
        active ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-100'
      } bg-gradient-to-br ${color}`}
    >
      <div className="h-16 w-16 rounded-2xl bg-white/70 border border-white grid place-items-center text-2xl">🥗</div>
      <div className="mt-4 font-semibold text-slate-900">{name}</div>
      <div className="text-sm text-slate-600">{items} items</div>
    </button>
  )
}

function ProductCard({ name, category, price, oldPrice, onAddToCart, onAddToWishlist, wishlistLoading, imageUrl }) {
  return (
    <div className="group rounded-2xl bg-white border border-slate-100 overflow-hidden hover:shadow-md transition">
      <div className="p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-28 w-full rounded-xl border border-slate-100 object-cover bg-slate-50"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="h-28 rounded-xl bg-slate-50 border border-slate-100" />
        )}
        <div className="mt-3 text-xs text-slate-500">{category}</div>
        <div className="font-semibold text-slate-900 leading-tight line-clamp-2 min-h-[40px]">{name}</div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="flex items-end gap-2">
            <div className="text-emerald-700 font-bold">{price != null ? `${price} ₸` : ''}</div>
            {oldPrice ? <div className="text-xs text-slate-400 line-through">{oldPrice} ₸</div> : null}
          </div>
          <button
            type="button"
            disabled={wishlistLoading}
            onClick={onAddToWishlist}
            className="h-9 w-9 grid place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
            title="Add to wishlist"
          >
            ♥
          </button>
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          className="mt-3 w-full py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

function normalizeId(x) {
  return x?._id || x?.id || x?.categoryId || x?.productId || ''
}

function SmallListItem({ p, busy, onAddToCart, onAddToWishlist }) {
  const img = p?.imageUrl || p?.imageURL || p?.image || ''
  return (
    <div className="flex items-center gap-3 group">
      {img ? (
        <img
          src={img}
          alt={p?.name || ''}
          className="h-12 w-12 rounded-xl border border-slate-100 object-cover bg-slate-50 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900 truncate">{p?.name || 'Unnamed'}</div>
        <div className="text-sm text-emerald-700 font-bold">{p?.price != null ? `${p.price} ₸` : ''}</div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          type="button"
          className="px-2 py-1 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
          onClick={onAddToCart}
          disabled={!p?._id || busy}
          title="Add to cart"
        >
          +Cart
        </button>
        <button
          type="button"
          className="px-2 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"
          onClick={onAddToWishlist}
          disabled={!p?._id || busy}
          title="Add to wishlist"
        >
          ♥
        </button>
      </div>
    </div>
  )
}

export function HomePage({ searchQuery, auth, onCartChanged, onWishlistChanged }) {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [categoriesErr, setCategoriesErr] = useState('')

  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [featuredCategoryId, setFeaturedCategoryId] = useState('')

  const [products, setProducts] = useState([])
  const [productsErr, setProductsErr] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [wishBusy, setWishBusy] = useState({})

  // bottom lists data
  const [bottomProducts, setBottomProducts] = useState([])
  const [bottomErr, setBottomErr] = useState('')

  const [subscribeEmail, setSubscribeEmail] = useState('')

  const pills = useMemo(() => {
    const top = categories.slice(0, 4)
    return [{ id: '', name: 'All' }, ...top.map((c) => ({ id: normalizeId(c), name: c.name }))]
  }, [categories])

  useEffect(() => {
    categoriesApi
      .list()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch((e) => setCategoriesErr(e.message || 'Failed to load categories'))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingProducts(true)
    setProductsErr('')

    productsApi
      .list({ q: searchQuery || '', categoryId: featuredCategoryId })
      .then((d) => {
        if (cancelled) return
        setProducts(Array.isArray(d) ? d : [])
      })
      .catch((e) => {
        if (cancelled) return
        setProductsErr(e.message || 'Failed to load products')
      })
      .finally(() => {
        if (cancelled) return
        setLoadingProducts(false)
      })

    return () => {
      cancelled = true
    }
  }, [featuredCategoryId, searchQuery])

  useEffect(() => {
    let cancelled = false
    setBottomErr('')
    productsApi
      .list({ q: '', categoryId: '' })
      .then((d) => {
        if (cancelled) return
        setBottomProducts(Array.isArray(d) ? d : [])
      })
      .catch((e2) => {
        if (cancelled) return
        setBottomErr(e2.message || 'Failed to load products')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const bottomGroups = useMemo(() => {
    const arr = Array.isArray(bottomProducts) ? bottomProducts : []

    const topSells = arr.slice(0, 4)
    const topRated = [...arr].slice().reverse().slice(0, 4)
    const trending = [...arr].slice().sort((a, b) => (b?.price || 0) - (a?.price || 0)).slice(0, 4)
    const recentlyAdded = arr.slice(-4).reverse()

    return [
      { title: 'Top Sells', items: topSells },
      { title: 'Top Rated', items: topRated },
      { title: 'Trending Items', items: trending },
      { title: 'Recently Added', items: recentlyAdded },
    ]
  }, [bottomProducts])

  const categoryColor = (i) => {
    const colors = [
      'from-orange-50 to-orange-100',
      'from-emerald-50 to-emerald-100',
      'from-pink-50 to-pink-100',
      'from-red-50 to-red-100',
      'from-amber-50 to-amber-100',
      'from-teal-50 to-teal-100',
    ]
    return colors[i % colors.length]
  }

  async function addToCart(productId) {
    if (!auth?.isAuthed) {
      toast.push('Login first to add to cart', { type: 'error' })
      return
    }
    try {
      await cartApi.add(productId, 1)
      toast.push('added to cart', { type: 'success' })
      onCartChanged?.()
    } catch (e2) {
      toast.push(e2.message || 'cart error', { type: 'error' })
    }
  }

  async function addToWishlist(productId) {
    if (!auth?.isAuthed) {
      toast.push('Login first to add to wishlist', { type: 'error' })
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

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())
  }

  function handleSubscribe() {
    const v = String(subscribeEmail || '').trim()
    if (!isValidEmail(v)) {
      toast.push('Enter a valid email', { type: 'error' })
      return
    }
    toast.push('Subscribed successfully', { type: 'success' })
    setSubscribeEmail('')
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="grid md:grid-cols-2 gap-6 p-8 md:p-12">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                Don’t miss our daily
                <br /> amazing deals.
              </div>
              <div className="mt-4 text-slate-600 max-w-md">
                Save up to 60% off on your first order. Fresh groceries delivered quickly.
              </div>
              <div className="mt-7 flex items-center gap-2 max-w-md">
                <input
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Enter your email address"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubscribe()
                  }}
                />
                <button
                  className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500"
                  type="button"
                  onClick={handleSubscribe}
                >
                  Subscribe
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-2xl" />
              <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-teal-200/40 blur-2xl" />
              <div className="relative h-72 md:h-full rounded-2xl border border-white/60 bg-white/40" />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">Explore Categories</div>
              <div className="text-sm text-slate-600">Pick from popular groups</div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/categories" className="hidden sm:inline-flex px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50">
                View all
              </Link>
            </div>
          </div>

          {categoriesErr ? <div className="mt-3 text-sm text-red-600">{categoriesErr}</div> : null}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((c, i) => {
              const id = normalizeId(c)
              return (
                <CategoryCard
                  key={id || i}
                  name={c.name}
                  items={c.itemsCount ?? c.count ?? c.productsCount ?? 0}
                  color={categoryColor(i)}
                  active={activeCategoryId === id}
                  onClick={() => setActiveCategoryId(id)}
                />
              )
            })}
          </div>

          <div className="mt-5 sm:hidden">
            <Link to="/categories" className="inline-flex px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50">
              View all categories
            </Link>
          </div>
        </div>

        {/* Featured */}
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">Featured Products</div>
              <div className="text-sm text-slate-600">
                {loadingProducts ? 'Loading…' : `${products.length} items`}
                {searchQuery ? ` • query: "${searchQuery}"` : ''}
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Pill active={!featuredCategoryId} onClick={() => setFeaturedCategoryId('')}>All</Pill>
              {categories.slice(0, 4).map((c) => (
                <Pill
                  key={normalizeId(c)}
                  active={featuredCategoryId === normalizeId(c)}
                  onClick={() => setFeaturedCategoryId(normalizeId(c))}
                >
                  {c.name}
                </Pill>
              ))}
            </div>
          </div>

          {productsErr ? <div className="mt-3 text-sm text-red-600">{productsErr}</div> : null}

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {products.slice(0, 10).map((p, idx) => (
              <ProductCard
                key={normalizeId(p) || idx}
                name={p.name || 'Unnamed'}
                category={p.categoryName || p.category || 'Category'}
                price={p.price}
                oldPrice={p.oldPrice}
                wishlistLoading={Boolean(wishBusy[normalizeId(p)])}
                onAddToCart={() => addToCart(normalizeId(p))}
                onAddToWishlist={() => addToWishlist(normalizeId(p))}
                imageUrl={p.imageUrl || p.imageURL || p.image || ''}
              />
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 p-8 overflow-hidden relative">
              <div className="text-xs inline-block px-3 py-1 rounded-full bg-white/70 border border-white text-slate-700">
                Free delivery
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">Free delivery over ₸50 000</div>
              <div className="mt-2 text-slate-600">Shop products for ₸50 000 and get free delivery anywhere.</div>
              <button
                className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                type="button"
                onClick={() => {
                  window.location.href = '/products'
                }}
              >
                Shop Now
              </button>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
            </div>

            <div className="rounded-3xl border border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-8 overflow-hidden relative">
              <div className="text-xs inline-block px-3 py-1 rounded-full bg-white/70 border border-white text-slate-700">
                60% off
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">Organic Food</div>
              <div className="mt-2 text-slate-600">Save up to 60% off on your first order.</div>
              <button
                className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                type="button"
                onClick={() => {
                  window.location.href = '/products?q=' + encodeURIComponent('organic')
                }}
              >
                Order Now
              </button>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
            </div>
          </div>
        </div>

        {}
        <div className="mt-14 grid md:grid-cols-4 gap-6">
          {bottomGroups.map((g) => (
            <div key={g.title} className="rounded-3xl bg-white border border-slate-100 p-6">
              <div className="font-extrabold text-slate-900">{g.title}</div>
              {bottomErr ? <div className="mt-3 text-xs text-red-600">{bottomErr}</div> : null}
              <div className="mt-4 space-y-3">
                {(g.items || []).map((p, i) => (
                  <SmallListItem
                    key={normalizeId(p) || i}
                    p={p}
                    busy={Boolean(wishBusy[normalizeId(p)])}
                    onAddToCart={() => addToCart(normalizeId(p))}
                    onAddToWishlist={() => addToWishlist(normalizeId(p))}
                  />
                ))}
                {(g.items || []).length === 0 && !bottomErr ? <div className="text-sm text-slate-500">Нет товаров</div> : null}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

