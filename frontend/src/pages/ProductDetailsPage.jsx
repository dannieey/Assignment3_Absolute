import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productsApi } from '../api'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'

function normalizeImgUrl(u) {
  const s = String(u || '').trim()
  if (!s) return ''
  if (s.startsWith('//')) return window.location.protocol + s
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s
  return s
}

function pickLocation(p) {
  return {
    aisle: p?.aisle || '',
    section: p?.section || '',
    shelf: p?.shelf || '',
    position: p?.position || p?.slot || '',
  }
}

export function ProductDetailsPage() {
  const toast = useToast()
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [product, setProduct] = useState(null)

  const img = useMemo(() => normalizeImgUrl(product?.imageUrl || product?.imageURL || product?.image || ''), [product])
  const loc = useMemo(() => pickLocation(product), [product])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) return
      setLoading(true)
      setErr('')
      setProduct(null)
      try {
        let p
        try {
          p = await productsApi.getById(id)
        } catch {
          const list = await productsApi.list({ q: '', categoryId: '' })
          p = Array.isArray(list) ? list.find((x) => String(x?._id || x?.id || '') === String(id)) : null
        }

        if (cancelled) return
        if (!p) {
          setErr('Product not found')
          return
        }
        setProduct(p)
      } catch (e2) {
        if (cancelled) return
        setErr(e2.message || 'Failed to load product')
        toast.push(e2.message || 'Failed to load product', { type: 'error' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-3xl font-extrabold text-slate-900">Product</div>
              <div className="mt-1 text-slate-600">Full information from database</div>
            </div>
            <Link to="/products" className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50">
              Back to catalog
            </Link>
          </div>

          {loading ? <div className="mt-6 text-slate-600">Loading…</div> : null}
          {err ? <div className="mt-6 text-red-600">{err}</div> : null}

          {product ? (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white border border-slate-100 p-6">
                {img ? (
                  <img
                    src={img}
                    alt={product?.name || ''}
                    className="w-full h-80 object-cover rounded-2xl border border-slate-100 bg-slate-50"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-80 rounded-2xl bg-slate-50 border border-slate-100" />
                )}
              </div>

              <div className="rounded-3xl bg-white border border-slate-100 p-6">
                <div className="text-xs text-slate-500">Name</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">{product?.name || 'Unnamed'}</div>

                {product?.price != null ? (
                  <div className="mt-3 text-emerald-700 font-extrabold text-xl">{product.price} ₸</div>
                ) : null}

                {product?.description ? (
                  <div className="mt-4 text-slate-700">{product.description}</div>
                ) : null}

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500">Barcode</div>
                    <div className="mt-1 font-semibold text-slate-900">{product?.barcode || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500">Availability</div>
                    <div className="mt-1 font-semibold text-slate-900">{product?.availabilityStatus || '—'}</div>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[11px] text-slate-500">Aisle</div>
                    <div className="mt-1 font-semibold text-slate-900">{loc.aisle || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[11px] text-slate-500">Section</div>
                    <div className="mt-1 font-semibold text-slate-900">{loc.section || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[11px] text-slate-500">Shelf</div>
                    <div className="mt-1 font-semibold text-slate-900">{loc.shelf || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[11px] text-slate-500">Position</div>
                    <div className="mt-1 font-semibold text-slate-900">{loc.position || '—'}</div>
                  </div>
                </div>

                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-slate-600">Raw JSON</summary>
                  <pre className="mt-3 text-xs bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-auto">{JSON.stringify(product, null, 2)}</pre>
                </details>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  )
}

