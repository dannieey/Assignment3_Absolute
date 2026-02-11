import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { CartPage } from './pages/CartPage'
import { WishlistPage } from './pages/WishlistPage'
import { TrackOrderPage } from './pages/TrackOrderPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'
import { StaffPage } from './pages/StaffPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { DealsPage } from './pages/DealsPage'
import { PromotionsPage } from './pages/PromotionsPage'
import { HelpPage } from './pages/HelpPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { useAuth } from './auth'
import { cartApi, profileApi, wishlistApi } from './api'

export default function App() {
  const auth = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const nav = useNavigate()
  const location = useLocation()

  const [userLabel, setUserLabel] = useState('Guest')
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  async function refreshBadges() {
    if (!auth.isAuthed) {
      setUserLabel('Guest')
      setCartCount(0)
      setWishlistCount(0)
      return
    }

    try {
      const p = await profileApi.get()
      setUserLabel(p?.fullName || p?.email || 'User')
    } catch {
      setUserLabel('User')
    }

    try {
      const c = await cartApi.get()
      setCartCount(c?.totalItems || 0)
    } catch {
      setCartCount(0)
    }

    try {
      const w = await wishlistApi.get()
      const items = w?.items || w
      setWishlistCount(Array.isArray(items) ? items.length : 0)
    } catch {
      setWishlistCount(0)
    }
  }

  useEffect(() => {
    refreshBadges()
  }, [auth.isAuthed])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        userLabel={userLabel}
        onSearch={(q) => {
          const qq = (q || '').trim()
          setSearchQuery(qq)
          if (location.pathname !== '/') nav('/')
        }}
      />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} auth={auth} onCartChanged={refreshBadges} onWishlistChanged={refreshBadges} />} />
          <Route path="/products" element={<ProductsPage auth={auth} onCartChanged={refreshBadges} onWishlistChanged={refreshBadges} />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/login" element={<LoginPage auth={auth} />} />
          <Route path="/profile" element={<ProfilePage auth={auth} />} />
          <Route path="/cart" element={<CartPage auth={auth} />} />
          <Route path="/wishlist" element={<WishlistPage auth={auth} />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/orders" element={<OrdersPage auth={auth} />} />
          <Route path="/staff" element={<StaffPage auth={auth} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}
