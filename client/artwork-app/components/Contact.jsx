import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="page contact">
      <div className="contact-intro">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title">
          Let&apos;s <em>talk</em> art.
        </h1>
        <p className="lede">
          Have questions about a piece, an acquisition or a collaboration? Feel free to reach out.
        </p>
        <dl className="contact-details">
          <div>
            <dt>Visit</dt>
            <dd>Tue – Sun, 10:00 – 18:00</dd>
          </div>
          <div>
            <dt>Response time</dt>
            <dd>Within two working days</dd>
          </div>
        </dl>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea name="message" placeholder="Tell us what you're looking for…" value={formData.message} onChange={handleChange} required />
        </label>
        <button type="submit" className="btn btn-accent">Send message</button>
      </form>
    </div>
  );
};

export default Contact;
