import { initials } from '../api'

function Avatar({ user, size = 56 }) {
  const style = { width: size, height: size, fontSize: size * 0.38 }
  if (user?.avatar) {
    return <img className="avatar" src={user.avatar} alt={user.name} style={style} />
  }
  return <span className={`avatar avatar-${user?.role || 'artist'}`} style={style}>{initials(user?.name)}</span>
}

export default Avatar
