import { useState } from 'react'

const EMPTY = { title: '', image: '', price: '', category: '', description: '' }

/** Create / edit an artwork. onSubmit(values) must return a promise. */
function ArtworkForm({ initial, onSubmit, onCancel, submitLabel = 'Add to collection' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, description: initial?.description || '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { title, image, price, category, description } = form
    onSubmit({ title, image, price, category, description })
      .then(() => { if (!initial) setForm(EMPTY) })
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  return (
    <section className="new-art">
      <div className="new-art-intro">
        <p className="eyebrow">{initial ? 'Edit artwork' : 'New artwork'}</p>
        <h2 className="section-title">
          {initial ? <>Update <em>{initial.title}</em></> : <>Upload a new <em>piece</em></>}
        </h2>
        {form.image && (
          <div className="new-art-preview">
            <img src={form.image} alt="Preview" />
          </div>
        )}
      </div>

      <form className="new-art-form" onSubmit={submit}>
        <label className="field full">
          <span>Title</span>
          <input name="title" value={form.title} onChange={change} placeholder="Untitled No. 4" required />
        </label>
        <label className="field full">
          <span>Image URL</span>
          <input name="image" value={form.image} onChange={change} placeholder="https://…" required />
        </label>
        <label className="field">
          <span>Price (KSh)</span>
          <input type="number" name="price" value={form.price} onChange={change} min="0" required />
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" value={form.category} onChange={change} required>
            <option value="">Select category</option>
            <option value="painting">painting</option>
            <option value="sculpture">sculpture</option>
            <option value="photography">photography</option>
          </select>
        </label>
        <label className="field full">
          <span>Description</span>
          <textarea name="description" value={form.description} onChange={change} rows={4}
            placeholder="Medium, size, the story behind it…" />
        </label>
        {error && <p className="form-error full">{error}</p>}
        <div className="row-actions full">
          <button type="submit" className="btn btn-accent" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
          {onCancel && <button type="button" className="link-btn" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </section>
  )
}

export default ArtworkForm
