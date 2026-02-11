import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from '../components/Container'

export function LoginPage({ auth }) {
  const nav = useNavigate()
  const [mode, setMode] = useState('login') // login | register
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await auth.login({ email, password })
        nav('/profile')
      } else {
        const t = await auth.register({ fullName, email, password })
        if (!t) {
          setMsg('Account is created. Now login.')
          setMode('login')
        } else {
          nav('/profile')
        }
      }
    } catch (e2) {
      setMsg(e2.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50">
      <Container className="py-10">
        <div className="max-w-xl mx-auto">
          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="text-3xl font-extrabold text-slate-900">{mode === 'login' ? 'Login' : 'Register'}</div>
              <div className="mt-2 text-slate-600">Sign in to access your profile, cart, and orders.</div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`px-4 py-2 rounded-2xl border ${
                    mode === 'login' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`px-4 py-2 rounded-2xl border ${
                    mode === 'register' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>

              <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
                {mode === 'register' ? (
                  <input
                    className="px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                ) : null}

                <input
                  className="px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  className="px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  className="mt-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
                </button>

                {msg ? <div className="text-sm text-red-600">{msg}</div> : null}
              </form>

              <div className="mt-4 text-xs text-slate-500">
                You’ll stay signed in on this device.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
