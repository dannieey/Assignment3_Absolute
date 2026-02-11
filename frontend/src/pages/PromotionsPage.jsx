import { useNavigate } from 'react-router-dom'
import { Container } from '../components/Container'

function PromoCard({ title, desc, tag, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-3xl bg-white border border-slate-200 p-6 hover:shadow-sm transition"
    >
      <div className="text-xs inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">{tag}</div>
      <div className="mt-3 text-xl font-extrabold text-slate-900">{title}</div>
      <div className="mt-2 text-slate-600">{desc}</div>
      <div className="mt-4 text-sm font-semibold text-emerald-700">Open in catalog →</div>
    </button>
  )
}

export function PromotionsPage() {
  const nav = useNavigate()
  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="text-3xl font-extrabold text-slate-900">Promotions</div>
        <div className="mt-2 text-slate-600">Quick shortcuts to popular selections in the catalog.</div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <PromoCard tag="New" title="Recently added" desc="Find latest products" onClick={() => nav('/products?q=' + encodeURIComponent('new'))} />
          <PromoCard tag="Top" title="Best price" desc="Search cheap items" onClick={() => nav('/products?q=' + encodeURIComponent('cheap'))} />
          <PromoCard tag="Pick" title="Healthy" desc="Search healthy products" onClick={() => nav('/products?q=' + encodeURIComponent('healthy'))} />
        </div>
      </Container>
    </div>
  )
}
