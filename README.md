# digital-designer-portfolio

A Next.js 15 portfolio site built from a teardown of [sethlukin.com](https://sethlukin.com/) — recreating its design language: WebGL shader backgrounds, pixel-art cursor, fit-text headline, and case study pages.

## Prerequisites

- Node 20+
- npm 10+

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Tests

```bash
npm test
```

## Stack

- **Next.js 15** (App Router, SSG)
- **Tailwind CSS** with custom design tokens
- **Framer Motion** — entrance and hover animations
- **OGL** — WebGL shader backgrounds (HeroGL, FooterGL)
- **TypeScript**

## Key docs

- [`CLAUDE.md`](./CLAUDE.md) — authoritative agent guide; design system, architecture decisions, git flow
- [`build_log.md`](./build_log.md) — append-only session log
- [`docs/architecture.md`](./docs/architecture.md) — system topology and component map
- [`docs/decisions/`](./docs/decisions/) — DECISION docs for significant choices
- [`research/2026-04-20-sethlukin-teardown.md`](./research/2026-04-20-sethlukin-teardown.md) — full site teardown with design tokens and build plan

## Deploy

Vercel — push to `main` to deploy.
