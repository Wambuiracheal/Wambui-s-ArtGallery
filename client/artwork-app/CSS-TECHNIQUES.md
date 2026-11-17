# Horizon Art Gallery: CSS & Motion Techniques

This guide covers every styling and animation technique used on the Horizon site. Each entry gives the technique's **name** (handy for searching tutorials), what it does, **where it lives** in this project and **how it works**, with a short snippet from our code.

**Where the styles live**

| File | What's in it |
|---|---|
| [App.css](App.css) | Design tokens, base styles, buttons, header, hero, collection cards, About and Contact |
| [home.css](home.css) | Homepage sections, scroll reveals, doodles, parallax |
| [pages.css](pages.css) | Shop, profiles, events, cart, sign-in, dashboard |
| [fx.css](fx.css) | Cursor, magnetic buttons, grain, page curtain, kinetic type, pinned gallery, hover-reveal list, auto-hiding header |
| [components/fx/](components/fx/) | The JavaScript behind the effects that need it |

---

## Contents

**Foundations**
1. [Design tokens (CSS custom properties)](#1-design-tokens-css-custom-properties)
2. [Fluid typography with `clamp()`](#2-fluid-typography-with-clamp)
3. [Font pairing](#3-font-pairing)
4. [Custom easing curves](#4-custom-easing-curves)
5. [Intrinsic responsive grid](#5-intrinsic-responsive-grid)

**Surfaces & decoration**

6. [Glassmorphism header](#6-glassmorphism-header)
7. [Neo-brutalist offset shadows](#7-neo-brutalist-offset-shadows)
8. [Film grain overlay](#8-film-grain-overlay)
9. [Gradient scrim](#9-gradient-scrim)
10. [Inline SVG doodles & float loops](#10-inline-svg-doodles--float-loops)
11. [Gradient-filled text & edge-fade mask](#11-gradient-filled-text--edge-fade-mask)
12. [Offset frame](#12-offset-frame)
13. [Custom select arrow](#13-custom-select-arrow)
14. [Line clamping](#14-line-clamping)

**Motion**

15. [Crossfade slideshow with Ken Burns zoom](#15-crossfade-slideshow-with-ken-burns-zoom)
16. [Infinite marquee](#16-infinite-marquee)
17. [Animated underline](#17-animated-underline)
18. [Hamburger-to-X morph](#18-hamburger-to-x-morph)
19. [Scroll-triggered reveals](#19-scroll-triggered-reveals)
20. [Staggered animation with a delay variable](#20-staggered-animation-with-a-delay-variable)
21. [Split-text (word-by-word) reveal](#21-split-text-word-by-word-reveal)
22. [Clip-path mask reveal](#22-clip-path-mask-reveal)
23. [Scroll-linked parallax](#23-scroll-linked-parallax)
24. [Scroll progress bar](#24-scroll-progress-bar)
25. [Pinned horizontal scroll](#25-pinned-horizontal-scroll)
26. [Inner image parallax](#26-inner-image-parallax)
27. [Kinetic typography](#27-kinetic-typography)
28. [Page transition curtain](#28-page-transition-curtain)

**Interaction**

29. [Custom cursor follower](#29-custom-cursor-follower)
30. [Magnetic buttons](#30-magnetic-buttons)
31. [Hover-reveal image list](#31-hover-reveal-image-list)
32. [Smooth (inertia) scrolling](#32-smooth-inertia-scrolling)
33. [Auto-hiding header](#33-auto-hiding-header)
34. [Sticky sidebar](#34-sticky-sidebar)

**Doing it responsibly**

35. [Motion & device media queries](#35-motion--device-media-queries)
36. [Animation performance rules](#36-animation-performance-rules)

---

## Foundations

### 1. Design tokens (CSS custom properties)

**Where:** `:root` at the top of [App.css](App.css)

Every colour, font, easing curve and spacing value is defined once as a variable and reused everywhere. To change the palette, edit these lines.

```css
:root {
  --paper: #f3efe7;   /* gallery-wall background */
  --ink: #151413;     /* text */
  --accent: #e2522b;  /* vermilion */
  --pink: #f8cdd6;  --butter: #f8e2a0;  --mint: #c4e6d2;  --lilac: #dcd0f5;

  --gutter: clamp(16px, 4vw, 56px);
  --header-h: 72px;
}

.btn-accent { background: var(--accent); }
```

**Tip:** a variable can be overridden on a single element, and only that element and its children see the new value. Several effects below rely on this.

---

### 2. Fluid typography with `clamp()`

**Where:** almost every heading (`.page-title`, `.hero-title`, `.kinetic-row`…)

`clamp(MIN, PREFERRED, MAX)` lets text grow with the screen width without media queries. The middle value uses `vw` (1% of the viewport width).

```css
.hero-title { font-size: clamp(48px, 8.5vw, 124px); }
```

On a phone the title stays at 48px or more, on desktop it scales with the window, and it stops growing at 124px. The same trick sets padding (`--gutter`) and gaps.

---

### 3. Font pairing

**Where:** loaded in [index.html](index.html) from Google Fonts; tokens are in [App.css](App.css)

| Token | Font | Used for |
|---|---|---|
| `--font-display` | **Fredoka**: rounded and friendly | Headings, prices, numbers |
| `--font-hand` | **Caveat**: handwritten | Accent words, labels, the marquee |
| `--font-body` | **Nunito**: soft, highly readable | Body text, forms |

Every `<em>` is styled as the handwritten accent, so writing `Find art you <em>love</em>` gives a coloured, hand-lettered word:

```css
em {
  font-family: var(--font-hand);
  font-style: normal;
  font-size: 1.12em;
  color: var(--accent);
}
```

---

### 4. Custom easing curves

**Where:** `--ease`, `--ease-soft`, `--ease-inout` in [App.css](App.css)

An easing curve controls how an animation speeds up and slows down. Default CSS easings feel mechanical. A **cubic-bezier** curve gives the "expensive" glide you see on award-winning sites.

```css
--ease:       cubic-bezier(.16, 1, .3, 1);   /* expo-out: fast start, long glide  */
--ease-soft:  cubic-bezier(.22, 1, .36, 1);  /* gentler, for hovers                */
--ease-inout: cubic-bezier(.76, 0, .24, 1);  /* slow-fast-slow, for the page wipe  */

.nav-link::after { transition: transform .35s var(--ease); }
```

**Tip:** experiment visually at [cubic-bezier.com](https://cubic-bezier.com). A middle number above 1 (e.g. `1.56`) makes the motion overshoot and bounce, which feels cute; values of 1 or below feel sleek.

---

### 5. Intrinsic responsive grid

**Where:** `.gallery-grid`, `.people-grid`, `.conn-grid`

This grid works out its own number of columns, with no media queries:

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}
```

- `auto-fill` fits as many columns as there is room for.
- `minmax(300px, 1fr)` means each column is at least 300px and shares any leftover space.
- `min(100%, 300px)` stops a column overflowing on screens narrower than 300px.

---

## Surfaces & decoration

### 6. Glassmorphism header

**Where:** `.site-header` in [App.css](App.css)

The header is a frosted-glass bar: semi-transparent, with whatever is behind it blurred.

```css
.site-header {
  position: sticky;
  top: 0;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
}
```

`color-mix()` makes a see-through version of a token colour without typing a separate `rgba()` value.

---

### 7. Neo-brutalist offset shadows

**Where:** `.room-card`, `.person-card`, `.checkout`, `.auth-card`, `.success-card`

The cartoon, sticker-like look comes from a solid shadow with **no blur**, offset down and to the right, plus a thick border.

```css
.room-card {
  border: 2px solid var(--ink);
  border-radius: 28px;
  box-shadow: 6px 6px 0 var(--ink);   /* x  y  blur=0  colour */
  transition: transform .3s var(--ease-soft), box-shadow .3s var(--ease);
}
.room-card:hover {
  transform: translateY(-6px);
  box-shadow: 10px 12px 0 var(--ink);  /* shadow grows as the card lifts */
}
```

---

### 8. Film grain overlay

**Where:** `body::after` in [fx.css](fx.css)

A faint noise texture over the whole site makes it feel printed rather than flat. The noise is an **SVG `feTurbulence` filter** embedded as a data URI, so there's no image file to download.

```css
body::after {
  content: "";
  position: fixed;
  inset: -50%;
  z-index: 200;
  pointer-events: none;   /* clicks pass straight through */
  opacity: .045;
  background-image: url("data:image/svg+xml,…<feTurbulence type='fractalNoise' baseFrequency='.85' …/>…");
}
```

**Tip:** add `animation: grain 1.2s steps(5) infinite` (the keyframes are still in `fx.css`) for a flickering, film-projector feel.

---

### 9. Gradient scrim

**Where:** `.hero-shade` in [App.css](App.css)

Two stacked gradients darken the photo behind the hero text so it stays readable on any image.

```css
.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(10,9,8,.78) 0%, rgba(10,9,8,.1) 100%),  /* dark left edge */
    linear-gradient(0deg,  rgba(10,9,8,.6)  0%, transparent 35%);       /* dark bottom    */
}
```

---

### 10. Inline SVG doodles & float loops

**Where:** `Star`, `Squiggle`, `Blob` in [components/Artwork.jsx](components/Artwork.jsx); styles under "Doodles" in [home.css](home.css)

Hand-drawn shapes are small inline SVGs that take their colour from `currentColor`, so recolouring one is a single `color:` line. A gentle keyframe loop keeps them alive.

```css
.doodle path { fill: currentColor; }
.doodle.line path { fill: none; stroke: currentColor; stroke-width: 4; stroke-linecap: round; }

.star { color: var(--accent); animation: float 5s ease-in-out infinite; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50%      { transform: translateY(-14px) rotate(12deg); }
}
```

Use a negative `animation-delay` (e.g. `-2s`) so several doodles start at different points in the loop instead of moving in sync.

---

### 11. Gradient-filled text & edge-fade mask

**Where:** `.kinetic` and `.kinetic-row.row-1` in [fx.css](fx.css)

**Gradient-filled text:** the bottom row of the kinetic band looks as if paint shows through the letters. A background is painted on the element, then **clipped to the shape of the text**, and the text itself is made transparent so the background shows through.

```css
.kinetic-row.row-1 span {
  background-image:
    radial-gradient(circle at 12% 30%, var(--accent) 0 18%, transparent 42%),  /* paint blobs */
    radial-gradient(circle at 63% 25%, var(--pink) 0 18%, transparent 44%),
    linear-gradient(90deg, var(--pink), var(--butter), var(--accent), var(--lilac));  /* base wash */
  background-size: 1200px 100%;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Stacking several soft `radial-gradient`s over a `linear-gradient` gives a painterly, uneven fill instead of a flat stripe. You could use a photo instead with `background-image: url(...)`.

**Edge-fade mask:** the band's left and right edges fade to nothing, so words drift in and out instead of being cut off. A `mask-image` gradient controls visibility: black means visible and transparent means hidden.

```css
.kinetic {
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
```

**Gotcha: outlined text.** Hollow text is usually made with `color: transparent; -webkit-text-stroke: 2px …`. With **variable fonts** like Fredoka, that outline shows the overlapping shapes each letter is built from, such as the crossing strokes in a "t". Use a font whose outlines don't overlap, or use a fill effect like the one above.

---

### 12. Offset frame

**Where:** `.about-figure::before` in [App.css](App.css)

The thin accent-coloured border sitting behind the About image is a pseudo-element pushed down and to the right with `inset`.

```css
.about-figure::before {
  content: "";
  position: absolute;
  inset: 24px -24px -24px 24px;   /* top right bottom left */
  border: 1px solid var(--accent);
}
```

---

### 13. Custom select arrow

**Where:** `select` in [App.css](App.css)

The browser's default dropdown arrow is removed and replaced with a small chevron drawn from **two linear-gradient triangles**, with no image needed.

```css
select {
  appearance: none;
  background-image:
    linear-gradient(45deg,  transparent 50%, var(--muted) 50%),
    linear-gradient(135deg, var(--muted) 50%, transparent 50%);
  background-position: calc(100% - 10px) 52%, calc(100% - 5px) 52%;
  background-size: 5px 5px;
  background-repeat: no-repeat;
}
```

---

### 14. Line clamping

**Where:** `.person-bio` in [pages.css](pages.css)

Long bios are cut off after three lines with an ellipsis.

```css
.person-bio {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Motion

### 15. Crossfade slideshow with Ken Burns zoom

**Where:** `.hero-slide` in [App.css](App.css); slide logic in [components/Artwork.jsx](components/Artwork.jsx)

All slides are stacked on top of each other and only the active one is visible. Changing the class fades between slides, and each one slowly zooms out. A slow zoom over a still photo is known as the **Ken Burns effect**, after the documentary filmmaker.

```css
.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 1.4s var(--ease), transform 7s linear;
}
.hero-slide.is-active { opacity: 1; transform: scale(1); }
```

A `setTimeout` in React moves to the next slide every 6 seconds and restarts the timer whenever someone clicks.

---

### 16. Infinite marquee

**Where:** `.marquee` and `.marquee-track` in [App.css](App.css); `.ribbon` in [home.css](home.css)

Scrolling text that never ends. The trick is to **render the content twice** and move the track left by exactly half its width. At that point the second copy sits exactly where the first started, so the loop restarts without a visible jump.

```css
.marquee { overflow: hidden; white-space: nowrap; }
.marquee-track { display: inline-flex; animation: marquee 32s linear infinite; }

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* the ribbon: same track, reversed and tilted */
.marquee-track.reverse { animation-direction: reverse; }
.ribbon { transform: rotate(-2.5deg) scale(1.05); }
```

---

### 17. Animated underline

**Where:** `.nav-link::after` in [App.css](App.css)

An underline that draws in from the left on hover. The line is always there, squashed to zero width with `scaleX(0)`.

```css
.nav-link::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;     /* grow from the left edge */
  transition: transform .35s var(--ease);
}
.nav-link:hover::after,
.nav-link.active::after { transform: scaleX(1); }
```

The same scale-from-an-edge idea fills the artist rows with yellow (`.artist-row::before`, using `scaleY` from the bottom).

---

### 18. Hamburger-to-X morph

**Where:** `.menu-toggle` in [pages.css](pages.css)

On mobile the three menu bars animate into an X: the top bar rotates down, the middle one fades and the bottom bar rotates up.

```css
.menu-open .menu-toggle span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.menu-open .menu-toggle span:nth-child(2) { opacity: 0; }
.menu-open .menu-toggle span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
```

---

### 19. Scroll-triggered reveals

**Where:** [components/Reveal.jsx](components/Reveal.jsx); styles at the top of [home.css](home.css)

Elements start hidden and animate in the first time they scroll into view. JavaScript only adds a class: an **IntersectionObserver** watches the element and adds `.is-visible`. The CSS does all the animating.

```jsx
const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) { setVisible(true); io.disconnect() }
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
```

```css
.reveal { opacity: 0; transition: opacity .9s var(--ease), transform .9s var(--ease); }
.reveal-up    { transform: translateY(40px); }
.reveal-left  { transform: translateX(-70px); }
.reveal-zoom  { transform: scale(.85); }
.reveal-tilt  { transform: translateY(60px) rotate(-2deg); }
.reveal.is-visible { opacity: 1; transform: none; }
```

**Usage:** `<Reveal variant="left">…</Reveal>`

---

### 20. Staggered animation with a delay variable

**Where:** `Reveal`'s `delay` prop

To make items appear one after another, each element gets its own `--delay` variable, which the shared transition reads.

```jsx
<Reveal delay={i * 120}>…</Reveal>   // sets style="--delay: 240ms"
```

```css
.reveal { transition: opacity .9s var(--ease) var(--delay, 0ms), … }
```

Grids do the same in pure CSS with `nth-child`:

```css
.gallery-grid > li:nth-child(3n+2) { animation-delay: .08s; }
.gallery-grid > li:nth-child(3n+3) { animation-delay: .16s; }
```

---

### 21. Split-text (word-by-word) reveal

**Where:** the statement section in [components/Artwork.jsx](components/Artwork.jsx)

The sentence is split into words, and each word becomes its own staggered reveal.

```jsx
'We collect art that makes you stop…'.split(' ').map((word, i) => (
  <Reveal as="span" className="word" delay={i * 70}>{word} </Reveal>
))
```

```css
.word { display: inline-block; white-space: pre; } /* transforms need inline-block */
```

---

### 22. Clip-path mask reveal

**Where:** `.reveal-clip` in [home.css](home.css), used for the artist rows; `.curtain` and `.artist-float img` in [fx.css](fx.css)

Instead of fading, the element is uncovered as if a mask slides away. `clip-path: inset()` crops from each side, and animating it from 100% to 0 wipes the element into view.

```css
.reveal-clip            { clip-path: inset(100% 0 0 0); } /* fully hidden: cropped from the top */
.reveal-clip.is-visible { clip-path: inset(0 0 0 0); }    /* fully shown */
```

The floating artist preview swaps images the same way: the new image wipes up over the old one.

---

### 23. Scroll-linked parallax

**Where:** the scroll handler in [components/Artwork.jsx](components/Artwork.jsx); `--sy` rules in [home.css](home.css) and [fx.css](fx.css)

**Parallax** means layers moving at different speeds as you scroll. JavaScript writes the scroll position into a CSS variable, and the CSS turns it into movement with `calc()`.

```js
// only on elements marked data-sy (see tip)
targets.forEach(el => el.style.setProperty('--sy', window.scrollY))
```

```css
/* hero text drifts down and fades out */
.home .hero-content {
  transform: translateY(calc(var(--sy, 0) * .35px));
  opacity: calc(1 - var(--sy, 0) / 650);
}
/* blob drifts up and slowly rotates */
.blob-a { transform: translateY(calc(var(--sy, 0) * -.15px)) rotate(calc(var(--sy, 0) * .05deg)); }
```

**Tip (performance):** don't set a changing variable on `:root`. Every element inherits it, so the browser has to recheck the whole page's styles on every frame. Set it only on the elements that use it.

---

### 24. Scroll progress bar

**Where:** `.scroll-progress` in [home.css](home.css)

A gradient bar across the top of the window fills as you scroll. It's full width, scaled down from the left edge.

```css
.scroll-progress {
  position: fixed; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--pink), var(--accent), var(--butter));
  transform-origin: left;
}
```

```js
bar.style.transform = `scaleX(${scrollY / (scrollHeight - innerHeight)})`
```

---

### 25. Pinned horizontal scroll

**Where:** [components/fx/HorizontalGallery.jsx](components/fx/HorizontalGallery.jsx); `.hgallery*` in [fx.css](fx.css)

Scrolling down moves the gallery **sideways**. Three pieces make it work:

1. **A tall outer section.** JavaScript sets its height to the track's extra width plus one screen height, which gives you room to scroll.
2. **A sticky inner frame** that stays pinned to the screen while you scroll through that height.
3. **A wide track** inside the frame, moved left as you scroll.

```css
.hgallery-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.hgallery-track  { display: flex; width: max-content; will-change: transform; }
```

```js
const distance = track.scrollWidth - window.innerWidth
section.style.height = `${distance + window.innerHeight}px`
// on scroll:
const progress = clamp(-rect.top / (rect.height - innerHeight), 0, 1)
track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`
```

On phones it falls back to a normal swipe row with **scroll snapping**:

```css
.hgallery-sticky { overflow-x: auto; scroll-snap-type: x mandatory; }
.hgallery-card   { scroll-snap-align: start; }
```

**Gotcha:** `position: sticky` stops working if a parent has `overflow: hidden`. The homepage wrapper uses `overflow-x: clip` instead, which hides sideways overflow without breaking sticky.

---

### 26. Inner image parallax

**Where:** `.hgallery-img img` in [fx.css](fx.css)

While the gallery slides, each picture also drifts slightly *inside* its frame, which adds depth. The image is scaled up so the edges never show, then shifted using the gallery's progress (`--hp`, from 0 to 1).

```css
.hgallery-img { overflow: hidden; border-radius: 24px; }
.hgallery-img img { transform: translateX(calc(var(--hp, 0) * -10%)) scale(1.2); }
```

---

### 27. Kinetic typography

**Where:** `.kinetic` in [fx.css](fx.css)

**Kinetic typography** means text that moves. On a dark band, two rows of huge words slide in opposite directions as you scroll. The top row is solid cream with handwritten accent words; the bottom row is gradient-filled (see [#11](#11-gradient-filled-text--edge-fade-mask)). They use the same `--sy` variable as parallax, with opposite signs.

```css
.kinetic-row.row-0 { transform: translateX(calc(-12% - var(--sy, 0) * .22px)); }  /* moves left  */
.kinetic-row.row-1 { transform: translateX(calc(-55% + var(--sy, 0) * .22px)); }  /* moves right */
```

Each row repeats its text four times, so it never runs out on wide screens.

---

### 28. Page transition curtain

**Where:** `.curtain` in [fx.css](fx.css); rendered in [components/Layout.jsx](components/Layout.jsx)

On every page change a dark panel showing "Horizon." wipes upward off the screen.

The trick is React's **`key` remount**: giving the curtain `key={pathname}` makes React throw it away and create a fresh one on every route change, which restarts its CSS animation.

```jsx
<div key={pathname} className="curtain"><span className="curtain-word">Horizon<i>.</i></span></div>
```

```css
.curtain { position: fixed; inset: 0; background: var(--ink); pointer-events: none;
           animation: curtain-up .7s var(--ease-inout) .1s both; }

@keyframes curtain-up {
  from { clip-path: inset(0 0 0 0); }
  to   { clip-path: inset(0 0 100% 0); visibility: hidden; }
}
```

---

## Interaction

### 29. Custom cursor follower

**Where:** [components/fx/Cursor.jsx](components/fx/Cursor.jsx); `.cursor*` in [fx.css](fx.css)

A ring trails the mouse with a soft delay, grows over links, shows a label over artworks and shrinks when you click.

**Lerp (linear interpolation)** creates the trailing feel. Every frame the ring moves 18% of the remaining distance to the mouse, so it moves quickly when far away and settles gently.

```js
pos.x += (target.x - pos.x) * 0.18
pos.y += (target.y - pos.y) * 0.18
ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
requestAnimationFrame(loop)
```

The cursor reads what's under the mouse and switches state classes. Add `data-cursor="View"` to any element to show a label:

```css
.cursor-link  .cursor-ring { width: 60px; height: 60px; border-color: var(--accent); }
.cursor-label .cursor-ring { width: 92px; height: 92px; background: var(--accent); }
.cursor.is-down .cursor-ring { transform: scale(.8); }
```

It only switches on for a real mouse, via the media query `(hover: hover) and (pointer: fine)`.

---

### 30. Magnetic buttons

**Where:** also in [Cursor.jsx](components/fx/Cursor.jsx); `body .btn` in [fx.css](fx.css)

Buttons lean toward the cursor. JavaScript measures how far the mouse is from the button's centre and writes a quarter of that distance into `--mx` / `--my`, and the CSS moves the button.

```js
const r = el.getBoundingClientRect()
el.style.setProperty('--mx', `${(e.clientX - (r.left + r.width / 2)) * 0.25}px`)
el.style.setProperty('--my', `${(e.clientY - (r.top + r.height / 2)) * 0.35}px`)
```

```css
body .btn       { transform: translate(var(--mx, 0px), var(--my, 0px)); }
body .btn:hover { transform: translate(var(--mx, 0px), calc(var(--my, 0px) - 2px)); }
```

The button's existing `transition` smooths the movement, and the variables are cleared when the mouse leaves.

---

### 31. Hover-reveal image list

**Where:** [components/fx/ArtistReveal.jsx](components/fx/ArtistReveal.jsx); `.artist-*` in [fx.css](fx.css)

Hovering a large artist name makes one of their artworks float beside the cursor. It combines several earlier techniques:

- **lerp follow** (like the cursor), at a slower 12% for a heavier, floaty feel
- **velocity tilt:** the faster you move sideways, the more the image leans
- **clip-path swap** when moving to a different artist
- **springy scale-in** on first hover

```js
const dx = target.x - pos.x
pos.x += dx * 0.12
const tilt = Math.max(Math.min(dx * 0.05, 12), -12)          // capped at ±12°
floater.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`
```

On touch screens (`@media (hover: none)`) the floating image is hidden and each row shows a small thumbnail instead.

---

### 32. Smooth (inertia) scrolling

**Where:** [components/fx/smoothScroll.js](components/fx/smoothScroll.js), using the [Lenis](https://github.com/darkroomengineering/lenis) library

Mouse-wheel scrolling glides to a stop instead of jumping in steps. This is the single biggest reason award-winning sites feel smooth. Lenis takes over wheel scrolling and eases the real page scroll position, so `position: sticky`, scroll listeners and IntersectionObserver all keep working.

```js
lenis = new Lenis({
  duration: 1.15,
  easing: (t) => 1 - Math.pow(1 - t, 4),    // quart-out
  smoothWheel: true,
  prevent: (node) => node.nodeName === 'TEXTAREA' || node.hasAttribute?.('data-lenis-prevent'),
})
const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf) }
```

Rules to follow:

- **Remove `html { scroll-behavior: smooth }`.** It fights Lenis.
- **Use our `scrollToTop()` helper** instead of `window.scrollTo(...)`.
- **Add `data-lenis-prevent`** to any inner box that should scroll on its own.

---

### 33. Auto-hiding header

**Where:** [components/Header.jsx](components/Header.jsx); `.site-header.is-hidden` in [fx.css](fx.css)

The header slides away while you scroll down and comes back the moment you scroll up. JavaScript compares the current scroll position with the previous one. A 4px dead zone stops it flickering on tiny movements.

```js
const delta = y - lastY
if (Math.abs(delta) > 4) { setHidden(delta > 0 && y > 160); lastY = y }
```

```css
.site-header { transition: transform .6s var(--ease), box-shadow .4s var(--ease); }
.site-header.is-hidden   { transform: translateY(-100%); }
.site-header.is-scrolled { box-shadow: 0 10px 30px -18px rgba(20, 15, 10, .35); }
```

---

### 34. Sticky sidebar

**Where:** `.checkout` (cart) and `.detail-info` (artwork page) in [pages.css](pages.css)

The order summary and artwork details stay in view while the rest of the page scrolls.

```css
.checkout { position: sticky; top: calc(var(--header-h) + 24px); }

@media (max-width: 900px) { .checkout { position: static; } } /* single column on mobile */
```

---

## Doing it responsibly

### 35. Motion & device media queries

Every effect checks what the visitor's device and settings can handle.

| Media query | Meaning | What we do |
|---|---|---|
| `(prefers-reduced-motion: reduce)` | The visitor asked their OS for less motion | Turn off smooth scrolling, the curtain, parallax, pinning, the cursor and the grain animation; show reveals immediately |
| `(hover: hover) and (pointer: fine)` | A real mouse | Enable the custom cursor and magnetic buttons |
| `(hover: none)` | A touch screen | Swap the floating artist image for in-row thumbnails |
| `(max-width: 767px)` | A phone | Pinned gallery becomes a swipe row; menu becomes a hamburger |

```css
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; }
  .curtain { display: none; }
}
```

In JavaScript, the same checks use `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

### 36. Animation performance rules

These habits keep everything running smoothly:

1. **Animate only `transform` and `opacity`** (and `clip-path` sparingly). Changing `top`, `left`, `width` or `margin` forces the browser to recalculate the layout every frame.
2. **Throttle scroll handlers with `requestAnimationFrame`** so the work runs at most once per frame:
   ```js
   const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
   ```
3. **Use passive listeners**, `addEventListener('scroll', fn, { passive: true })`, so the browser never waits on your code before scrolling.
4. **Use `will-change: transform` only on things that move constantly** (the gallery track and marquee), and remove it once a one-off reveal finishes (`.reveal.is-visible { will-change: auto; }`).
5. **Use `translate3d()`** for elements moved by JavaScript every frame. This keeps them on the GPU.
6. **Scope changing CSS variables** to the elements that use them, never `:root` (see [#23](#23-scroll-linked-parallax)).
7. **Disconnect observers and cancel animation frames** when a component unmounts, so nothing keeps running in the background.

---

### Quick glossary

| Term | Meaning |
|---|---|
| **Easing / cubic-bezier** | The speed curve of an animation |
| **Lerp** | Moving a fraction of the remaining distance each frame, for smooth following |
| **Parallax** | Layers moving at different speeds as you scroll |
| **Kinetic typography** | Text that moves |
| **Ken Burns effect** | A slow zoom or pan over a still image |
| **Marquee** | Text that scrolls endlessly in a loop |
| **Clip-path reveal / mask** | Uncovering an element by animating a crop |
| **Glassmorphism** | A frosted, blurred, semi-transparent surface |
| **Neo-brutalism** | Thick borders and hard, unblurred offset shadows |
| **Split text** | Breaking text into words or letters so each can animate on its own |
| **Pinning** | Holding a section fixed on screen while scrolling drives an animation |
| **Inertia / smooth scroll** | Scrolling that keeps moving briefly and eases to a stop |
| **Magnetic button** | A button pulled toward the cursor |
| **Intersection Observer** | The browser API that reports when an element enters the screen |
