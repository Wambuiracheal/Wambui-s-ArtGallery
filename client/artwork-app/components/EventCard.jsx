import { Link } from 'react-router-dom'
import { formatKES } from '../api'

function EventCard({ event, showArtist = true, children }) {
  const start = new Date(event.starts_at)
  const time = start.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  const day = start.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <article className="event-card">
      <div className="event-date" aria-hidden="true">
        <span className="event-day">{start.getDate()}</span>
        <span className="event-month">{start.toLocaleDateString('en-KE', { month: 'short' })}</span>
      </div>

      {event.image && <img className="event-image" src={event.image} alt="" loading="lazy" />}

      <div className="event-body">
        <h3 className="event-title">{event.title}</h3>
        {showArtist && event.artist && (
          <p className="event-artist">by <Link to={`/artists/${event.artist.id}`}>{event.artist.name}</Link></p>
        )}
        <ul className="event-meta">
          <li>📍 {event.venue}</li>
          <li>🗓 {day} · {time}</li>
          <li>🎟 {event.price ? formatKES(event.price) : 'Free entry'}</li>
        </ul>
        {event.description && <p className="event-desc">{event.description}</p>}
        <div className="event-actions">
          {event.ticket_link && (
            <a className="btn btn-dark" href={event.ticket_link} target="_blank" rel="noreferrer">Get tickets</a>
          )}
          {children}
        </div>
      </div>
    </article>
  )
}

export default EventCard
