import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from './Container'
import { Icon } from './Icon'

export function Header({ cartCount = 0, wishlistCount = 0, userLabel = 'Guest', onSearch }) {
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-slate-200">
      <Container className="py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-fit" onClick={() => setMobileOpen(false)}>
            <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold">D</div>
            <div className="leading-tight">
              <div className="font-extrabold text-slate-900">Dito</div>
              <div className="text-xs text-slate-500 -mt-0.5">GROCERY</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-6 flex-1">
            <Link
              to="/categories"
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white hover:bg-slate-50"
            >
              All Categories
            </Link>
            <div className="flex items-center flex-1 rounded-lg border border-slate-200 bg-white overflow-hidden">
              <input
                className="flex-1 px-3 py-2 outline-none text-sm text-slate-700"
                placeholder="Search for items…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearch?.(query)
                }}
              />
              <button
                className="px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-500"
                onClick={() => onSearch?.(query)}
                type="button"
              >
                <Icon name="search" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700" onClick={() => setMobileOpen(false)}>
              <Icon name="heart" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-1 rounded-full bg-emerald-600 text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700" onClick={() => setMobileOpen(false)}>
              <Icon name="cart" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-1 rounded-full bg-emerald-600 text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/profile" className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200" onClick={() => setMobileOpen(false)}>
              <div className="h-9 w-9 rounded-full bg-slate-200" />
              <div className="text-sm">
                <div className="font-semibold text-slate-900">{userLabel}</div>
                <div className="text-xs text-slate-500">Account</div>
              </div>
            </Link>

            <button
              type="button"
              className="sm:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Icon name="grid" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <input
              className="flex-1 px-3 py-3 outline-none text-sm text-slate-700"
              placeholder="Search for items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch?.(query)
                  setMobileOpen(false)
                }
              }}
            />
            <button
              className="px-3 py-3 bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => {
                onSearch?.(query)
                setMobileOpen(false)
              }}
              type="button"
            >
              <Icon name="search" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="mt-3 sm:hidden rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <Link className="block px-4 py-3 text-slate-700 hover:bg-slate-50" to="/" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link className="block px-4 py-3 text-slate-700 hover:bg-slate-50" to="/profile" onClick={() => setMobileOpen(false)}>
              Profile
            </Link>
            <Link className="block px-4 py-3 text-slate-700 hover:bg-slate-50" to="/orders" onClick={() => setMobileOpen(false)}>
              Orders
            </Link>
            <Link className="block px-4 py-3 text-slate-700 hover:bg-slate-50" to="/track" onClick={() => setMobileOpen(false)}>
              Track order
            </Link>
            <Link className="block px-4 py-3 text-slate-700 hover:bg-slate-50" to="/login" onClick={() => setMobileOpen(false)}>
              Login / Register
            </Link>
          </div>
        ) : null}
      </Container>

      <div className="border-t border-slate-100 bg-white">
        <Container className="py-2">
          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => setMobileOpen(false)}
            >
              <Icon name="grid" className="w-4 h-4" />
              Browse All Categories
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-slate-600">
              <Link className="hover:text-emerald-700" to="/">Home</Link>
              <Link className="hover:text-emerald-700" to="/products">Catalog</Link>
              <Link className="hover:text-emerald-700" to="/orders">Orders</Link>
              <Link className="hover:text-emerald-700" to="/track">Track order</Link>
            </nav>
            <div className="ml-auto hidden md:flex items-center gap-2 text-slate-600">
              <Icon name="phone" className="w-4 h-4" />
              <span className="font-semibold text-slate-800">8 708 774 91 52</span>
              <span className="text-slate-500">24/7 support center</span>
            </div>
          </div>
        </Container>
      </div>
    </header>
  )
}
