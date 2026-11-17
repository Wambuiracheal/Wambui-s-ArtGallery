import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Avatar from './Avatar'

const links = [
  ['/shop', 'Shop'],
  ['/artists', 'Artists'],
  ['/events', 'Events'],
  ['/companies', 'For business'],
  ['/about', 'About'],
]

function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [location.pathname])

  const showCart = !user || user.role === 'customer'

  return (
    <header className={'site-header' + (open ? ' menu-open' : '')}>
      <Link to="/" className="brand">
        Horizon<span className="brand-dot">.</span>
      </Link>

      <nav className="nav" id="main-nav">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            {label}
          </NavLink>
        ))}
        <div className="nav-account">
          {user ? (
            <>
              <Link to="/dashboard" className="account-chip">
                <Avatar user={user} size={30} />
                <span>Dashboard</span>
              </Link>
              <button type="button" className="link-btn" onClick={() => { logout(); navigate('/') }}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Log in</NavLink>
              <Link to="/signup" className="btn btn-dark btn-sm">Join</Link>
            </>
          )}
        </div>
      </nav>

      <div className="header-tools">
        {showCart && (
          <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>
            <i className="fa fa-shopping-bag" aria-hidden="true" />
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
        )}
        <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="main-nav"
          aria-label="Menu" onClick={() => setOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}

export default Header
