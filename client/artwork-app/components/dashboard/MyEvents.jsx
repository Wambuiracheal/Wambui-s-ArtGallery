import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import EventCard from '../EventCard'

const EMPTY = { title: '', venue: '', starts_at: '', ends_at: '', price: '', image: '', ticket_link: '', description: '' }
const toInput = (iso) => (iso ? iso.slice(0, 16) : '')

function EventForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => initial
    ? Object.fromEntries(Object.keys(EMPTY).map(k => [k, k.endsWith('_at') ? toInput(initial[k]) : initial[k] ?? '']))
    : EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    onSubmit({ ...form, ends_at: form.ends_at || null })
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  return (
    <form className="panel-form" onSubmit={submit}>
      <h3 className="panel-form-title">{initial ? 'Edit event' : 'Advertise an event'}</h3>
      <label className="field full"><span>Event name</span>
        <input name="title" value={form.title} onChange={change} placeholder="Solo show opening night" required /></label>
      <label className="field full"><span>Venue</span>
        <input name="venue" value={form.venue} onChange={change} placeholder="Gallery, street, city" required /></label>
      <label className="field"><span>Starts</span>
        <input type="datetime-local" name="starts_at" value={form.starts_at} onChange={change} required /></label>
      <label className="field"><span>Ends (optional)</span>
        <input type="datetime-local" name="ends_at" value={form.ends_at} onChange={change} /></label>
      <label className="field"><span>Ticket price (KSh, blank = free)</span>
        <input type="number" min="0" name="price" value={form.price} onChange={change} /></label>
      <label className="field"><span>Ticket / RSVP link</span>
        <input name="ticket_link" value={form.ticket_link} onChange={change} placeholder="https://…" /></label>
      <label className="field full"><span>Poster image URL</span>
        <input name="image" value={form.image} onChange={change} placeholder="https://…" /></label>
      <label className="field full"><span>Description</span>
        <textarea name="description" value={form.description} onChange={change} rows={3} /></label>
      {error && <p className="form-error full">{error}</p>}
      <div className="row-actions full">
        <button type="submit" className="btn btn-accent" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Publish event'}</button>
        <button type="button" className="link-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

function MyEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    api(`/events?when=all&artist_id=${user.id}`)
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [user.id])

  const sortByDate = (list) => [...list].sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))

  const create = (values) => api('/events', { method: 'POST', body: values }).then(ev => {
    setEvents(list => sortByDate([ev, ...list]))
    setShowForm(false)
  })
  const update = (values) => api(`/events/${editing.id}`, { method: 'PATCH', body: values }).then(ev => {
    setEvents(list => sortByDate(list.map(x => (x.id === ev.id ? ev : x))))
    setEditing(null)
  })
  const remove = (ev) => {
    if (!window.confirm(`Delete "${ev.title}"?`)) return
    api(`/events/${ev.id}`, { method: 'DELETE' })
      .then(() => setEvents(list => list.filter(x => x.id !== ev.id)))
      .catch(err => alert(err.message))
  }

  const now = new Date()
  const upcoming = events.filter(e => new Date(e.starts_at) >= now)

  return (
    <>
      <div className="panel-head">
        <div className="stat-row">
          <span className="stat"><strong>{upcoming.length}</strong> upcoming</span>
          <span className="stat"><strong>{events.length - upcoming.length}</strong> past</span>
        </div>
        <button type="button" className="btn btn-dark" onClick={() => { setShowForm(s => !s); setEditing(null) }}>
          {showForm ? 'Close' : '+ New event'}
        </button>
      </div>

      {showForm && <EventForm onSubmit={create} onCancel={() => setShowForm(false)} />}
      {editing && <EventForm key={editing.id} initial={editing} onSubmit={update} onCancel={() => setEditing(null)} />}

      {loading && <p className="loading">Loading…</p>}
      {!loading && events.length === 0 && !showForm && (
        <div className="empty">
          <p className="empty-title">No events yet.</p>
          <p>Promote a show, workshop or open studio — it will appear on the Events page.</p>
        </div>
      )}

      <div className="event-list">
        {events.map(ev => (
          <EventCard key={ev.id} event={ev} showArtist={false}>
            <button type="button" className="link-btn"
              onClick={() => { setEditing(ev); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              Edit
            </button>
            <button type="button" className="link-btn danger" onClick={() => remove(ev)}>Delete</button>
          </EventCard>
        ))}
      </div>
    </>
  )
}

export default MyEvents
