import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import ArtistReveal from './fx/ArtistReveal';
import HorizontalGallery from './fx/HorizontalGallery';
import '../App.css';
import '../home.css';

const images = [
  'https://images6.alphacoders.com/476/476288.jpg',
  'https://images7.alphacoders.com/406/406736.jpg',
  'https://images6.alphacoders.com/341/341236.jpg',
  'https://images5.alphacoders.com/134/1345268.png',
  'https://picfiles.alphacoders.com/302/302369.jpg',
  'https://picfiles.alphacoders.com/271/271190.jpg',
];

const statement = 'We collect art that makes you stop, smile and feel something.'.split(' ');

const rooms = [
  { name: 'Painting', emoji: '🎨', blurb: 'Brushstrokes, colour and big feelings on canvas.', tone: 'pink' },
  { name: 'Sculpture', emoji: '🗿', blurb: 'Clay, stone and metal shaped into stories.', tone: 'butter' },
  { name: 'Photography', emoji: '📷', blurb: 'Little moments, held still forever.', tone: 'mint' },
];

const pad = (n) => String(n).padStart(2, '0');

/* Tiny hand-drawn doodles */
const Star = ({ className }) => (
  <svg className={`doodle ${className}`} viewBox="0 0 40 40" aria-hidden="true">
    <path d="M20 3l4.5 11.5L37 16l-9.5 8 3 12.5L20 30l-10.5 6.5 3-12.5L3 16l12.5-1.5z" />
  </svg>
);
const Squiggle = ({ className }) => (
  <svg className={`doodle line ${className}`} viewBox="0 0 120 30" aria-hidden="true">
    <path d="M3 15c12-14 22-14 30 0s18 14 28 0 20-14 28 0 18 14 28 0" />
  </svg>
);
const Blob = ({ className }) => (
  <svg className={`doodle ${className}`} viewBox="0 0 200 200" aria-hidden="true">
    <path d="M45.3,-58.6C57.6,-47.3,65.5,-31.6,69.4,-14.6C73.3,2.4,73.2,20.6,65.1,34.3C57,48,40.9,57.2,23.9,63.6C6.9,70,-11,73.6,-27.6,68.6C-44.2,63.6,-59.5,50,-67.5,33.2C-75.5,16.4,-76.2,-3.6,-70,-20.9C-63.8,-38.2,-50.7,-52.8,-35.6,-63.5C-20.5,-74.2,-3.4,-81,12.2,-77.9C27.8,-74.8,33,-69.9,45.3,-58.6Z" transform="translate(100 100)" />
  </svg>
);

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length);
  };

  // Autoplay; restarts the timer whenever the slide changes (incl. manual nav)
  useEffect(() => {
    const timer = setTimeout(nextSlide, 6000);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Expose scroll position + progress as CSS variables for parallax effects
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight || 1;
      root.style.setProperty('--sy', y);
      root.style.setProperty('--progress', Math.min(y / max, 1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
      root.style.removeProperty('--sy');
      root.style.removeProperty('--progress');
    };
  }, []);

  return (
    <div className="home">
      <div className="scroll-progress" aria-hidden="true" />

      {/* ---------- Hero ---------- */}
      <section className="hero">
        {images.map((src, i) => (
          <div
            key={src}
            className={'hero-slide' + (i === currentSlide ? ' is-active' : '')}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={i !== currentSlide}
          />
        ))}
        <div className="hero-shade" />

        <div className="hero-content">
          <p className="eyebrow light">Contemporary Art Gallery</p>
          <h1 className="hero-title">
            Art that holds<br />
            <em>the horizon.</em>
          </h1>
          <p className="hero-lede">
            A living collection of painting, sculpture and photography — curated, collected and shared.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-accent">Shop the collection</Link>
            <Link to="/about" className="btn btn-ghost">Our story</Link>
          </div>
        </div>

        <div className="hero-controls">
          <span className="hero-count">
            <strong>{pad(currentSlide + 1)}</strong> / {pad(images.length)}
          </span>
          <div className="hero-dots">
            {images.map((src, i) => (
              <button
                key={src}
                className={'dot' + (i === currentSlide ? ' is-active' : '')}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Show slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="hero-arrows">
            <button className="icon-btn" onClick={prevSlide} aria-label="Previous slide">←</button>
            <button className="icon-btn" onClick={nextSlide} aria-label="Next slide">→</button>
          </div>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>scroll</span>
          <i />
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              Painting <i>✦</i> Sculpture <i>✦</i> Photography <i>✦</i> Mixed Media <i>✦</i> New Acquisitions <i>✦</i>&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Statement (word-by-word reveal) ---------- */}
      <section className="statement">
        <Blob className="blob blob-a" />
        <Star className="star star-a" />
        <Squiggle className="squiggle-a" />
        <Reveal as="p" className="eyebrow">Hello, art lover</Reveal>
        <h2 className="statement-text">
          {statement.map((word, i) => (
            <Reveal as="span" key={i} className="word" delay={i * 70}>
              {word === 'smile' || word === 'feel' ? <em>{word}</em> : word}{' '}
            </Reveal>
          ))}
        </h2>
      </section>

      {/* ---------- Kinetic type (rows slide opposite ways on scroll) ---------- */}
      <section className="kinetic" aria-hidden="true">
        {[0, 1].map(row => (
          <div key={row} className={`kinetic-row row-${row}`}>
            {Array.from({ length: 4 }).map((_, k) => (
              <span key={k}>
                {row === 0
                  ? <>Paint <b>✦</b> <i>Sculpt</i> <b>✦</b> Shoot <b>✦</b> <i>Collect</i> <b>✦</b> </>
                  : <><i>Create</i> <b>●</b> Connect <b>●</b> <i>Exhibit</i> <b>●</b> Inspire <b>●</b> </>}
              </span>
            ))}
          </div>
        ))}
      </section>

      {/* ---------- Featured works (pinned horizontal scroll) ---------- */}
      <HorizontalGallery fallbackImages={images} />

      {/* ---------- Rooms (pop-in cards) ---------- */}
      <section className="rooms">
        <Star className="star star-b" />
        <Reveal className="rooms-head">
          <p className="eyebrow">Wander the rooms</p>
          <h2 className="section-title">Pick a <em>room</em> to explore</h2>
        </Reveal>
        <div className="rooms-grid">
          {rooms.map((room, i) => (
            <Reveal key={room.name} variant="pop" delay={i * 150}>
              <Link to="/shop" className={`room-card tone-${room.tone}`}>
                <span className="room-emoji">{room.emoji}</span>
                <h3>{room.name}</h3>
                <p>{room.blurb}</p>
                <span className="room-go">Visit →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Artists (hover-reveal list) ---------- */}
      <ArtistReveal />

      {/* ---------- Tilted ribbon ---------- */}
      <div className="ribbon" aria-hidden="true">
        <div className="marquee-track reverse">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              made with love <i>♥</i> hung with care <i>♥</i> collected by you <i>♥</i>&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Call to action ---------- */}
      <section className="cta">
        <Blob className="blob blob-b" />
        <Squiggle className="squiggle-b" />
        <Reveal variant="zoom" className="cta-inner">
          <h2 className="section-title">Got a piece the world <em>should see?</em></h2>
          <p className="lede">Add it to the Horizon collection in a few clicks.</p>
          <div className="hero-actions center">
            <Link to="/signup?role=artist" className="btn btn-accent">Sell as an artist</Link>
            <Link to="/companies" className="btn btn-outline">Hire an artist</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default App;
