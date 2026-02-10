import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { profileApi } from '../api'

export function ProfilePage({ auth }) {
  const [profile, setProfile] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setErr('')
      try {
        const data = await profileApi.get()
        if (!cancelled) setProfile(data)
      } catch (e2) {
        if (!cancelled) setErr(e2.message || 'Failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (auth?.isAuthed) load()
    else {
      setLoading(false)
      setProfile(null)
    }

    return () => {
      cancelled = true
    }
  }, [auth?.isAuthed])

  if (!auth?.isAuthed) {
    return (
      <div className="bg-slate-50">
        <Container className="py-10">
          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="text-3xl font-extrabold text-slate-900">Profile</div>
            <div className="mt-2 text-slate-600">You needed to be login</div>
            <Link
              to="/login"
              className="inline-block mt-6 px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Go to Login
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-3xl font-extrabold text-slate-900">Profile</div>
            <div className="mt-2 text-slate-600">Data from GET /profile</div>
          </div>
          <button
            type="button"
            onClick={() => auth.logout()}
            className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-white border border-slate-200 p-8">
          {loading ? <div className="text-slate-600">Loading…</div> : null}
          {err ? <div className="text-sm text-red-600">{err}</div> : null}

          {profile ? (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-slate-500">Full name</div>
                <div className="text-lg font-bold text-slate-900">{profile.fullName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="text-lg font-bold text-slate-900">{profile.email}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Role</div>
                <div className="text-lg font-bold text-slate-900">{profile.role}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Orders count</div>
                <div className="text-lg font-bold text-slate-900">{profile.ordersCount}</div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-2">
            <Link to="/orders" className="px-4 py-2 rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
              My orders
            </Link>
            <Link to="/track" className="px-4 py-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500">
              Track order
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
