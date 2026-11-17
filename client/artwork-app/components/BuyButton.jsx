import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

/** Add-to-cart control. Hidden for artist/company accounts (only collectors buy). */
function BuyButton({ art, buyNow = false, className = 'btn btn-accent' }) {
  const { user } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const status = art.status || 'available'

  if (user && user.role !== 'customer') return null
  if (status !== 'available') {
    return <button type="button" className={className} disabled>{status === 'sold' ? 'Sold' : 'Reserved'}</button>
  }
  if (cart.has(art.id)) {
    return <Link to="/cart" className="btn btn-outline">In cart ✓</Link>
  }
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        cart.add(art)
        if (buyNow) navigate('/cart')
      }}
    >
      {buyNow ? 'Buy now' : 'Add to cart'}
    </button>
  )
}

export default BuyButton
