import { Link } from 'react-router-dom'
import { Container } from './Container'

function PayBadge({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs text-slate-600">
      {children}
    </span>
  )
}

export function Footer() {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200">
      <Container className="py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold">D</div>
              <div>
                <div className="font-extrabold text-slate-900">Dito</div>
                <div className="text-xs text-slate-500">GROCERY</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <div>Address: Turan 55, Astana</div>
              <div>Call us: 8 708 774 91 52</div>
              <div>Email: Dito@gmail.com</div>
              <div>Work hours: 8:00 - 20:00</div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-slate-900 mb-3">Account</div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li><Link className="hover:text-emerald-700" to="/wishlist">Wishlist</Link></li>
              <li><Link className="hover:text-emerald-700" to="/cart">Cart</Link></li>
              <li><Link className="hover:text-emerald-700" to="/track">Track Order</Link></li>
              <li><Link className="hover:text-emerald-700" to="/profile">Profile</Link></li>
              <li><Link className="hover:text-emerald-700" to="/orders">Orders</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 mb-3">Useful links</div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li><Link className="hover:text-emerald-700" to="/about">About Us</Link></li>
              <li><Link className="hover:text-emerald-700" to="/contact">Contact</Link></li>
              <li><Link className="hover:text-emerald-700" to="/deals">Hot deals</Link></li>
              <li><Link className="hover:text-emerald-700" to="/promotions">Promotions</Link></li>
              <li><Link className="hover:text-emerald-700" to="/products">Catalog</Link></li>
              <li><Link className="hover:text-emerald-700" to="/categories">Categories</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 mb-3">Help center</div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li><Link className="hover:text-emerald-700" to="/help?topic=payments">Payments</Link></li>
              <li><Link className="hover:text-emerald-700" to="/help?topic=refund">Refund</Link></li>
              <li><Link className="hover:text-emerald-700" to="/help?topic=checkout">Checkout</Link></li>
              <li><Link className="hover:text-emerald-700" to="/help?topic=shipping">Shipping</Link></li>
            </ul>

            <div className="mt-5">
              <div className="text-xs text-slate-500 mb-2">Payments supported</div>
              <div className="flex flex-wrap gap-2">
                <PayBadge>VISA</PayBadge>
                <PayBadge>MasterCard</PayBadge>
                <PayBadge>Maestro</PayBadge>
                <PayBadge>Apple Pay</PayBadge>
                <PayBadge>Google Pay</PayBadge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-slate-500">© 2026, All rights reserved</div>
          <div className="text-sm text-slate-500">Built with Go API</div>
        </div>
      </Container>
    </footer>
  )
}
