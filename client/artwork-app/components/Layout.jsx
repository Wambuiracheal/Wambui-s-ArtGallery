import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Cursor from './fx/Cursor.jsx'
import Header from './Header.jsx'

function Layout() {
  const { pathname } = useLocation()

  // New page → start at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      {/* Curtain wipe on every page change (re-mounts via key) */}
      <div key={pathname} className="curtain" aria-hidden="true">
        <span className="curtain-word">Horizon<i>.</i></span>
      </div>
      <Cursor />
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span className="brand small">Horizon<span className="brand-dot">.</span></span>
        <span>Painting · Sculpture · Photography</span>
        <span>© {new Date().getFullYear()} Horizon Art Gallery</span>
      </footer>
    </>
  )
}

export default Layout
