import React from "react";
import { Link } from "react-router-dom";

const AboutArtwork = () => {
  return (
    <div className="page about">
      <section className="about-hero">
        <div className="about-copy">
          <p className="eyebrow">About the gallery</p>
          <h1 className="page-title">
            Every piece tells a <em>story.</em>
          </h1>
          <p className="lede">
            Art is a powerful expression of creativity, emotion, and storytelling.
            Each piece tells a unique story, capturing moments, ideas, and inspirations.
          </p>
          <p>
            Our collection showcases a variety of styles, from classical paintings
            to modern digital art, reflecting the diversity of artistic expression.
          </p>
          <Link to="/shop" className="btn btn-dark">Visit the shop</Link>
        </div>

        <figure className="about-figure">
          <img
            src="https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_640.jpg"
            alt="Artwork"
          />
          <figcaption>From the permanent collection</figcaption>
        </figure>
      </section>

      <section className="pillars">
        <div className="pillar">
          <span className="pillar-num">01</span>
          <h3>Painting</h3>
          <p>From classical oils to bold contemporary canvases.</p>
        </div>
        <div className="pillar">
          <span className="pillar-num">02</span>
          <h3>Sculpture</h3>
          <p>Form, material and space — works you can walk around.</p>
        </div>
        <div className="pillar">
          <span className="pillar-num">03</span>
          <h3>Photography</h3>
          <p>Moments held still, from documentary to the abstract.</p>
        </div>
      </section>
    </div>
  );
};

export default AboutArtwork;
