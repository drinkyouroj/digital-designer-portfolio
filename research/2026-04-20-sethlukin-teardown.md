# Site Teardown: Seth Lukin — Digital Product Designer

**URL:** https://sethlukin.com/
**Built by:** Seth Lukin (self-built in Framer). Awwwards + CSSDA badges in footer.
**Platform:** **Framer** (no-code visual builder). Confirmed via `<!-- Made in Framer · framer.com ✨ -->` comment, `<meta name="generator" content="Framer c0d7099">`, and all assets served from `framerusercontent.com`.
**Published:** 2026-01-21 (SSR release timestamp in source)
**Date analyzed:** 2026-04-20

## TL;DR

A single-page Framer portfolio that *feels* custom because the designer bolted three hand-coded layers on top of Framer's runtime: (1) a **cursor override module** swapping between `eyes`, `eyes-alt`, and `native` cursor variants via `data-cursor` attributes; (2) an **inline scroll-gate script** that adds an `.offscreen` class to two decorative GL/canvas layers (`HeroGL`, `FooterGL`) when they're more than 120vh from the viewport, freeing GPU when the user is mid-page; (3) a pair of **code-component layers** (`HeroGL`, `FooterGL`) which are almost certainly WebGL/shader backgrounds (translated/opacity-animated, pinned behind content). Everything else — layout, typography, case-study cards, GIF coins, hero locker — is stock Framer.

## Tech Stack (Confirmed from Source)

| Technology | Evidence | Purpose |
|---|---|---|
| **Framer (runtime)** | `<meta generator="Framer c0d7099">`, `data-framer-hydrate-v2`, `framerusercontent.com` | Page builder + runtime |
| **React** | `modulepreload` for `react.DBMwKX5P.mjs` | Framer runtime uses React under the hood |
| **Framer Motion** | `modulepreload` for `motion.C4KItM4E.mjs` | All entrance/hover/scroll animations |
| **Custom Cursor override** | `Cursor_override.DmAbYLXC.mjs` — `CursorEyes`, `CursorNative`, `CursorFinger` factories setting `data-cursor`, `data-cursor-press`, `data-clickable` | Pixel-art cursor with `eyes`/`eyes-alt` states that swap on hover/press |
| **Custom Scrollbar override** | `Scrollbar.C1CH0JiG.mjs` modulepreload | Styled scrollbar |
| **Vanilla JS scroll gate** | Inline `<script>` querying `[data-framer-name="HeroGL"]` / `[data-framer-name="FooterGL"]`, toggling `.offscreen` class past 120vh | Perf: pauses expensive GL layers off-screen |
| **HeroGL / FooterGL code components** | Framer "code component" layers with `will-change:transform`, live-animated `opacity` (0.64) and `transform:translateY(1000px)` | Shader/canvas background scenes (hero top, footer bottom) |
| **Google Fonts (Manrope)** | `fonts.gstatic.com/s/manrope/v20/...` @ 500, 600, 700 | Body/UI type |
| **Self-hosted fonts** | `framerusercontent.com/assets/*.woff2` — Fragment Mono, Onest | Monospace metadata + secondary display |
| **Fontshare (Fontshare WOFF2)** | `third-party-assets/fontshare/wf/...` | Additional display face |
| **Google Analytics 4** | `G-RZ6YZTTY3P` via gtag | Analytics |
| **GIF sprite** | `JJQM2LwcsxBlrtv0sIG9ruzooo.gif` used in `[data-framer-name="Coin"]` | Animated pixel coin (the Mario coin feel) |
| **Search index** | `searchIndex-*.json` prefetched | Framer built-in search (likely unused on home, but loaded) |

**Not used:** No GSAP, no Lenis, no Locomotive, no Barba, no Swup, no Three.js (by name). The "GL" naming and `ogl`-ish substring in bundle names only hint at WebGL — the shader code lives inside Framer code components and isn't split out.

## Design System

### Colors — extracted from inline styles

| Role | Value |
|---|---|
| **Page background** | `rgb(238, 238, 238)` — warm off-white #EEEEEE |
| **Ink / primary text** | `rgb(0, 0, 0)` |
| **Signature accent (the "orange-red")** | `rgb(255, 47, 0)` — #FF2F00 |
| **Soft pink tint** | `rgb(241, 190, 190)` — #F1BEBE |
| **Panel white** | `rgb(255, 255, 255)` |
| **Mid-grey dividers** | `rgb(217, 217, 217)` / `rgb(206, 206, 206)` / `rgb(207, 207, 207)` |
| **Label grey** | `rgb(178, 178, 178)` |

The signature move is **#FF2F00 over #EEEEEE** — a warm industrial vermillion on cream. Pink (#F1BEBE) shows up as a hover / secondary accent.

### Typography

| Role | Family | Weight | Notes |
|---|---|---|---|
| Headlines (DIGITAL PRODUCT DESIGNER) | **Manrope** | 700 | All-caps, tight tracking, fit-to-width (`framer-fit-text`) |
| Body / taglines | **Manrope** | 500–600 | Generous line-height |
| Metadata labels (NEW YORK, LAST UPDATED) | **Fragment Mono** (self-hosted) | 400 | Monospace, small caps feel |
| Secondary display | **Onest** (self-hosted) | 400–600 | Used on some cards |

Google Manrope served via `fonts.gstatic.com/s/manrope/v20/*.woff2` with 6 unicode subsets (latin, latin-ext, cyrillic, cyrillic-ext, greek, vietnamese) at 500/600/700. Fragment Mono + Onest shipped from `framerusercontent.com/assets/*.woff2`. Fontshare hosts an additional face.

### Spacing / sizing

Framer's responsive primitive is **three breakpoints** (extracted from `data-framer-hydrate-v2`):
- Desktop: `(min-width: 1200px)` → hash `1e106ie`
- Tablet: `(min-width: 810px) and (max-width: 1199.98px)` → hash `19bj7d0`
- Mobile: `(max-width: 809.98px)` → hash `14lumiv`

There are three full variants (`Home - Desktop`, `Home - Tab`, `Home - Mob`) in the `data-framer-name` inventory — Framer renders all three into the HTML and hides/shows via CSS, which is why the page HTML is ~400 lines for a visually simple site.

`framer-fit-text` is used to make the hero headline scale to container width — one of the signature Framer tricks for big type that always hits the edges.

### Responsive approach

Stock Framer responsive: same component tree duplicated per breakpoint with `hidden-{hash}` classes toggled by media query. No fluid `clamp()` — discrete breakpoint variants.

## Effects Breakdown

| Effect | Implementation | Complexity | Cloneable? |
|---|---|---|---|
| Custom "eyes" cursor | `data-cursor="eyes"` attribute + global CSS selector hiding native cursor and painting a pixel-art cursor element that follows mousemove; `data-cursor-press="eyes-alt"` swaps sprite on mousedown | Low | Yes |
| `HeroGL` canvas pinned behind hero | Framer code component; `opacity: 0.64`, `will-change: transform`, `data-framer-name="HeroGL"` — almost certainly a shader (noise/gradient) rendered to canvas | Med | Partially (write your own shader) |
| `FooterGL` canvas pinned at footer | Same as HeroGL but at bottom of page, initially `translateY(1000px)` (off-screen), revealed on scroll | Med | Partially |
| `offscreen` perf-gate for GL | Inline vanilla-JS: on scroll/resize (rAF-throttled), adds `.offscreen` class when `scrollY > 120vh` (hero) or `bottomGap > 120vh` (footer). The `.offscreen` CSS presumably sets `display:none` or `visibility:hidden` + pauses the requestAnimationFrame loop | Low | Yes, copy the snippet |
| Animated GIF "coin" | Static GIF (`JJQM2LwcsxBlrtv0sIG9ruzooo.gif`) placed inside a `[data-framer-name="Coin"]` div, duplicated in several locations, some with `translateX(-50%)` for center-align | Low | Yes |
| `Hero-locker` pinned section | `id="hero"` element wrapping the big headline — pinned in place using Framer's "pin" feature (CSS `position: sticky`) while the GL layer scrolls behind | Low | Yes |
| Auto-updating local time | "06:03 PM" — a Framer code component reading `new Date()` in the user's timezone, labelled "NEW YORK, US" (the label is hardcoded, the time is live) | Low | Yes |
| Case-study card hover | Framer Motion variants on the three case-study tiles (Luuna, Twinby, ADC Space) — standard image scale + overlay fade | Low | Yes |
| Entrance animations | Framer Motion `initial`/`animate` on section mount — the inline style `transform: translateY(380px) scale(0.8); opacity: 0` on a flower asset is the from-state of one such reveal | Low | Yes |
| Award badges | Static `awwwards` + `cssda` image links in footer | Low | Yes |

## Implementation Details

### 1. The `offscreen` GL pause — the real engineering win

This is a hand-coded script appended AFTER Framer's bundle, and it's the most interesting code on the page:

```js
(function () {
  const HERO   = document.querySelector('[data-framer-name="HeroGL"]');
  const FOOTER = document.querySelector('[data-framer-name="FooterGL"]');
  if (!HERO || !FOOTER) return;

  const TH_VH = 120; // 120vh threshold
  let ticking = false, heroHidden = null, footerHidden = null;
  const vhPx = m => window.innerHeight * (m / 100);
  const setHidden = (el, hide) => el.classList[hide ? 'add' : 'remove']('offscreen');

  function update() {
    ticking = false;
    const scrollY = window.scrollY || 0;
    const limitPx = vhPx(TH_VH);
    const wantHeroHidden = scrollY > limitPx;
    const bottomGap = document.documentElement.scrollHeight - (scrollY + innerHeight);
    const wantFooterHidden = bottomGap > limitPx;
    if (wantHeroHidden !== heroHidden)   setHidden(HERO,   heroHidden = wantHeroHidden);
    if (wantFooterHidden !== footerHidden) setHidden(FOOTER, footerHidden = wantFooterHidden);
  }
  function onScrollResize() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScrollResize, { passive: true });
  window.addEventListener('resize', onScrollResize);
  update();
})();
```

**The reveal:** There's no IntersectionObserver, no library — just a rAF-throttled scroll listener flipping a class when the user scrolls more than 1.2× viewport heights from the top (hide hero GL) or is further than 1.2× viewport heights from the bottom (hide footer GL). Copy this verbatim for any expensive-canvas-at-top-and-bottom layout.

### 2. The custom cursor

From `Cursor_override.DmAbYLXC.mjs`:

```js
function CursorEyes(props)  { return { "data-cursor": "eyes",  "data-cursor-press": "eyes-alt" }; }
function CursorNative(props) { return { "data-cursor": "native" }; }
function CursorFinger(props) { return { "data-cursor": "finger", "data-clickable": "true" }; }
```

**The reveal:** These are Framer "code overrides" — they don't actually render the cursor. They just stamp `data-cursor` attributes on elements. Somewhere in the Framer runtime (or in a sibling override not shown in modulepreload names), a fixed `<div>` reads `document.elementFromPoint(mouseX, mouseY)`, pulls that element's nearest `[data-cursor]` ancestor, and swaps a sprite accordingly. On `mousedown` it reads `data-cursor-press` instead.

**To clone:** make a `position: fixed; pointer-events: none` div with a pixel-art eyes sprite, update its `transform: translate(x, y)` on `mousemove`, and query the element under the cursor on each move to decide which sprite to show.

### 3. The big fit-to-width headline

`<h1>` with class `framer-fit-text` — Framer's built-in primitive that measures the container width on every resize and scales the font-size with a `transform: scale()` so the text exactly fills its parent. To clone without Framer: use CSS `clamp(min, vw-based, max)` or a tiny JS that sets `font-size` via a binary search until `scrollWidth === clientWidth`.

### 4. HeroGL / FooterGL — the shader backgrounds

We cannot see the shader source (it's compiled into one of the Framer code-component modules — probably `OIjZRBmWDcIE2B6qgG1j.BC96Vdjk.mjs` or `1MaP1R-WHqFe6jTguNlU01kLJOw2AGlZbzVFU2s6qb8.C4JdiWEc.mjs`). What we know:

- The `HeroGL` div renders at `opacity: 0.64` — so it's a **tinted underlay** behind the hero, not the hero itself.
- `FooterGL` starts at `transform: translateY(1000px)` — pushed off-screen until scroll brings it up, which fits Framer's scroll-linked animation pattern.
- Both are gated by the `.offscreen` toggle above, confirming they're GPU-expensive (WebGL or a large canvas render loop).

**To clone:** a full-viewport `<canvas>` rendering a tileable gradient-noise shader (GLSL fragment shader doing `vec3 color = mix(vermillion, cream, fbm(uv * 2.0 + time * 0.1))`) via a 10-line **OGL** or raw WebGL setup, blended at 0.64 opacity over the cream background would reproduce the look closely enough.

### 5. Section structure (inferred from `data-framer-name` inventory)

In page order, the component names tell the story:

1. `Hero-locker` (pinned) → `HeroGL` (canvas underlay) → `HeroWrap` (content)
   - Meta row: `NEW YORK, US` / local time, `LAST UPDATED SEPT 2025`
   - Big headline `DIGITAL PRODUCT DESIGNER` (fit-text)
   - Subline `BASED IN NEW YORK CITY`
   - Disciplines row (UX / Web / Interaction / Motion / Visual)
   - Tagline paragraph
2. **Discipline chips** with `Button-UX` / `UX-Active` states, plus `Motion`, `Visual`, `Web`
3. **Case studies grid** — three links (Luuna, Twinby, ADC Space) with `Coin` GIF decorations and `flower` SVG accents
4. **Experiments** section with `D Hi` / `D Project` / `M Hi` / `M Project` / `T Hi` / `T Project` (desktop/mobile/tablet variants of project cards)
5. **Contact / footer** — `HELLO@SETHLUKIN.COM`, `LINKEDIN.COM/IN/SETHLUKIN`, `awwwards` + `cssda` award badges, `footer-caption`, education line (`The New School`), `FooterGL` canvas at the very bottom

Skills listed as a flat p-tag string: `UX / UI, MOBILE DESIGN, WEB DESIGN, VISUAL DESIGN, MOTION DESIGN, ART DIRECTION, PRODUCT MINDSET, DESIGN SYSTEMS, USER RESEARCH, ACCESSIBILITY, PROTOTYPING, NO-CODE`.

## Assets Needed to Recreate

1. **Pixel-art cursor sprites** (2 states) — `cursor-eyes.png`, `cursor-eyes-alt.png` @ ~32×32, transparent. Generate in Aseprite or prompt Midjourney: *"16×16 pixel-art cursor, pair of cartoon eyes looking forward, transparent background, retro 8-bit style"*.
2. **Animated coin GIF** — 8-frame spinning pixel coin, gold on transparent. Aseprite export. The original is `JJQM2LwcsxBlrtv0sIG9ruzooo.gif`.
3. **Flower SVG** — decorative 5-petal flower accent. Hand-draw in Figma, export SVG.
4. **Favicon + apple-touch-icon** — 2 PNGs (light/dark variants as the site ships both).
5. **Project cover images** — 3 case-study hero images (Luuna, Twinby, ADC Space) + 3 experiments. ~1600×1000 each. Midjourney or real screenshots.
6. **Noise/gradient shader** — generate procedurally in GLSL, no asset needed.
7. **Fonts** — load Manrope from Google, ship Fragment Mono + Onest as `/fonts/*.woff2` (both free).
8. **Award badges** — drop the real `awwwards` + `cssda` badge images if and only if the site actually won; otherwise omit.

## Build Plan

### Recommended stack (the Claude-Code-friendly version)

- **Next.js 15 (App Router)** — instant Vercel deploy, file-per-route case studies
- **Tailwind CSS** — for the design tokens below
- **Framer Motion** — entrance/scroll animations (same library the original uses)
- **OGL** (or raw WebGL) — the HeroGL/FooterGL shader layer (15kb, leaner than three.js for a single fullscreen quad)
- **No smooth-scroll library** — the original doesn't use one; don't reach for Lenis just because

### NPM packages

```bash
npm install next react react-dom framer-motion ogl clsx
npm install -D tailwindcss postcss autoprefixer typescript @types/react
```

### Tailwind token config (paste into `tailwind.config.ts`)

```ts
theme: {
  extend: {
    colors: {
      ink: "#000000",
      cream: "#EEEEEE",
      vermillion: "#FF2F00",
      blush: "#F1BEBE",
      line: "#D9D9D9",
      "line-2": "#CECECE",
      mute: "#B2B2B2",
    },
    fontFamily: {
      sans: ["Manrope", "system-ui", "sans-serif"],
      mono: ["'Fragment Mono'", "ui-monospace", "monospace"],
      display: ["Onest", "Manrope", "sans-serif"],
    },
  },
},
```

### Section-by-section build order

**1. Global shell** (`app/layout.tsx`)
- Load Manrope from Google, Fragment Mono + Onest from `/public/fonts`
- Render a fixed `<CustomCursor />` component (see step 2)
- Wrap `{children}` in `<main className="bg-cream text-ink">`

**2. Custom cursor** (`components/CustomCursor.tsx`)
- `position:fixed; pointer-events:none; z-index:9999`
- `onMouseMove` on `window` → update a ref'd div's `transform: translate()`
- On each move, call `document.elementFromPoint(x, y)?.closest('[data-cursor]')` → read attribute → swap between two PNG sprites (`eyes`, `eyes-alt`)
- On `mousedown` / `mouseup` → swap to the `data-cursor-press` variant
- Hide native cursor globally via `* { cursor: none }` in `globals.css`

**3. HeroGL canvas** (`components/HeroGL.tsx`)
- Fullscreen `<canvas>` with `position:fixed; inset:0; z-index:-1; opacity:0.64; pointer-events:none`
- OGL renderer with a single fullscreen-quad shader: vermillion↔cream gradient modulated by FBM noise and `u_time`
- Apply `.offscreen { visibility: hidden }` class (see step 4) so we can pause the rAF loop inside the class-mutation handler

**4. Scroll-gate perf script** (inline in `layout.tsx` or as a `useEffect`)
- Port the vanilla-JS snippet above verbatim. When adding the `.offscreen` class, also cancel the rAF loop in the GL component (listen via `MutationObserver` on the canvas's class attribute).

**5. Hero section** (`app/page.tsx` — hero block)
- CSS grid, 12-col
- Top strip: `NEW YORK, US <live-time>` on the left, `LAST UPDATED SEPT 2025` on the right — both `font-mono text-xs uppercase tracking-wider`
- Live time via a tiny `useEffect` using `new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour:"2-digit", minute:"2-digit" })` updated every 30s
- Big headline `DIGITAL PRODUCT DESIGNER` — use CSS `font-size: clamp(4rem, 18vw, 16rem); letter-spacing: -0.04em` to get fit-text behavior without JS
- Below: `BASED IN NEW YORK CITY`, disciplines, tagline paragraph (max-w-prose)
- Sticky wrapper: `position: sticky; top: 0; height: 100vh` for the `Hero-locker` pin effect

**6. Discipline chip row**
- Flex row of rounded buttons: UX / Web / Motion / Visual
- Active state: vermillion background, white text; inactive: transparent with ink border
- Framer Motion `layoutId` between states for the pill slide

**7. Case studies grid** (`components/CaseStudyGrid.tsx`)
- 3 cards (Luuna, Twinby, ADC Space) linking to `/case-studies/[slug]`
- Each card: cover image + title + year
- Hover: `whileHover={{ scale: 1.02 }}` + overlay fade, plus the spinning Coin GIF positioned absolute in the corner

**8. Experiments section**
- Mixed grid of 3–6 smaller cards (`D Project`, `M Project`, `T Project` variants suggest device-framed mockups)

**9. Skills strip**
- Single paragraph, `text-mute`, comma-separated — see full list above

**10. FooterGL + footer**
- `<FooterGL />` component — same OGL shader as Hero but positioned `fixed; bottom:0` and only visible near page end (scroll gate handles it)
- Email + LinkedIn links, award badges row, `The New School` education line, `footer-caption` small print

**11. Sub-routes**
- `/brief` (the "START A PROJECT" CTA target)
- `/case-studies/luuna`, `/case-studies/twinby`, `/case-studies/adc-space`

## Notes / gotchas

- **Awards badges** — the site shows `awwwards` and `cssda` — only claim these if you've actually won them. They're reputation signals, not decoration.
- **The three-breakpoint variant HTML** is a Framer-ism that produces ~3× larger HTML than necessary. Don't replicate it; use responsive Tailwind classes on a single tree.
- **GIF coins ship ~100–300KB each**. If you use many, convert to `<video muted loop playsinline>` with an MP4/WebM for 5–10× smaller files.
- **Shader background is the "premium" feel** — don't skip it. Without the GL layer the site is a flat portfolio; with it, it feels 2026. Budget half a day to write the FBM noise shader.
- **The site is fundamentally simple.** Its impression comes from three things: (a) the color palette (#FF2F00 on #EEEEEE), (b) the giant fit-text headline, (c) the pixel cursor + coin GIFs adding personality. Nail those three and you're 80% of the way there — no library required.
- **Performance note:** the designer's hand-coded `.offscreen` gate tells you the GL layers were expensive enough on mobile that they *had* to be paused. If you're on a constrained device, serve a static gradient PNG fallback and skip the canvas entirely via `@media (prefers-reduced-motion)` + a mobile `matchMedia` check.
