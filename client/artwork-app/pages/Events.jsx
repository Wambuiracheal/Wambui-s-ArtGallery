import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import EventCard from '../components/EventCard'
import { useAuth } from '../context/AuthContext'

function Events() {
  const { user } = useAuth()
  const [when, setWhen] = useState('upcoming')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api(`/events?when=${when}`)
      .then(setEvents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [when])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">What&apos;s on</p>
          <h1 className="page-title">Shows, workshops &amp; <em>open studios</em></h1>
        </div>
        <p className="page-meta">{events.length} events</p>
      </header>

      <div className="toolbar">
        <div className="chips">
          {['upcoming', 'past'].map(w => (
            <button key={w} type="button" className={'chip' + (when === w ? ' is-active' : '')} onClick={() => setWhen(w)}>
              {w}
            </button>
          ))}
        </div>
        {user?.role === 'artist'
          ? <Link to="/dashboard?tab=events" className="btn btn-dark">+ Post an event</Link>
          : !user && <Link to="/signup?role=artist" className="btn btn-outline">Artist? Post your event</Link>}
      </div>

      {loading && <p className="loading">Loading events…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && events.length === 0 && (
        <div className="empty">
          <p className="empty-title">No {when} events.</p>
          <p>Check back soon — artists post new shows all the time.</p>
        </div>
      )}
      <div className="event-list">
        {events.map(e => <EventCard key={e.id} event={e} />)}
      </div>
    </div>
  )
}

export default Events
