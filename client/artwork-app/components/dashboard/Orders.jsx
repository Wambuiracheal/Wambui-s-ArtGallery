import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate, formatKES } from '../../api'
import { StatusPill } from './Sales'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/orders').then(setOrders).finally(() => setLoading(false))
  }, [])

  const cancel = (order) => {
    if (!window.confirm(`Cancel order #${order.id}? The artworks will be released for others to buy.`)) return
    api(`/orders/${order.id}`, { method: 'PATCH', body: { status: 'cancelled' } })
      .then(updated => setOrders(list => list.map(o => (o.id === updated.id ? updated : o))))
      .catch(err => alert(err.message))
  }

  if (loading) return <p className="loading">Loading…</p>
  if (orders.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No orders yet.</p>
        <p><Link to="/shop" className="btn btn-dark">Find something you love</Link></p>
      </div>
    )
  }

  return (
    <div className="order-list">
      {orders.map(order => (
        <article key={order.id} className="order-card">
          <header className="order-head">
            <div>
              <h3>Order #{order.id}</h3>
              <p className="muted small">{formatDate(order.created_at, { timeStyle: 'short' })} · M-Pesa {order.phone}</p>
            </div>
            <StatusPill status={order.status} />
          </header>
          <ul className="order-items">
            {order.items.map(item => (
              <li key={item.id}>
                {item.artwork && <img src={item.artwork.image} alt="" />}
                <span>{item.artwork ? <Link to={`/artworks/${item.artwork.id}`}>{item.title}</Link> : item.title}</span>
                <span>{formatKES(item.price)}</span>
              </li>
            ))}
          </ul>
          <footer className="order-foot">
            <strong>Total {formatKES(order.total)}</strong>
            {order.status === 'pending_payment' && (
              <div className="row-actions">
                <button type="button" className="btn btn-accent btn-sm" disabled title="M-Pesa integration coming soon">
                  Pay with M-Pesa (soon)
                </button>
                <button type="button" className="link-btn danger" onClick={() => cancel(order)}>Cancel order</button>
              </div>
            )}
          </footer>
        </article>
      ))}
    </div>
  )
}

export default Orders
