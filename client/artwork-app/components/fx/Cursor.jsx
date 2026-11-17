import { useEffect, useRef, useState } from 'react'

const INTERACTIVE = 'a, button, [role="tab"], label, select, summary'
const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]), textarea'
const MAGNETIC = '.btn, .icon-btn, .cart-link'

/**
 * Trailing ring cursor + magnetic buttons. Desktop (fine pointer) only.
 * Add data-cursor="Label" to any element to show a label inside the ring.
 */
function Cursor() {
  const ringRef = useRef(null)
  const [enabled] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)
  const [mode, setMode] = useState({ type: 'default', label: '' })

  useEffect(() => {
    if (!enabled) return
    const ring = ringRef.current
    const target = { x: -100, y: -100 }
    const pos = { x: -100, y: -100 }
    let frame = 0
    let magnet = null

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18
      pos.y += (target.y - pos.y) * 0.18
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    const releaseMagnet = () => {
      if (magnet) {
        magnet.style.removeProperty('--mx')
        magnet.style.removeProperty('--my')
        magnet = null
      }
    }

    const onMove = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      ring.classList.add('is-visible')

      const el = e.target.closest?.(MAGNETIC)
      if (el !== magnet) releaseMagnet()
      if (el && !el.disabled) {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${(e.clientX - (r.left + r.width / 2)) * 0.25}px`)
        el.style.setProperty('--my', `${(e.clientY - (r.top + r.height / 2)) * 0.35}px`)
        magnet = el
      }
    }

    const onOver = (e) => {
      const labelled = e.target.closest?.('[data-cursor]')
      if (labelled) return setMode({ type: 'label', label: labelled.dataset.cursor })
      if (e.target.closest?.(TEXT_INPUT)) return setMode({ type: 'text', label: '' })
      if (e.target.closest?.(INTERACTIVE)) return setMode({ type: 'link', label: '' })
      setMode({ type: 'default', label: '' })
    }

    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')
    const onLeave = () => { ring.classList.remove('is-visible'); releaseMagnet() }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      releaseMagnet()
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={ringRef} className={`cursor cursor-${mode.type}`} aria-hidden="true">
      <span className="cursor-ring">{mode.type === 'label' && <span className="cursor-label">{mode.label}</span>}</span>
    </div>
  )
}

export default Cursor
