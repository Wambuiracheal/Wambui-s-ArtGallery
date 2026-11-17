import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatKES } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Cart() {
  const { user } = useAuth()
  const cart = useCart()
  const [phone, setPhone] = useState(user?.phone || '')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const checkout = (e) => {
    e.preventDefault()
    setPlacing(true)
    setError('')
    api('/orders', { method: 'POST', body: { artwork_ids: cart.items.map(i => i.id), phone } })
      .then(o => { setOrder(o); cart.clear() })
      .catch(err => {
        setError(err.message)
        // Drop pieces someone else reserved in the meantime
        if (err.data?.unavailable_ids) cart.removeMany(err.data.unavailable_ids)
      })
      .finally(() => setPlacing(false))
  }

  if (order) {
    return (
      <div className="page narrow">
        <div className="success-card">
          <span className="success-emoji">🎉</span>
          <h1 className="section-title">Order #{order.id} <em>placed!</em></h1>
          <p className="lede">
            We&apos;ve reserved {order.items.length === 1 ? 'this piece' : `these ${order.items.length} pieces`} for you.
            Total: <strong>{formatKES(order.total)}</strong>.
          </p>
          <p className="muted">
            M-Pesa payment is coming soon — you&apos;ll get a prompt on {order.phone} to complete your purchase.
          </p>
          <div className="row-actions center">
            <Link to="/dashboard?tab=orders" className="btn btn-dark">View my orders</Link>
            <Link to="/shop" className="btn btn-outline">Keep browsing</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Your cart</p>
          <h1 className="page-title">Almost <em>yours</em></h1>
        </div>
        <p className="page-meta">{cart.count} {cart.count === 1 ? 'piece' : 'pieces'}</p>
      </header>

      {cart.count === 0 ? (
        <div className="empty spaced">
          <p className="empty-title">Your cart is empty.</p>
          <p><Link to="/shop" className="btn btn-dark">Browse the shop</Link></p>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {cart.items.map(item => (
              <li key={item.id} className="cart-item">
                <Link to={`/artworks/${item.id}`}><img src={item.image} alt={item.title} /></Link>
                <div>
                  <h3 className="art-title">{item.title}</h3>
                  <p className="art-artist">{item.artist}</p>
                </div>
                <p className="art-price">{formatKES(item.price)}</p>
                <button type="button" className="link-btn danger" onClick={() => cart.remove(item.id)}>Remove</button>
              </li>
            ))}
          </ul>

          <aside className="checkout">
            <h2 className="checkout-title">Summary</h2>
            <p className="checkout-row"><span>Subtotal</span><span>{formatKES(cart.total)}</span></p>
            <p className="checkout-row"><span>Delivery</span><span>Arranged with the artist</span></p>
            <p className="checkout-row total"><span>Total</span><span>{formatKES(cart.total)}</span></p>

            {!user && (
              <div className="checkout-note">
                <p>Log in as a collector to check out.</p>
                <div className="row-actions">
                  <Link to="/login?next=/cart" className="btn btn-dark">Log in</Link>
                  <Link to="/signup?role=customer&next=/cart" className="btn btn-outline">Create account</Link>
                </div>
              </div>
            )}
            {user && user.role !== 'customer' && (
              <p className="checkout-note">You&apos;re signed in as {user.role === 'artist' ? 'an artist' : 'a company'}. Use a collector account to buy art.</p>
            )}
            {user?.role === 'customer' && (
              <form onSubmit={checkout} className="checkout-form">
                <label className="field">
                  <span>M-Pesa phone number</span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" required />
                </label>
                {error && <p className="form-error">{error}</p>}
                <button type="submit" className="btn btn-accent full" disabled={placing}>
                  {placing ? 'Placing order…' : `Place order · ${formatKES(cart.total)}`}
                </button>
                <p className="muted small">Your pieces are reserved when you order. M-Pesa payment is coming soon.</p>
              </form>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

export default Cart
