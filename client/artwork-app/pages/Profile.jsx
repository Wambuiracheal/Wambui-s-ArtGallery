import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import ArtTile from '../components/ArtTile'
import Avatar from '../components/Avatar'
import BuyButton from '../components/BuyButton'
import ConnectButton, { useConnections } from '../components/ConnectButton'
import EventCard from '../components/EventCard'
import { useAuth } from '../context/AuthContext'

/** Public profile page for an artist or a company */
function Profile({ role }) {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const { statusWith, refresh } = useConnections()

  useEffect(() => {
    setProfile(null)
    setError('')
    api(`/users/${id}`)
      .then(p => (p.role === role ? setProfile(p) : setError('Profile not found')))
      .catch(err => setError(err.message))
  }, [id, role])

  if (error) return <div className="page"><p className="form-error">{error}</p></div>
  if (!profile) return <div className="page"><p className="loading">Loading…</p></div>

  const isMe = user?.id === profile.id

  return (
    <div className="page">
      <Link to={role === 'artist' ? '/artists' : '/companies'} className="back-link">
        ← All {role === 'artist' ? 'artists' : 'companies'}
      </Link>

      <header className="profile-head">
        <Avatar user={profile} size={120} />
        <div className="profile-info">
          <p className="eyebrow">{role === 'artist' ? 'Artist' : profile.industry || 'Company'}</p>
          <h1 className="page-title">{profile.name}</h1>
          <p className="profile-meta">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer">🔗 Website</a>}
          </p>
          {profile.bio && <p className="lede">{profile.bio}</p>}
          <div className="row-actions">
            {isMe
              ? <Link to="/dashboard?tab=profile" className="btn btn-dark">Edit my profile</Link>
              : <ConnectButton target={profile} status={statusWith(profile.id)} onConnected={refresh} />}
          </div>
        </div>
      </header>

      {role === 'artist' && (
        <>
          <section className="profile-section">
            <h2 className="section-title">Artworks <em>({profile.artworks.length})</em></h2>
            {profile.artworks.length === 0
              ? <p className="muted">No artworks uploaded yet.</p>
              : (
                <ul className="gallery-grid">
                  {profile.artworks.map(a => (
                    <li key={a.id}>
                      <ArtTile art={a} showArtist={false}>
                        <BuyButton art={a} className="btn btn-dark btn-sm" />
                      </ArtTile>
                    </li>
                  ))}
                </ul>
              )}
          </section>

          <section className="profile-section">
            <h2 className="section-title">Upcoming <em>events</em></h2>
            {profile.events.length === 0
              ? <p className="muted">No upcoming events.</p>
              : <div className="event-list">{profile.events.map(e => <EventCard key={e.id} event={e} showArtist={false} />)}</div>}
          </section>
        </>
      )}
    </div>
  )
}

export default Profile
