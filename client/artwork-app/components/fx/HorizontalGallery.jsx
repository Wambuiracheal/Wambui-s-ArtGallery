import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatKES } from '../../api'

const pad = (n) => String(n).padStart(2, '0')
const PIN_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'

/**
 * Pinned horizontal gallery: the section sticks while vertical scrolling
 * slides the track sideways. On phones / reduced motion it becomes a swipe row.
 */
function HorizontalGallery({ fallbackImages }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [works, setWorks] = useState(() =>
    fallbackImages.map((image, i) => ({ id: null, image, title: `Collection piece ${pad(i + 1)}`, artist: 'Horizon' })))

  // Prefer real artworks from the shop when there are enough of them
  useEffect(() => {
    api('/artworks?available=1')
      .then(list => { if (list.length >= 3) setWorks(list.slice(0, 8)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const mq = window.matchMedia(PIN_QUERY)
    let frame = 0

    const update = () => {
      frame = 0
      if (!mq.matches) return
      const distance = track.scrollWidth - window.innerWidth
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight || 1
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1)
      track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`
      section.style.setProperty('--hp', progress.toFixed(4))
    }
    const size = () => {
      if (!mq.matches) {
        section.style.height = ''
        track.style.transform = ''
        return
      }
      section.style.height = `${track.scrollWidth - window.innerWidth + window.innerHeight}px`
      update()
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }

    const ro = new ResizeObserver(size)
    ro.observe(track)
    size()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', size)
    mq.addEventListener('change', size)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', size)
      mq.removeEventListener('change', size)
    }
  }, [])

  return (
    <section className="hgallery" ref={sectionRef} aria-label="Featured artworks">
      <div className="hgallery-sticky">
        <div className="hgallery-track" ref={trackRef}>
          <div className="hgallery-intro">
            <p className="eyebrow">On the walls</p>
            <h2 className="section-title">Featured <em>favourites</em></h2>
            <p className="lede">Fresh from the studios — keep scrolling to take a walk down the corridor.</p>
            <span className="hgallery-hint" aria-hidden="true">scroll <i>→</i></span>
          </div>

          {works.map((w, i) => (
            <Link
              key={w.id ?? w.image}
              to={w.id ? `/artworks/${w.id}` : '/shop'}
              className={`hgallery-card ${i % 2 ? 'is-low' : 'is-high'}`}
              data-cursor="View"
            >
              <div className="hgallery-img">
                <img src={w.image} alt={w.title} loading="lazy" />
              </div>
              <div className="hgallery-cap">
                <span className="hgallery-num">{pad(i + 1)}</span>
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.artist}</p>
                </div>
                {w.price != null && <span className="hgallery-price">{formatKES(w.price)}</span>}
              </div>
            </Link>
          ))}

          <Link to="/shop" className="hgallery-end" data-cursor="Shop">
            <span>See the</span>
            <em>whole shop</em>
            <span className="hgallery-end-arrow">→</span>
          </Link>
        </div>

        <div className="hgallery-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}

export default HorizontalGallery
