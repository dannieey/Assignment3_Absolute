import { Link } from 'react-router-dom'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200">
      <Container className="py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold">G</div>
              <div>
                <div className="font-extrabold text-slate-900">Groceyish</div>
                <div className="text-xs text-slate-500">GROCERY</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <div>Address: 1762 School House Road</div>
              <div>Call us: 1233-777</div>
              <div>Email: groceyish@contact.com</div>
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
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 mb-3">Useful links</div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li><a className="hover:text-emerald-700" href="#">About Us</a></li>
              <li><a className="hover:text-emerald-700" href="#">Contact</a></li>
              <li><a className="hover:text-emerald-700" href="#">Hot deals</a></li>
              <li><a className="hover:text-emerald-700" href="#">Promotions</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 mb-3">Help center</div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li><a className="hover:text-emerald-700" href="#">Payments</a></li>
              <li><a className="hover:text-emerald-700" href="#">Refund</a></li>
              <li><a className="hover:text-emerald-700" href="#">Checkout</a></li>
              <li><a className="hover:text-emerald-700" href="#">Shipping</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-slate-500">© 2026, All rights reserved</div>
          <div className="text-sm text-slate-500">VISA · MasterCard · Maestro</div>
        </div>
      </Container>
    </footer>
  )
}
