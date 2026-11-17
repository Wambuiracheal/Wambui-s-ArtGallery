export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

const TOKEN_KEY = 'horizon_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* storage unavailable */ }
}

/** fetch wrapper: JSON in/out, auth header, throws Error(message) on failure */
export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const formatKES = (n) => 'KSh ' + Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })

export const formatDate = (iso, opts = {}) =>
  iso ? new Date(iso).toLocaleString('en-KE', { dateStyle: 'medium', ...opts }) : ''

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

export const ROLE_LABELS = { artist: 'Artist', customer: 'Collector', company: 'Company' }
