import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../Avatar'

const FIELDS = ['name', 'bio', 'avatar', 'location', 'phone', 'website', 'industry']

function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map(f => [f, user[f] || ''])))
  const [status, setStatus] = useState({ busy: false, error: '', saved: false })

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setStatus({ busy: true, error: '', saved: false })
    updateProfile(form)
      .then(() => setStatus({ busy: false, error: '', saved: true }))
      .catch(err => setStatus({ busy: false, error: err.message, saved: false }))
  }

  const isCompany = user.role === 'company'

  return (
    <form className="panel-form profile-form" onSubmit={submit}>
      <div className="profile-preview full">
        <Avatar user={{ ...user, ...form }} size={88} />
        <div>
          <strong>{form.name || 'Your name'}</strong>
          <p className="muted small">{user.email}</p>
        </div>
      </div>

      <label className="field"><span>{isCompany ? 'Company name' : 'Name'}</span>
        <input name="name" value={form.name} onChange={change} required /></label>
      <label className="field"><span>Location</span>
        <input name="location" value={form.location} onChange={change} placeholder="Nairobi" /></label>
      {isCompany && (
        <label className="field"><span>Industry</span>
          <input name="industry" value={form.industry} onChange={change} placeholder="Hospitality" /></label>
      )}
      <label className="field"><span>Phone {user.role === 'customer' && '(M-Pesa)'}</span>
        <input name="phone" type="tel" value={form.phone} onChange={change} placeholder="0712 345 678" /></label>
      <label className="field"><span>Website / Instagram</span>
        <input name="website" value={form.website} onChange={change} placeholder="https://…" /></label>
      <label className="field full"><span>Profile picture URL</span>
        <input name="avatar" value={form.avatar} onChange={change} placeholder="https://…" /></label>
      {user.role !== 'customer' && (
        <label className="field full"><span>{isCompany ? 'About the company & what art you need' : 'Artist bio'}</span>
          <textarea name="bio" value={form.bio} onChange={change} rows={4} /></label>
      )}

      {status.error && <p className="form-error full">{status.error}</p>}
      <div className="row-actions full">
        <button type="submit" className="btn btn-accent" disabled={status.busy}>{status.busy ? 'Saving…' : 'Save profile'}</button>
        {status.saved && <span className="saved-note">Saved ✓</span>}
      </div>
      {user.role !== 'customer' && (
        <p className="muted small full">Your phone and email are only shared with people you connect with.</p>
      )}
    </form>
  )
}

export default ProfileForm
