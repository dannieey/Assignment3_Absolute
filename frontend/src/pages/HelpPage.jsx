import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '../components/Container'

const HELP = {
  payments: {
    title: 'Payments',
    body: 'Payments are supported in the app flow. After checkout, an order is created and you can track its status in Track Order.',
  },
  refund: {
    title: 'Refund',
    body: 'Refund requests are handled by support. Please include your order id and the reason for the refund in the Contact page.',
  },
  checkout: {
    title: 'Checkout',
    body: 'Add items to your cart and proceed to checkout. The API validates stock and creates an order with a tracking history.',
  },
  shipping: {
    title: 'Shipping',
    body: 'Delivery and shipping statuses are tracked as part of the order history. Use Track Order to see the latest updates.',
  },
}

export function HelpPage() {
  const [sp, setSp] = useSearchParams()
  const [tab, setTab] = useState(sp.get('topic') || 'payments')

  const topic = useMemo(() => HELP[tab] || HELP.payments, [tab])

  function setTopic(k) {
    setTab(k)
    const next = new URLSearchParams(sp)
    next.set('topic', k)
    setSp(next, { replace: true })
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="text-3xl font-extrabold text-slate-900">Help center</div>
        <div className="mt-2 text-slate-600">Quick answers.</div>

        <div className="mt-6 grid md:grid-cols-[260px_1fr] gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-2">
            {Object.entries(HELP).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTopic(k)}
                className={
                  'w-full text-left px-4 py-3 rounded-xl text-sm transition ' +
                  (tab === k ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-700')
                }
              >
                {v.title}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="text-xl font-extrabold text-slate-900">{topic.title}</div>
            <div className="mt-3 text-slate-600">{topic.body}</div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-900">Quick actions</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/cart" className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm">Go to cart</a>
                <a href="/orders" className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm">See orders</a>
                <a href="/track" className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm">Track order</a>
                <a href="/contact" className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm">Contact support</a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
