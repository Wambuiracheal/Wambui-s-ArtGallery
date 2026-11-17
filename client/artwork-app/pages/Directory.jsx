import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Avatar from '../components/Avatar'
import ConnectButton, { useConnections } from '../components/ConnectButton'

const COPY = {
  artist: {
    eyebrow: 'Artists',
    title: <>Meet the <em>makers</em></>,
    path: '/artists',
    empty: 'No artists have joined yet.',
  },
  company: {
    eyebrow: 'For business',
    title: <>Companies looking for <em>art</em></>,
    path: '/companies',
    empty: 'No companies have joined yet.',
  },
}

/** Public directory of artists or companies */
function Directory({ role }) {
  const copy = COPY[role]
  const [people, setPeople] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { statusWith, refresh } = useConnections()

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      api(`/users?role=${role}${query ? `&q=${encodeURIComponent(query)}` : ''}`)
        .then(setPeople)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [role, query])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="page-title">{copy.title}</h1>
        </div>
        <p className="page-meta">{people.length} {role === 'artist' ? 'artists' : 'companies'}</p>
      </header>

      <div className="toolbar">
        <input className="search wide" type="search" placeholder="Search by name, location or industry…"
          value={query} onChange={e => setQuery(e.target.value)} />
        {role === 'company' && (
          <Link to="/signup?role=company" className="btn btn-dark">List your company</Link>
        )}
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && people.length === 0 && <div className="empty"><p className="empty-title">{copy.empty}</p></div>}

      <ul className="people-grid">
        {people.map(p => (
          <li key={p.id} className="person-card">
            <Link to={`${copy.path}/${p.id}`} className="person-link">
              <Avatar user={p} size={64} />
              <div>
                <h3>{p.name}</h3>
                <p className="person-meta">
                  {[p.industry, p.location].filter(Boolean).join(' · ') || (role === 'artist' ? 'Artist' : 'Company')}
                </p>
              </div>
            </Link>
            {p.bio && <p className="person-bio">{p.bio}</p>}
            {role === 'artist' && (
              <p className="person-stats">
                <span>{p.artworks_count} artworks</span>
                <span>{p.events_count} upcoming events</span>
              </p>
            )}
            <ConnectButton target={p} status={statusWith(p.id)} onConnected={refresh} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Directory
