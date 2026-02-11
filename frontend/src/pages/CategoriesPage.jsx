import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { categoriesApi } from '../api'
import { Container } from '../components/Container'

function normalizeId(x) {
  return x?._id || x?.id || ''
}

function CategoryTile({ c, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl p-5 border border-slate-100 bg-white hover:shadow-sm hover:border-emerald-200 transition"
    >
      <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center text-2xl">🥗</div>
      <div className="mt-4 font-semibold text-slate-900 line-clamp-2 min-h-[40px]">{c?.name}</div>
      <div className="text-sm text-slate-600">{c?.itemsCount ?? 0} items</div>
    </button>
  )
}

export function CategoriesPage() {
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()

  const [q, setQ] = useState(sp.get('q') || '')
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const page = Math.max(1, Number(sp.get('page') || 1))
  const limit = 18

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(sp)
      const v = (q || '').trim()
      if (v) next.set('q', v)
      else next.delete('q')
      next.set('page', '1')
      setSp(next, { replace: true })
    }, 250)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr('')

    categoriesApi
      .list()
      .then((d) => {
        if (cancelled) return
        setCats(Array.isArray(d) ? d : [])
      })
      .catch((e2) => {
        if (cancelled) return
        setErr(e2.message || 'Failed to load categories')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const qq = (sp.get('q') || '').trim().toLowerCase()
    if (!qq) return cats
    return cats.filter((c) => String(c?.name || '').toLowerCase().includes(qq))
  }, [cats, sp])

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * limit
    return filtered.slice(start, start + limit)
  }, [filtered, safePage])

  function setPage(p) {
    const next = new URLSearchParams(sp)
    next.set('page', String(p))
    setSp(next, { replace: true })
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-3xl font-extrabold text-slate-900">All categories</div>
            <div className="mt-2 text-slate-600">Browse and pick a category</div>
          </div>
          <div className="w-full sm:w-auto">
            <input
              className="w-full sm:w-[360px] px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Search category"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {loading ? <div className="mt-6 text-slate-600">Loading…</div> : null}
        {err ? <div className="mt-6 text-sm text-red-600">{err}</div> : null}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {pageItems.map((c, i) => {
            const id = normalizeId(c)
            return (
              <CategoryTile
                key={id || i}
                c={c}
                onClick={() => {
                  if (!id) return
                  nav(`/products?categoryId=${encodeURIComponent(id)}`)
                }}
              />
            )
          })}
        </div>

        {!loading && !err && filtered.length === 0 ? <div className="mt-6 text-slate-600">Nothing found.</div> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Page {safePage} / {totalPages} • {filtered.length} categories
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}

