import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_OPTIONS = [
  { value: 'customer', emoji: '🖼️', label: 'Collector', blurb: 'Browse and buy original art' },
  { value: 'artist', emoji: '🎨', label: 'Artist', blurb: 'Sell your work and post events' },
  { value: 'company', emoji: '🏢', label: 'Company', blurb: 'Find and work with artists' },
]

/** Login and signup share one page */
function Auth({ mode }) {
  const isSignup = mode === 'signup'
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/dashboard'

  const [form, setForm] = useState({
    role: ROLE_OPTIONS.some(r => r.value === params.get('role')) ? params.get('role') : 'customer',
    name: '', email: '', password: '', location: '', industry: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const request = isSignup ? signup(form) : login(form.email, form.password)
    request
      .then(() => navigate(next, { replace: true }))
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  return (
    <div className="page auth">
      <div className="auth-intro">
        <p className="eyebrow">{isSignup ? 'Join Horizon' : 'Welcome back'}</p>
        <h1 className="page-title">
          {isSignup ? <>Make some <em>art friends</em></> : <>Good to see <em>you</em></>}
        </h1>
        <p className="lede">
          {isSignup
            ? 'Collectors buy original work, artists sell and promote their shows, and companies connect with talent.'
            : 'Log in to manage your artworks, orders and connections.'}
        </p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        {isSignup && (
          <fieldset className="role-picker">
            <legend>I am a…</legend>
            {ROLE_OPTIONS.map(r => (
              <label key={r.value} className={'role-option' + (form.role === r.value ? ' is-active' : '')}>
                <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={change} />
                <span className="role-emoji">{r.emoji}</span>
                <strong>{r.label}</strong>
                <small>{r.blurb}</small>
              </label>
            ))}
          </fieldset>
        )}

        {isSignup && (
          <label className="field">
            <span>{form.role === 'company' ? 'Company name' : form.role === 'artist' ? 'Artist name' : 'Your name'}</span>
            <input name="name" value={form.name} onChange={change} required />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" value={form.password} onChange={change} required minLength={isSignup ? 6 : undefined}
            autoComplete={isSignup ? 'new-password' : 'current-password'} />
        </label>
        {isSignup && form.role !== 'customer' && (
          <label className="field">
            <span>Location</span>
            <input name="location" value={form.location} onChange={change} placeholder="e.g. Nairobi" />
          </label>
        )}
        {isSignup && form.role === 'company' && (
          <label className="field">
            <span>Industry</span>
            <input name="industry" value={form.industry} onChange={change} placeholder="e.g. Hospitality, Interior design" />
          </label>
        )}

        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-accent full" disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
        </button>

        <p className="auth-switch">
          {isSignup
            ? <>Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></>
            : <>New here? <Link to={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>}
        </p>
      </form>
    </div>
  )
}

export default Auth
