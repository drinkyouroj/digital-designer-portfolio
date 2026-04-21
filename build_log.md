# Build Log — digital-designer-portfolio

Append-only. One entry per session that makes meaningful changes.

---

## 2026-04-20 — Project initialization

### Done
- Analyzed sethlukin.com source (HTML, JS bundles, inline scripts, design system)
- Created `research/2026-04-20-sethlukin-teardown.md` — full teardown with tech stack, design tokens, effects breakdown, and build plan
- Created `CLAUDE.md` — authoritative agent guide with design system, architecture, decisions, git flow, AAP, and documentation conventions

### Decisions
- Next.js 15 + Tailwind + Framer Motion + OGL chosen as the rebuild stack (no GSAP, no Lenis, no Three.js)
- `.offscreen` rAF-gate pattern required for both GL shader layers
- Award badges are reputation-locked — omit until earned

### Next
- Initialize Next.js 15 project (`npx create-next-app@latest`)
- Install dependencies: `framer-motion ogl clsx`
- Set up Tailwind config with design tokens
- Source Fragment Mono + Onest woff2 files for `/public/fonts`
