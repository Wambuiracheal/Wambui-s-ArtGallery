import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import Reveal from '../Reveal'

/**
 * Big-type list of artists. Hovering a name floats one of their artworks
 * next to the cursor. On touch screens a small thumbnail shows in the row.
 */
function ArtistReveal() {
  const [artists, setArtists] = useState([])
  const [active, setActive] = useState(null)
  const sectionRef = useRef(null)
  const floatRef = useRef(null)

  useEffect(() => {
    api('/artworks')
      .then(list => {
        const byArtist = new Map()
        list.forEach(a => {
          if (!a.artist_id) return
          const entry = byArtist.get(a.artist_id) || { id: a.artist_id, name: a.artist, image: a.image, count: 0 }
          entry.count += 1
          byArtist.set(a.artist_id, entry)
        })
        setArtists([...byArtist.values()].sort((a, b) => b.count - a.count).slice(0, 6))
      })
      .catch(() => {})
  }, [])

  // Smoothly follow the mouse, tilting with horizontal speed
  useEffect(() => {
    const section = sectionRef.current
    const floater = floatRef.current
    if (!section || !floater) return
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    let frame = 0
    const loop = () => {
      const dx = target.x - pos.x
      pos.x += dx * 0.12
      pos.y += (target.y - pos.y) * 0.12
      const tilt = Math.max(Math.min(dx * 0.05, 12), -12)
      floater.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`
      frame = requestAnimationFrame(loop)
    }
    const onMove = (e) => {
      const r = section.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
    }
    section.addEventListener('mousemove', onMove)
    frame = requestAnimationFrame(loop)
    return () => {
      section.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [artists.length])

  if (artists.length === 0) return null

  return (
    <section className="artist-reveal" ref={sectionRef} onMouseLeave={() => setActive(null)}>
      <Reveal className="artist-reveal-head">
        <p className="eyebrow">The makers</p>
        <h2 className="section-title">Meet the <em>artists</em></h2>
      </Reveal>

      <ul className="artist-rows">
        {artists.map((a, i) => (
          <li key={a.id}>
            <Reveal variant="clip" delay={i * 90}>
              <Link
                to={`/artists/${a.id}`}
                className={'artist-row' + (active === i ? ' is-active' : '')}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                data-cursor="Meet"
              >
                <span className="artist-row-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="artist-row-name">{a.name}</span>
                <img className="artist-row-thumb" src={a.image} alt="" loading="lazy" />
                <span className="artist-row-count">{a.count} {a.count === 1 ? 'work' : 'works'}</span>
                <span className="artist-row-arrow" aria-hidden="true">↗</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>

      <Link to="/artists" className="btn btn-outline artist-reveal-all">All artists →</Link>

      <div ref={floatRef} className={'artist-float' + (active !== null ? ' is-visible' : '')} aria-hidden="true">
        {artists.map((a, i) => (
          <img key={a.id} src={a.image} alt="" className={active === i ? 'is-current' : ''} />
        ))}
      </div>
    </section>
  )
}

export default ArtistReveal
