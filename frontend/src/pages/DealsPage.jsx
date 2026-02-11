import { useNavigate } from 'react-router-dom'
import { Container } from '../components/Container'

function DealCard({ title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-3xl bg-white border border-slate-200 p-6 hover:shadow-sm transition"
    >
      <div className="text-xs inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">Hot deal</div>
      <div className="mt-3 text-xl font-extrabold text-slate-900">{title}</div>
      <div className="mt-2 text-slate-600">{desc}</div>
      <div className="mt-4 text-sm font-semibold text-emerald-700">Open in catalog →</div>
    </button>
  )
}

export function DealsPage() {
  const nav = useNavigate()
  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="text-3xl font-extrabold text-slate-900">Hot deals</div>
        <div className="mt-2 text-slate-600">Explore curated deals and open them directly in the catalog.</div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <DealCard title="Organic" desc="Search organic products" onClick={() => nav('/products?q=' + encodeURIComponent('organic'))} />
          <DealCard title="Fresh" desc="Search fresh groceries" onClick={() => nav('/products?q=' + encodeURIComponent('fresh'))} />
          <DealCard title="Sale" desc="Search sale items" onClick={() => nav('/products?q=' + encodeURIComponent('sale'))} />
        </div>
      </Container>
    </div>
  )
}
