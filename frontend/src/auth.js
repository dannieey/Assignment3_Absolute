import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from './api'

const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function useAuth() {
  const [token, setTokenState] = useState(() => getToken())

  const isAuthed = useMemo(() => Boolean(token), [token])

  const logout = useCallback(() => {
    setToken('')
    setTokenState('')
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login(email, password)
    const t = data?.token || data?.accessToken
    if (!t) throw new Error('Token not found in response')
    setToken(t)
    setTokenState(t)
    return t
  }, [])

  const register = useCallback(async ({ fullName, email, password, role = '', staffCode = '' }) => {
    const data = await authApi.register(fullName, email, password, { role, staffCode })
    const t = data?.token || data?.accessToken
    if (t) {
      setToken(t)
      setTokenState(t)
    }
    return t || null
  }, [])

  useEffect(() => {
    const onStorage = () => setTokenState(getToken())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { token, isAuthed, login, register, logout }
}
