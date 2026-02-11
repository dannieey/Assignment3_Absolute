    import { useEffect, useMemo, useState } from 'react'
import { brandsApi, categoriesApi, productsApi, profileApi, staffApi } from '../api'
import { Container } from '../components/Container'
import { useToast } from '../components/toast'

function normalizeId(x) {
  return x?._id || x?.id || ''
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm">
      <div className="text-slate-600">{label}</div>
      {children}
    </label>
  )
}

export function StaffPage({ auth }) {
  const toast = useToast()

  const [me, setMe] = useState(null)
  const [loadingMe, setLoadingMe] = useState(true)

  const [products, setProducts] = useState([])
  const [cats, setCats] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [tab, setTab] = useState('products')

  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    barcode: '',
    brandId: '',
    categoryId: '',
    price: 0,
    currency: 'USD',
    aisle: '',
    section: '',
    shelf: '',
    position: '',
    stockQty: 0,
    availabilityStatus: '',
    imageUrl: '',
  })

  const isStaff = String(me?.role || '').toLowerCase() === 'staff'

  const catOptions = useMemo(() => [{ id: '', name: '—' }, ...cats.map((c) => ({ id: normalizeId(c), name: c.name }))], [cats])
  const brandOptions = useMemo(() => [{ id: '', name: '—' }, ...brands.map((b) => ({ id: normalizeId(b), name: b.name }))], [brands])

  async function loadAll() {
    setLoading(true)
    setErr('')
    try {
      const [p, c, b] = await Promise.all([
        productsApi.list({ q: '', categoryId: '' }),
        categoriesApi.list(),
        brandsApi.list(),
      ])
      setProducts(Array.isArray(p) ? p : [])
      setCats(Array.isArray(c) ? c : [])
      setBrands(Array.isArray(b) ? b : [])
    } catch (e2) {
      setErr(e2.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadMe() {
      setLoadingMe(true)
      try {
        const p = await profileApi.get()
        if (!cancelled) setMe(p)
      } catch {
        if (!cancelled) setMe(null)
      } finally {
        if (!cancelled) setLoadingMe(false)
      }
    }
    if (auth?.isAuthed) loadMe()
    else {
      setMe(null)
      setLoadingMe(false)
    }
    return () => {
      cancelled = true
    }
  }, [auth?.isAuthed])

  useEffect(() => {
    if (isStaff) loadAll()
  }, [isStaff])

  if (!auth?.isAuthed) {
    return (
      <div className="bg-slate-50">
        <Container className="py-10">
          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="text-3xl font-extrabold text-slate-900">Staff Panel</div>
            <div className="mt-2 text-slate-600">Login first.</div>
          </div>
        </Container>
      </div>
    )
  }

  if (loadingMe) {
    return (
      <div className="bg-slate-50">
        <Container className="py-10">
          <div className="text-slate-600">Loading…</div>
        </Container>
      </div>
    )
  }

  if (!isStaff) {
    return (
      <div className="bg-slate-50">
        <Container className="py-10">
          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="text-3xl font-extrabold text-slate-900">Staff Panel</div>
            <div className="mt-2 text-slate-600">Have not access.Required role <b>staff</b>.</div>
            <div className="mt-4 text-sm text-slate-600">Current role: {me?.role || 'unknown'}</div>
          </div>
        </Container>
      </div>
    )
  }

  async function onCreate() {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        barcode: form.barcode,
        brandId: form.brandId,
        categoryId: form.categoryId,
        price: Number(form.price || 0),
        currency: form.currency,
        aisle: form.aisle,
        section: form.section,
        shelf: form.shelf,
        position: form.position,
        stockQty: Number(form.stockQty || 0),
        availabilityStatus: form.availabilityStatus,
        imageUrl: form.imageUrl,
      }
      await staffApi.products.create(payload)
      toast.push('Product created', { type: 'success' })
      await loadAll()
    } catch (e2) {
      toast.push(e2.message || 'Failed to create', { type: 'error' })
    }
  }

  async function onUpdate() {
    if (!form.id) {
      toast.push('Select a product first', { type: 'error' })
      return
    }
    try {
      const payload = {
        name: form.name,
        description: form.description,
        barcode: form.barcode,
        brandId: form.brandId,
        categoryId: form.categoryId,
        price: Number(form.price || 0),
        currency: form.currency,
        aisle: form.aisle,
        section: form.section,
        shelf: form.shelf,
        position: form.position,
        stockQty: Number(form.stockQty || 0),
        availabilityStatus: form.availabilityStatus,
        imageUrl: form.imageUrl,
      }
      await staffApi.products.update(form.id, payload)
      toast.push('Product updated', { type: 'success' })
      await loadAll()
    } catch (e2) {
      toast.push(e2.message || 'Failed to update', { type: 'error' })
    }
  }

  async function onDelete(id) {
    if (!id) return
    if (!confirm('Delete product?')) return
    try {
      await staffApi.products.delete(id)
      toast.push('Product deleted', { type: 'success' })
      await loadAll()
      setForm((s) => ({ ...s, id: '' }))
    } catch (e2) {
      toast.push(e2.message || 'Failed to delete', { type: 'error' })
    }
  }

  async function createSimple(kind, name) {
    const value = String(name || '').trim()
    if (!value) return
    try {
      if (kind === 'category') await staffApi.categories.create({ name: value })
      if (kind === 'brand') await staffApi.brands.create({ name: value })
      toast.push('Created', { type: 'success' })
      await loadAll()
    } catch (e2) {
      toast.push(e2.message || 'Failed', { type: 'error' })
    }
  }

  async function updateSimple(kind, id, name) {
    const value = String(name || '').trim()
    if (!id || !value) return
    try {
      if (kind === 'category') await staffApi.categories.update(id, { name: value })
      if (kind === 'brand') await staffApi.brands.update(id, { name: value })
      toast.push('Updated', { type: 'success' })
      await loadAll()
    } catch (e2) {
      toast.push(e2.message || 'Failed', { type: 'error' })
    }
  }

  async function deleteSimple(kind, id) {
    if (!id) return
    if (!confirm('Delete?')) return
    try {
      if (kind === 'category') await staffApi.categories.delete(id)
      if (kind === 'brand') await staffApi.brands.delete(id)
      toast.push('Deleted', { type: 'success' })
      await loadAll()
    } catch (e2) {
      toast.push(e2.message || 'Failed', { type: 'error' })
    }
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-3xl font-extrabold text-slate-900">Staff Panel</div>
            <div className="mt-2 text-slate-600">Products / Categories / Brands</div>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
            onClick={loadAll}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { id: 'products', label: 'Products' },
            { id: 'categories', label: 'Categories' },
            { id: 'brands', label: 'Brands' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                'px-4 py-2 rounded-2xl border ' +
                (tab === t.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 hover:bg-slate-50')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}

        {tab === 'products' ? (
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <div className="font-extrabold text-slate-900">Product form</div>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <Field label="Name">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                </Field>
                <Field label="Barcode">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.barcode} onChange={(e) => setForm((s) => ({ ...s, barcode: e.target.value }))} />
                </Field>
                {/* Location */}
                <Field label="Aisle">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.aisle} onChange={(e) => setForm((s) => ({ ...s, aisle: e.target.value }))} />
                </Field>
                <Field label="Section">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.section} onChange={(e) => setForm((s) => ({ ...s, section: e.target.value }))} />
                </Field>
                <Field label="Shelf">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.shelf} onChange={(e) => setForm((s) => ({ ...s, shelf: e.target.value }))} />
                </Field>
                <Field label="Position">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.position} onChange={(e) => setForm((s) => ({ ...s, position: e.target.value }))} />
                </Field>
                <Field label="Category">
                  <select className="px-4 py-3 rounded-2xl border border-slate-200 bg-white" value={form.categoryId} onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}>
                    {catOptions.map((c) => (
                      <option key={c.id || 'x'} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Brand">
                  <select className="px-4 py-3 rounded-2xl border border-slate-200 bg-white" value={form.brandId} onChange={(e) => setForm((s) => ({ ...s, brandId: e.target.value }))}>
                    {brandOptions.map((b) => (
                      <option key={b.id || 'x'} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Price">
                  <input type="number" className="px-4 py-3 rounded-2xl border border-slate-200" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} />
                </Field>
                <Field label="Stock Qty">
                  <input type="number" className="px-4 py-3 rounded-2xl border border-slate-200" value={form.stockQty} onChange={(e) => setForm((s) => ({ ...s, stockQty: e.target.value }))} />
                </Field>
                <Field label="Currency">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.currency} onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))} />
                </Field>
                <Field label="Availability">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.availabilityStatus} onChange={(e) => setForm((s) => ({ ...s, availabilityStatus: e.target.value }))} />
                </Field>
                <Field label="Image URL">
                  <input className="px-4 py-3 rounded-2xl border border-slate-200" value={form.imageUrl} onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))} />
                </Field>
                <Field label="Description">
                  <textarea className="px-4 py-3 rounded-2xl border border-slate-200 sm:col-span-2" rows={4} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
                </Field>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="px-4 py-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500" onClick={onCreate}>
                  Create
                </button>
                <button type="button" className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50" onClick={onUpdate}>
                  Update
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
                  onClick={() => setForm({
                    id: '', name: '', description: '', barcode: '', brandId: '', categoryId: '', price: 0, currency: 'USD', aisle: '', section: '', shelf: '', position: '', stockQty: 0, availabilityStatus: '', imageUrl: '',
                  })}
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-500">ID is required</div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <div className="font-extrabold text-slate-900">Products</div>
              <div className="mt-4 grid gap-2 max-h-[520px] overflow-auto">
                {products.map((p) => {
                  const id = normalizeId(p)
                  return (
                    <div key={id} className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          className="text-left min-w-0"
                          onClick={() => setForm((s) => ({
                            ...s,
                            id,
                            name: p.name || '',
                            description: p.description || '',
                            barcode: p.barcode || '',
                            brandId: p.brandId || '',
                            categoryId: p.categoryId || '',
                            price: p.price ?? 0,
                            currency: p.currency || 'USD',
                            aisle: p.aisle || '',
                            section: p.section || '',
                            shelf: p.shelf || '',
                            position: p.position || p.slot || '',
                            stockQty: p.stockQty ?? 0,
                            availabilityStatus: p.availabilityStatus || '',
                            imageUrl: p.imageUrl || '',
                          }))}
                        >
                          <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                          <div className="text-xs text-slate-500 break-all">{id}</div>
                          <div className="text-sm text-emerald-700 font-bold mt-1">${p.price}</div>
                        </button>
                        <button
                          type="button"
                          className="px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                          onClick={() => onDelete(id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
                {products.length === 0 && !loading ? <div className="text-slate-600">No products</div> : null}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'categories' ? (
          <SimpleCrud
            title="Categories"
            items={cats}
            onCreate={(name) => createSimple('category', name)}
            onUpdate={(id, name) => updateSimple('category', id, name)}
            onDelete={(id) => deleteSimple('category', id)}
          />
        ) : null}

        {tab === 'brands' ? (
          <SimpleCrud
            title="Brands"
            items={brands}
            onCreate={(name) => createSimple('brand', name)}
            onUpdate={(id, name) => updateSimple('brand', id, name)}
            onDelete={(id) => deleteSimple('brand', id)}
          />
        ) : null}
      </Container>
    </div>
  )
}

function SimpleCrud({ title, items, onCreate, onUpdate, onDelete }) {
  const [name, setName] = useState('')
  const [editing, setEditing] = useState({})

  return (
    <div className="mt-6 rounded-3xl bg-white border border-slate-200 p-6">
      <div className="font-extrabold text-slate-900">{title}</div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200"
          placeholder={`New ${title} name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className="px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500"
          onClick={() => {
            onCreate?.(name)
            setName('')
          }}
        >
          Create
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {items.map((it) => {
          const id = normalizeId(it)
          return (
            <div key={id} className="rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
                value={editing[id] ?? it.name ?? ''}
                onChange={(e) => setEditing((s) => ({ ...s, [id]: e.target.value }))}
              />
              <button
                type="button"
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                onClick={() => onUpdate?.(id, editing[id] ?? it.name)}
              >
                Save
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                onClick={() => onDelete?.(id)}
              >
                Delete
              </button>
            </div>
          )
        })}
        {items.length === 0 ? <div className="text-slate-600">Empty</div> : null}
      </div>
    </div>
  )
}
