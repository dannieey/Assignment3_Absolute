import { Container } from '../components/Container'

export function AboutPage() {
  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="text-3xl font-extrabold text-slate-900">About us</div>
        <div className="mt-3 text-slate-600 max-w-3xl">
          We’re <span className="font-semibold text-slate-800">Adilbek</span> and <span className="font-semibold text-slate-800">Danel</span> — the creators of this supermarket web app.
          The project includes a full Go backend (API) and a React frontend: catalog, cart, wishlist, orders, and order tracking.
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="font-extrabold text-slate-900">Backend</div>
            <div className="mt-2 text-slate-600 text-sm">REST API, authentication, staff routes, products, orders, tracking.</div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="font-extrabold text-slate-900">Frontend</div>
            <div className="mt-2 text-slate-600 text-sm">Modern UI, search, filters, categories, cart, wishlist, profile.</div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="font-extrabold text-slate-900">Goal</div>
            <div className="mt-2 text-slate-600 text-sm">A realistic supermarket experience with clean UX and working flows.</div>
          </div>
        </div>
      </Container>
    </div>
  )
}
