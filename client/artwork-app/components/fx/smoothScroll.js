import Lenis from 'lenis'

let lenis = null
let frame = 0

/** Inertia scrolling for mouse wheels/trackpads. Touch keeps native scrolling. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 4), // quart-out: quick start, long soft landing
    smoothWheel: true,
    // let textareas and marked areas scroll natively
    prevent: (node) => node.nodeName === 'TEXTAREA' || node.hasAttribute?.('data-lenis-prevent'),
  })
  const raf = (time) => {
    lenis.raf(time)
    frame = requestAnimationFrame(raf)
  }
  frame = requestAnimationFrame(raf)
}

export function stopSmoothScroll() {
  cancelAnimationFrame(frame)
  lenis?.destroy()
  lenis = null
}

/** Use instead of window.scrollTo so smooth scrolling doesn't fight it */
export function scrollToTop({ smooth = false } = {}) {
  if (lenis) lenis.scrollTo(0, { immediate: !smooth })
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
}
