import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate, formatKES } from '../../api'

export const ORDER_STATUS = {
  pending_payment: ['Awaiting payment', 'reserved'],
  paid: ['Paid', 'available'],
  cancelled: ['Cancelled', 'sold'],
}

export function StatusPill({ status }) {
  const [label, tone] = ORDER_STATUS[status] || [status, '']
  return <span className={`pill status-${tone}`}>{label}</span>
}

function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/sales').then(setSales).finally(() => setLoading(false))
  }, [])

  const earned = sales.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.price, 0)
  const pending = sales.filter(s => s.status === 'pending_payment').reduce((sum, s) => sum + s.price, 0)

  return (
    <>
      <div className="panel-head">
        <div className="stat-row">
          <span className="stat"><strong>{formatKES(earned)}</strong> paid</span>
          <span className="stat"><strong>{formatKES(pending)}</strong> awaiting payment</span>
        </div>
      </div>

      {loading && <p className="loading">Loading…</p>}
      {!loading && sales.length === 0 && (
        <div className="empty">
          <p className="empty-title">No sales yet.</p>
          <p>When a collector orders one of your pieces, it shows up here.</p>
        </div>
      )}

      {sales.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Artwork</th><th>Buyer</th><th>Order</th><th>Date</th><th>Price</th><th>Status</th></tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td>{s.artwork ? <Link to={`/artworks/${s.artwork.id}`}>{s.title}</Link> : s.title}</td>
                  <td>{s.buyer}</td>
                  <td>#{s.order_id}</td>
                  <td>{formatDate(s.created_at)}</td>
                  <td>{formatKES(s.price)}</td>
                  <td><StatusPill status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default Sales
