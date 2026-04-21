# Architecture — digital-designer-portfolio

> Update this document when a PR meaningfully changes system topology, data flow, or component responsibilities.

## Overview

A single-page Next.js 15 portfolio with three case-study sub-routes, deployed to Vercel. No backend, no database — purely static/SSG with one dynamic element (live local time).

## System topology

```
Browser
  └─ Next.js 15 (App Router, SSG)
       ├─ app/layout.tsx          — global shell (fonts, cursor, body)
       ├─ app/page.tsx            — homepage (all sections)
       ├─ app/brief/page.tsx      — project inquiry CTA
       └─ app/case-studies/
            └─ [slug]/page.tsx    — Luuna · Twinby · ADC Space

Static assets (Vercel CDN)
  ├─ /public/fonts/               — Fragment Mono, Onest woff2
  ├─ /public/cursors/             — pixel-art eye sprites
  ├─ /public/coin.gif (or .mp4)   — animated coin
  └─ /public/flower.svg
```

## Key components

| Component | Role | Notes |
|---|---|---|
| `CustomCursor` | Pixel-art eyes cursor tracking mouse | Global, rendered in layout |
| `HeroGL` | Full-viewport WebGL shader underlay (hero) | OGL, opacity 0.64, gated by `.offscreen` |
| `FooterGL` | Full-viewport WebGL shader underlay (footer) | Same shader, starts off-screen |
| `DisciplineChips` | UX / Web / Motion / Visual filter pills | Framer Motion `layoutId` slide |
| `CaseStudyGrid` | Three case-study cards with hover state | Links to `/case-studies/[slug]` |
| `LiveTime` | New York local time, updates every 30s | `Intl.DateTimeFormat` in a `useEffect` |

## Data flow

All content is hardcoded — no CMS, no API. Case study content lives in `app/case-studies/[slug]/page.tsx` or a local `data/case-studies.ts` file.

## Performance strategy

- GL shader layers are gated by a vanilla-JS `.offscreen` rAF scroll listener (see CLAUDE.md)
- Framer Motion entrance animations only on first mount
- Fonts: Manrope via `next/font/google` (auto-subset), Fragment Mono + Onest via `next/font/local`
- Coin animation: use `<video muted loop playsinline>` if more than 2 instances appear on a page

## Deployment

Vercel (automatic from `main` branch). No environment variables required for initial launch.
