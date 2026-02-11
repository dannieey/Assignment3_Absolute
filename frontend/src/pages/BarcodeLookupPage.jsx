import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productsApi } from '../api'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'

function normalizeBarcode(v) {
  return String(v || '').trim()
}

function pickImage(p) {
  return p?.imageUrl || p?.imageURL || p?.image || ''
}

function pickLocation(p) {
  const aisle = p?.aisle || ''
  const section = p?.section || ''
  const shelf = p?.shelf || ''
  const position = p?.position || p?.slot || ''

  return {
    aisle,
    section,
    shelf,
    position,
  }
}

function isExactBarcodeMatch(p, barcode) {
  const b = normalizeBarcode(barcode)
  return String(p?.barcode || '').trim() === b
}

function findBestMatch(products, barcode) {
  const arr = Array.isArray(products) ? products : []
  const exact = arr.find((p) => isExactBarcodeMatch(p, barcode))
  return exact || arr[0] || null
}

async function lookupByBarcode(barcode) {
  const b = normalizeBarcode(barcode)
  if (!b) return []

  // Preferred: dedicated backend endpoint
  try {
    const p = await productsApi.getByBarcode(b)
    return p ? [p] : []
  } catch {
    // Fallback: backend might not have barcode endpoint in some environments
    const data = await productsApi.list({ q: b, categoryId: '' })
    return Array.isArray(data) ? data : []
  }
}

function ProductResultCard({ product, barcode }) {
  const img = pickImage(product)
  const loc = pickLocation(product)

  const hasLoc = Boolean(loc.aisle || loc.section || loc.shelf || loc.position)

  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-6">
      <div className="flex items-start gap-4">
        {img ? (
          <img
            src={img}
            alt={product?.name || ''}
            className="h-24 w-24 rounded-2xl border border-slate-100 object-cover bg-slate-50 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="h-24 w-24 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="text-xs text-slate-500">Product</div>
          <div className="text-xl font-extrabold text-slate-900 leading-tight">
            {product?.name || 'Unnamed'}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Barcode:</span> {product?.barcode || barcode}
          </div>
          {product?.price != null ? (
            <div className="mt-2 text-emerald-700 font-extrabold">{product.price} ₸</div>
          ) : null}

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

          {!hasLoc ? (
            <div className="mt-3 text-sm text-amber-700">
              Product found, but location fields are empty. Fill aisle/section/shelf in Staff Panel.
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              to={`/products?q=${encodeURIComponent(product?.name || '')}`}
              className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
            >
              Open in catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BarcodeLookupPage({ auth }) {
  const toast = useToast()
  const [sp, setSp] = useSearchParams()

  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [results, setResults] = useState([])

  const normalizedBarcode = useMemo(() => normalizeBarcode(barcode), [barcode])
  const canSearch = normalizedBarcode.length >= 3

  useEffect(() => {
    const fromQs = sp.get('barcode') || ''
    if (fromQs) setBarcode(fromQs)
  }, [sp])

  async function doLookup(bc) {
    const b = normalizeBarcode(bc)
    if (!b) return

    setErr('')
    setResults([])
    setLoading(true)

    try {
      const list = await lookupByBarcode(b)
      if (!Array.isArray(list) || list.length === 0) {
        setErr('Not found')
        toast.push('Not found', { type: 'error' })
        return
      }
      setResults(list)
      toast.push('Found', { type: 'success' })
    } catch (e2) {
      setErr(e2.message || 'Failed')
      toast.push(e2.message || 'Lookup error', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSearch || loading) return

    if (!auth?.isAuthed) {
      toast.push('Login first', { type: 'error' })
      return
    }

    setSp({ barcode: normalizedBarcode })
    await doLookup(normalizedBarcode)
  }

  const best = useMemo(() => findBestMatch(results, normalizedBarcode), [results, normalizedBarcode])

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="max-w-3xl">
          <div className="text-3xl font-extrabold text-slate-900">Barcode Lookup</div>
          <div className="mt-2 text-slate-600">
            Enter or scan a barcode to find where the product is located (aisle / section / shelf).
          </div>

          <form className="mt-6 flex gap-2" onSubmit={onSubmit}>
            <input
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Scan or type barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              autoFocus
            />
            <button
              className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
              disabled={!canSearch || loading}
            >
              {loading ? 'Searching…' : 'Find'}
            </button>
          </form>

          <div className="mt-3 text-xs text-slate-500">
            Tip: a USB scanner usually types digits and hits Enter. You can just scan into the field.
          </div>

          {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}

          {best ? (
            <div className="mt-6">
              <ProductResultCard product={best} barcode={normalizedBarcode} />

              {Array.isArray(results) && results.length > 1 ? (
                <div className="mt-4 text-sm text-slate-600">
                  Also matched: {results.length - 1} other item(s).
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  )
}
