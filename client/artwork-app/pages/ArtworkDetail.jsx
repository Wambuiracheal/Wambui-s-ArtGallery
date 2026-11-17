import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, formatKES } from '../api'
import BuyButton from '../components/BuyButton'
import { useAuth } from '../context/AuthContext'

function ArtworkDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [art, setArt] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setArt(null)
    api(`/artworks/${id}`).then(setArt).catch(err => setError(err.message))
  }, [id])

  if (error) return <div className="page"><p className="form-error">{error}</p></div>
  if (!art) return <div className="page"><p className="loading">Loading…</p></div>

  const isOwner = user && user.id === art.artist_id

  return (
    <div className="page detail">
      <figure className="detail-figure">
        <img src={art.image} alt={art.title} />
      </figure>

      <div className="detail-info">
        <Link to="/shop" className="back-link">← Back to the shop</Link>
        {art.category && <p className="eyebrow">{art.category}</p>}
        <h1 className="page-title detail-title">{art.title}</h1>
        <p className="detail-artist">
          by {art.artist_id ? <Link to={`/artists/${art.artist_id}`}>{art.artist}</Link> : art.artist}
        </p>
        <p className="detail-price">{formatKES(art.price)}</p>
        {art.status !== 'available' && (
          <p className={`pill status-${art.status}`}>{art.status === 'sold' ? 'Sold' : 'Reserved by a collector'}</p>
        )}
        {art.description && <p className="lede">{art.description}</p>}

        <div className="detail-actions">
          <BuyButton art={art} buyNow />
          <BuyButton art={art} className="btn btn-outline" />
          {isOwner && <Link to="/dashboard?tab=artworks" className="btn btn-dark">Manage in dashboard</Link>}
        </div>

        <ul className="detail-notes">
          <li>✦ Original work, sold directly by the artist</li>
          <li>✦ Pay securely with M-Pesa (coming soon)</li>
        </ul>
      </div>
    </div>
  )
}

export default ArtworkDetail
