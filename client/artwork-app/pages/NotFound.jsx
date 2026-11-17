import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="page narrow">
      <div className="success-card">
        <span className="success-emoji">🖼️</span>
        <h1 className="section-title">This wall is <em>empty</em></h1>
        <p className="lede">We couldn&apos;t find that page.</p>
        <div className="row-actions center">
          <Link to="/" className="btn btn-dark">Go home</Link>
          <Link to="/shop" className="btn btn-outline">Visit the shop</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
