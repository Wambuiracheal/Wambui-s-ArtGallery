import { Link } from 'react-router-dom'
import { api, formatDate } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../Avatar'
import { useConnections } from '../ConnectButton'

function Connections() {
  const { user } = useAuth()
  const { connections, refresh } = useConnections()
  const other = (c) => (c.requester.id === user.id ? c.recipient : c.requester)
  const profilePath = (p) => `/${p.role === 'artist' ? 'artists' : 'companies'}/${p.id}`

  const incoming = connections.filter(c => c.status === 'pending' && c.recipient.id === user.id)
  const outgoing = connections.filter(c => c.status === 'pending' && c.requester.id === user.id)
  const accepted = connections.filter(c => c.status === 'accepted')

  const respond = (c, status) =>
    api(`/connections/${c.id}`, { method: 'PATCH', body: { status } }).then(refresh).catch(err => alert(err.message))
  const remove = (c, question) => {
    if (!window.confirm(question)) return
    api(`/connections/${c.id}`, { method: 'DELETE' }).then(refresh).catch(err => alert(err.message))
  }

  const lookingFor = user.role === 'artist' ? 'companies' : 'artists'

  const Person = ({ c, children }) => {
    const p = other(c)
    return (
      <li className="conn-card">
        <Link to={profilePath(p)} className="person-link">
          <Avatar user={p} size={48} />
          <div>
            <h3>{p.name}</h3>
            <p className="person-meta">{[p.industry, p.location].filter(Boolean).join(' · ')}</p>
          </div>
        </Link>
        {c.message && <blockquote className="conn-message">“{c.message}”</blockquote>}
        {children}
      </li>
    )
  }

  return (
    <>
      <div className="panel-head">
        <div className="stat-row">
          <span className="stat"><strong>{accepted.length}</strong> connected</span>
          <span className="stat"><strong>{incoming.length}</strong> to review</span>
        </div>
        <Link to={`/${lookingFor}`} className="btn btn-dark">Find {lookingFor}</Link>
      </div>

      {connections.length === 0 && (
        <div className="empty">
          <p className="empty-title">No connections yet.</p>
          <p>
            {user.role === 'artist'
              ? 'Reach out to companies looking for art — commissions, collaborations, corporate collections.'
              : 'Browse artists and send a request to start working together.'}
          </p>
        </div>
      )}

      {incoming.length > 0 && (
        <section className="conn-section">
          <h3 className="conn-heading">Requests for you</h3>
          <ul className="conn-grid">
            {incoming.map(c => (
              <Person key={c.id} c={c}>
                <p className="muted small">Sent {formatDate(c.created_at)}</p>
                <div className="row-actions">
                  <button type="button" className="btn btn-accent btn-sm" onClick={() => respond(c, 'accepted')}>Accept</button>
                  <button type="button" className="link-btn danger" onClick={() => respond(c, 'declined')}>Decline</button>
                </div>
              </Person>
            ))}
          </ul>
        </section>
      )}

      {accepted.length > 0 && (
        <section className="conn-section">
          <h3 className="conn-heading">Connected</h3>
          <ul className="conn-grid">
            {accepted.map(c => {
              const p = other(c)
              return (
                <Person key={c.id} c={c}>
                  <ul className="contact-lines">
                    {p.email && <li>✉️ <a href={`mailto:${p.email}`}>{p.email}</a></li>}
                    {p.phone && <li>📞 <a href={`tel:${p.phone}`}>{p.phone}</a></li>}
                    {p.website && <li>🔗 <a href={p.website} target="_blank" rel="noreferrer">{p.website}</a></li>}
                  </ul>
                  <button type="button" className="link-btn danger" onClick={() => remove(c, `Remove your connection with ${p.name}?`)}>
                    Remove
                  </button>
                </Person>
              )
            })}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="conn-section">
          <h3 className="conn-heading">Waiting for a reply</h3>
          <ul className="conn-grid">
            {outgoing.map(c => (
              <Person key={c.id} c={c}>
                <button type="button" className="link-btn danger" onClick={() => remove(c, 'Withdraw this request?')}>Withdraw</button>
              </Person>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

export default Connections
