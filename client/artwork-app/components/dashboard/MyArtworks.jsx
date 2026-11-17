import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import ArtTile from '../ArtTile'
import ArtworkForm from './ArtworkForm'

function MyArtworks() {
  const { user } = useAuth()
  const [art, setArt] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/artworks?artist_id=${user.id}`)
      .then(setArt)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user.id])

  const create = (values) =>
    api('/artworks', { method: 'POST', body: values }).then(a => {
      setArt(list => [a, ...list])
      setShowForm(false)
    })

  const update = (values) =>
    api(`/artworks/${editing.id}`, { method: 'PATCH', body: values }).then(a => {
      setArt(list => list.map(x => (x.id === a.id ? a : x)))
      setEditing(null)
    })

  const remove = (a) => {
    if (!window.confirm(`Remove "${a.title}" from your collection?`)) return
    api(`/artworks/${a.id}`, { method: 'DELETE' })
      .then(() => setArt(list => list.filter(x => x.id !== a.id)))
      .catch(err => alert(err.message))
  }

  const counts = {
    available: art.filter(a => a.status === 'available').length,
    reserved: art.filter(a => a.status === 'reserved').length,
    sold: art.filter(a => a.status === 'sold').length,
  }

  return (
    <>
      <div className="panel-head">
        <div className="stat-row">
          <span className="stat"><strong>{counts.available}</strong> available</span>
          <span className="stat"><strong>{counts.reserved}</strong> reserved</span>
          <span className="stat"><strong>{counts.sold}</strong> sold</span>
        </div>
        <button type="button" className="btn btn-dark" onClick={() => { setShowForm(s => !s); setEditing(null) }}>
          {showForm ? 'Close' : '+ Upload artwork'}
        </button>
      </div>

      {showForm && <ArtworkForm onSubmit={create} onCancel={() => setShowForm(false)} />}
      {editing && (
        <ArtworkForm key={editing.id} initial={editing} onSubmit={update}
          onCancel={() => setEditing(null)} submitLabel="Save changes" />
      )}

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && art.length === 0 && !showForm && (
        <div className="empty">
          <p className="empty-title">Your walls are empty.</p>
          <p>Upload your first artwork so collectors can find it.</p>
        </div>
      )}

      <ul className="gallery-grid">
        {art.map(a => (
          <li key={a.id}>
            <ArtTile art={a} showArtist={false}>
              <button type="button" className="link-btn"
                onClick={() => { setEditing(a); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                Edit
              </button>
              {a.status === 'available' && (
                <button type="button" className="link-btn danger" onClick={() => remove(a)}>Delete</button>
              )}
            </ArtTile>
          </li>
        ))}
      </ul>
    </>
  )
}

export default MyArtworks
