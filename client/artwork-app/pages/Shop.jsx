import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import ArtTile from '../components/ArtTile'
import BuyButton from '../components/BuyButton'

const categories = ['all', 'painting', 'sculpture', 'photography']

function Shop() {
  const [art, setArt] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => {
    api('/artworks')
      .then(setArt)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = art.filter(a =>
      (filter === 'all' || a.category === filter) &&
      (!availableOnly || a.status === 'available') &&
      (!q || a.title.toLowerCase().includes(q) || (a.artist || '').toLowerCase().includes(q)))
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [art, filter, query, sort, availableOnly])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">The Shop</p>
          <h1 className="page-title">Find art you <em>love</em></h1>
        </div>
        <p className="page-meta">{visible.length} {visible.length === 1 ? 'piece' : 'pieces'}</p>
      </header>

      <div className="toolbar">
        <div className="chips" role="tablist" aria-label="Filter by category">
          {categories.map(c => (
            <button key={c} type="button" role="tab" aria-selected={filter === c}
              className={'chip' + (filter === c ? ' is-active' : '')} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <input className="search" type="search" placeholder="Search title or artist…"
            value={query} onChange={e => setQuery(e.target.value)} />
          <select className="sort" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
          <label className="toggle">
            <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} />
            <span>Available only</span>
          </label>
        </div>
      </div>

      {loading && <p className="loading">Loading the collection…</p>}
      {error && <p className="form-error">Couldn&apos;t load artworks: {error}</p>}
      {!loading && !error && visible.length === 0 && (
        <div className="empty">
          <p className="empty-title">Nothing matches yet.</p>
          <p>Try another category or search.</p>
        </div>
      )}

      <ul className="gallery-grid">
        {visible.map(a => (
          <li key={a.id}>
            <ArtTile art={a}>
              <BuyButton art={a} className="btn btn-dark btn-sm" />
            </ArtTile>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Shop
