import { Link, useSearchParams } from 'react-router-dom'
import { ROLE_LABELS } from '../api'
import Avatar from '../components/Avatar'
import Connections from '../components/dashboard/Connections'
import MyArtworks from '../components/dashboard/MyArtworks'
import MyEvents from '../components/dashboard/MyEvents'
import Orders from '../components/dashboard/Orders'
import ProfileForm from '../components/dashboard/ProfileForm'
import Sales from '../components/dashboard/Sales'
import { useAuth } from '../context/AuthContext'

const TABS = {
  artist: [
    ['artworks', 'My artworks', MyArtworks],
    ['events', 'Events', MyEvents],
    ['sales', 'Sales', Sales],
    ['connections', 'Companies', Connections],
    ['profile', 'Profile', ProfileForm],
  ],
  customer: [
    ['orders', 'My orders', Orders],
    ['profile', 'Profile', ProfileForm],
  ],
  company: [
    ['connections', 'Artist connections', Connections],
    ['profile', 'Company profile', ProfileForm],
  ],
}

const QUICK_LINKS = {
  artist: [['/events', 'See all events'], ['/companies', 'Find companies'], ['/artists/', 'View my public page']],
  customer: [['/shop', 'Browse the shop'], ['/artists', 'Discover artists'], ['/events', "What's on"]],
  company: [['/artists', 'Discover artists'], ['/events', 'Upcoming events'], ['/companies/', 'View my public page']],
}

function Dashboard() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const tabs = TABS[user.role] || []
  const active = tabs.find(([key]) => key === params.get('tab')) || tabs[0]
  const ActivePanel = active[2]

  return (
    <div className="page dashboard">
      <header className="dash-head">
        <Avatar user={user} size={72} />
        <div>
          <p className="eyebrow">{ROLE_LABELS[user.role]} dashboard</p>
          <h1 className="section-title">Hi, <em>{user.name.split(' ')[0]}</em> 👋</h1>
        </div>
        <nav className="dash-quick">
          {QUICK_LINKS[user.role].map(([to, label]) => (
            <Link key={label} to={to.endsWith('/') ? to + user.id : to} className="link-btn">{label} →</Link>
          ))}
        </nav>
      </header>

      <div className="tabs" role="tablist">
        {tabs.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={active[0] === key}
            className={'tab' + (active[0] === key ? ' is-active' : '')}
            onClick={() => setParams({ tab: key })}>
            {label}
          </button>
        ))}
      </div>

      <section className="dash-panel" key={active[0]}>
        <ActivePanel />
      </section>
    </div>
  )
}

export default Dashboard
