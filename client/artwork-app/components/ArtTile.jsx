import { Link } from 'react-router-dom'
import { formatKES } from '../api'

const STATUS_LABEL = { reserved: 'Reserved', sold: 'Sold' }

/** Artwork card used across the shop, profiles and the artist dashboard */
function ArtTile({ art, showArtist = true, children }) {
  const status = art.status || 'available'
  return (
    <article className="art-card">
      <Link to={`/artworks/${art.id}`} className="art-frame">
        <img src={art.image} alt={art.title} loading="lazy" />
        {art.category && <span className="art-tag">{art.category}</span>}
        {STATUS_LABEL[status] && <span className={`art-status status-${status}`}>{STATUS_LABEL[status]}</span>}
      </Link>

      <div className="art-caption">
        <div>
          <h3 className="art-title"><Link to={`/artworks/${art.id}`}>{art.title}</Link></h3>
          {showArtist && (art.artist_id
            ? <Link to={`/artists/${art.artist_id}`} className="art-artist">{art.artist}</Link>
            : <p className="art-artist">{art.artist}</p>)}
        </div>
        <p className="art-price">{formatKES(art.price)}</p>
      </div>

      {children && <div className="art-actions">{children}</div>}
    </article>
  )
}

export default ArtTile
