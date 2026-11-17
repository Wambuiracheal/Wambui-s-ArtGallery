import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))

  // Restore the session on page load
  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = ({ token, user }) => {
    setToken(token)
    setUser(user)
    return user
  }

  const login = useCallback((email, password) =>
    api('/auth/login', { method: 'POST', body: { email, password } }).then(handleAuth), [])

  const signup = useCallback((data) =>
    api('/auth/signup', { method: 'POST', body: data }).then(handleAuth), [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback((data) =>
    api('/auth/me', { method: 'PATCH', body: data }).then(u => { setUser(u); return u }), [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
