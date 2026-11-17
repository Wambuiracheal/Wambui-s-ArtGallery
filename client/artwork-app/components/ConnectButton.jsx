import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const PAIRS = { artist: 'company', company: 'artist' }

/** Loads the current user's connections so many ConnectButtons can share one request */
export function useConnections() {
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const canConnect = Boolean(user && PAIRS[user.role])

  const refresh = useCallback(() => {
    if (!canConnect) return
    api('/connections').then(setConnections).catch(() => {})
  }, [canConnect])

  useEffect(refresh, [refresh, user?.id])

  const statusWith = (otherId) => {
    const c = connections.find(c =>
      (c.requester.id === otherId || c.recipient.id === otherId) && c.status !== 'declined')
    return c ? c.status : null
  }
  return { connections, refresh, statusWith }
}

/** "Connect" between an artist and a company, with an optional note */
function ConnectButton({ target, status, onConnected }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (!user) {
    return <Link to="/login" className="btn btn-outline">Log in to connect</Link>
  }
  if (PAIRS[user.role] !== target.role) return null
  if (status === 'accepted') return <Link to="/dashboard?tab=connections" className="btn btn-outline">Connected ✓</Link>
  if (status === 'pending') return <button type="button" className="btn btn-outline" disabled>Request pending</button>

  if (!open) {
    return <button type="button" className="btn btn-accent" onClick={() => setOpen(true)}>Connect</button>
  }

  const send = (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    api('/connections', { method: 'POST', body: { recipient_id: target.id, message } })
      .then(() => { setOpen(false); onConnected?.() })
      .catch(err => setError(err.message))
      .finally(() => setSending(false))
  }

  return (
    <form className="connect-form" onSubmit={send}>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={user.role === 'company'
          ? `Tell ${target.name} about your project…`
          : `Introduce yourself to ${target.name}…`}
        rows={3}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="row-actions">
        <button type="submit" className="btn btn-accent" disabled={sending}>{sending ? 'Sending…' : 'Send request'}</button>
        <button type="button" className="link-btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

export default ConnectButton
