function fmtDate(x) {
  if (!x) return ''
  const d = new Date(x)
  if (Number.isNaN(d.getTime())) return String(x)
  return d.toLocaleString()
}

function StatusBadge({ status }) {
  const s = String(status || '').toUpperCase()
  const cls =
    s === 'DONE'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : s === 'PROCESSING'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-slate-700 border-slate-200'

  return <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${cls}`}>{s || 'UNKNOWN'}</span>
}

export function OrderTrackingCard({ tracking }) {
  if (!tracking) return null

  const history = Array.isArray(tracking.history) ? tracking.history : []

  return (
    <div className="mt-6 rounded-3xl bg-white border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-lg font-extrabold text-slate-900">Order tracking</div>
            <div className="mt-1 text-sm text-slate-600 break-all">Order ID: {tracking.orderId || tracking.id}</div>
          </div>
          <StatusBadge status={tracking.status} />
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Created: {fmtDate(tracking.createdAt)}
          {tracking.updatedAt ? ` • Updated: ${fmtDate(tracking.updatedAt)}` : ''}
        </div>
      </div>

      <div className="p-6">
        <div className="text-sm font-semibold text-slate-900">History</div>

        {history.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">Пока нет истории статусов.</div>
        ) : (
          <ol className="mt-4 space-y-4">
            {history.map((h, idx) => {
              const isLast = idx === history.length - 1
              return (
                <li key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-emerald-600" />
                    {!isLast ? <div className="w-px flex-1 bg-slate-200 mt-1" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={h.status} />
                      <div className="text-xs text-slate-500">{fmtDate(h.timestamp)}</div>
                    </div>
                    {h.note ? <div className="mt-1 text-sm text-slate-700">{h.note}</div> : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}

