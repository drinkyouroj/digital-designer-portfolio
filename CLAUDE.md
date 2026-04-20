# CLAUDE.md — digital-designer-portfolio

> This file is the authoritative guide for Claude Code and any AI agent working in this
> repository. Read it fully before taking any action. It is committed to the repo root
> and applies to every session.

**Project:** digital-designer-portfolio
**Purpose:** Build a Next.js 15 portfolio site recreating the design language of sethlukin.com — WebGL shader backgrounds, pixel-art cursor, fit-text headline, and case study pages — deployed to Vercel.
**Last updated:** 2026-04-20

---

## Environment & Stack

**Language(s):** TypeScript
**Framework(s):** Next.js 15 (App Router), Tailwind CSS, Framer Motion, OGL (WebGL)
**Database(s):** None
**Key dependencies:** `next`, `react`, `react-dom`, `framer-motion`, `ogl`, `clsx`
**Runtime:** Node 20+

### Setup

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

> Always verify the environment is set up before suggesting code changes.
> Never assume a dependency is installed.

---

## Design System

This is the canonical source for design tokens. Do not invent values — use only what is listed here.

### Colors

| Token | Value | Role |
|---|---|---|
| `ink` | `#000000` | Primary text |
| `cream` | `#EEEEEE` | Page background |
| `vermillion` | `#FF2F00` | Signature accent |
| `blush` | `#F1BEBE` | Hover / secondary accent |
| `panel` | `#FFFFFF` | Card / panel white |
| `line` | `#D9D9D9` | Dividers |
| `mute` | `#B2B2B2` | Label / metadata grey |

The signature palette move is **vermillion on cream** (`#FF2F00` over `#EEEEEE`). Pink (`blush`) is hover/secondary only.

### Tailwind config (`tailwind.config.ts`)

```ts
theme: {
  extend: {
    colors: {
      ink: "#000000",
      cream: "#EEEEEE",
      vermillion: "#FF2F00",
      blush: "#F1BEBE",
      panel: "#FFFFFF",
      line: "#D9D9D9",
      mute: "#B2B2B2",
    },
    fontFamily: {
      sans:    ["Manrope", "system-ui", "sans-serif"],
      mono:    ["'Fragment Mono'", "ui-monospace", "monospace"],
      display: ["Onest", "Manrope", "sans-serif"],
    },
  },
},
```

### Typography

| Role | Family | Weight | Notes |
|---|---|---|---|
| Headlines | Manrope | 700 | All-caps, tight tracking, fit-to-width |
| Body / taglines | Manrope | 500–600 | Generous line-height |
| Metadata labels | Fragment Mono | 400 | Monospace; load from `/public/fonts` |
| Secondary display | Onest | 400–600 | Load from `/public/fonts` |

- Load **Manrope** from Google Fonts (`next/font/google`).
- Ship **Fragment Mono** and **Onest** as self-hosted `/public/fonts/*.woff2` via `next/font/local`.

### Fit-text headline

Use CSS `font-size: clamp(4rem, 18vw, 16rem); letter-spacing: -0.04em` — no JavaScript resize loop required.

---

## Architecture & Components

### File structure (target)

```
app/
  layout.tsx              # Global shell: fonts, CustomCursor, <main bg-cream>
  page.tsx                # Homepage (Hero, CaseStudies, Experiments, Skills, Footer)
  brief/page.tsx          # "Start a project" CTA target
  case-studies/
    [slug]/page.tsx       # Luuna · Twinby · ADC Space
components/
  CustomCursor.tsx        # Pixel-art eyes cursor
  HeroGL.tsx              # Full-viewport WebGL shader (hero)
  FooterGL.tsx            # Full-viewport WebGL shader (footer)
  CaseStudyGrid.tsx       # Three case-study cards
  DisciplineChips.tsx     # UX / Web / Motion / Visual pill row
  LiveTime.tsx            # New York local time (updates every 30s)
public/
  fonts/                  # Fragment Mono + Onest woff2 files
  cursors/                # cursor-eyes.png · cursor-eyes-alt.png (≈32×32)
  coin.gif                # Animated pixel coin (or coin.mp4/webm — see notes)
  flower.svg              # Decorative 5-petal SVG accent
research/
  2026-04-20-sethlukin-teardown.md  # Full site teardown — read this before any implementation
```

### Component build order

Follow this order; each step should be a separate commit:

1. Global shell (`app/layout.tsx`) — fonts, `<CustomCursor />`, `bg-cream text-ink` wrapper
2. Custom cursor (`components/CustomCursor.tsx`)
3. HeroGL canvas (`components/HeroGL.tsx`)
4. Scroll-gate perf script (inline `useEffect` in `layout.tsx` or `HeroGL.tsx`)
5. Hero section (hero block inside `app/page.tsx`)
6. Discipline chip row (`components/DisciplineChips.tsx`)
7. Case studies grid (`components/CaseStudyGrid.tsx`)
8. Experiments section
9. Skills strip
10. FooterGL + footer (`components/FooterGL.tsx`)
11. Sub-routes (`/brief`, `/case-studies/[slug]`)

---

## WebGL Shader Layers (HeroGL / FooterGL)

These are the most technically complex parts of the site and the biggest source of "premium feel." **Do not skip them.** Without the GL layers the site is a flat portfolio; with them it reads as a 2026 build.

### Implementation rules

- Use **OGL** (not Three.js — it is 15kb and purpose-built for a single fullscreen quad).
- Render a tileable gradient-noise shader: FBM noise modulating a vermillion↔cream gradient over `u_time`.
- `HeroGL`: `position: fixed; inset: 0; z-index: -1; opacity: 0.64; pointer-events: none`
- `FooterGL`: same, positioned at the page bottom; starts `translateY(1000px)` off-screen.
- Both layers **must** implement the `.offscreen` gate (see below).

### The `.offscreen` rAF-gate (required, not optional)

The original designer hand-coded this gate because the GL layers were GPU-expensive enough to cause frame drops on mobile. Copy this pattern verbatim:

```js
(function () {
  const HERO   = document.querySelector('[data-gl="hero"]');
  const FOOTER = document.querySelector('[data-gl="footer"]');
  if (!HERO || !FOOTER) return;

  const TH_VH = 120;
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
    if (wantHeroHidden !== heroHidden)     setHidden(HERO,   heroHidden = wantHeroHidden);
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

When the `.offscreen` class is added, the component's internal `requestAnimationFrame` loop must also be cancelled (use a `MutationObserver` on the canvas's `className`). Add `globals.css`:

```css
.offscreen { visibility: hidden; }
```

**Performance fallback:** on mobile or `prefers-reduced-motion`, serve a static gradient PNG and skip the canvas entirely.

---

## Custom Cursor

```
position: fixed; pointer-events: none; z-index: 9999
```

- On `mousemove` → update a ref'd div's `transform: translate(x, y)`.
- On each move → `document.elementFromPoint(x, y)?.closest('[data-cursor]')` → read attribute → swap between `cursor-eyes.png` / `cursor-eyes-alt.png`.
- On `mousedown` / `mouseup` → swap to `data-cursor-press` variant.
- Hide native cursor globally: `* { cursor: none }` in `globals.css`.

Cursor sprite spec: ~32×32px pixel-art eyes on transparent background. Generate in Aseprite or with an image model: *"16×16 pixel-art cursor, pair of cartoon eyes, transparent background, retro 8-bit style"*.

---

## Architectural Decisions (non-negotiable)

These are confirmed decisions from the teardown analysis. Do not re-litigate them.

| Decision | Rationale |
|---|---|
| **No smooth-scroll library** (no Lenis, no Locomotive) | The original site doesn't use one; adding one would change scroll feel without fidelity benefit |
| **No Three.js** | OGL is sufficient for a fullscreen quad; Three.js adds ~600kb for no gain |
| **No GSAP** | Framer Motion covers all entrance/hover/scroll animation needs |
| **Tailwind responsive classes over breakpoint variants** | The original Framer site duplicates the full component tree per breakpoint in HTML, which is a Framer-ism — don't replicate it; use a single tree with responsive classes |
| **No `clamp()` is needed for fit-text** — use `clamp(4rem, 18vw, 16rem)` | No JS resize observer required |
| **GIF coins → `<video>` if count > 2** | Each GIF is 100–300kb; `<video muted loop playsinline>` with MP4/WebM gives 5–10× smaller files |
| **Award badges are reputation-locked** | Only include awwwards / CSSDA badges if the site actually wins them — they are trust signals, not decoration |

---

## Testing Conventions

**Framework:** Vitest + React Testing Library (add when project is initialized)

### Rules

- Every new component or utility gets a test in the same PR.
- Tests live in `__tests__/` mirroring the source structure, or co-located as `*.test.tsx`.
- Test names follow `describe('<Component>') > it('<what> <condition> <expected>')`.
- No PR merges to `develop` with failing tests.

### Running Tests

```bash
npm test                    # All tests
npm test -- path/to/file    # Specific file
npm run test:coverage       # With coverage report
```

---

## Git Flow

### Branch model

```
main       ← production-ready releases only; tag every merge
develop    ← integration branch; all features land here first
feature/*  ← one branch per feature or fix; branched from develop
release/*  ← cut from develop when ready to ship; merged to main + develop
hotfix/*   ← branched from main; merged to both main + develop
```

- `main` and `develop` are **protected**. No direct commits. PRs only.
- Branch names: `feature/short-description`, `fix/short-description`, `chore/short-description`.
- Delete feature branches after merge.
- Every merge to `main` gets a version tag: `vMAJOR.MINOR.PATCH`.

### Commit format (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body — wrap at 72 chars]
[optional footer — BREAKING CHANGE, closes #issue]
```

**Types:** `feat` · `fix` · `chore` · `docs` · `test` · `refactor` · `perf` · `ci`

**Commit granularity:** one commit per logical change. Not per file, not per hour.

Anti-patterns: ❌ "misc fixes" · ❌ WIP commits on shared branches · ❌ commented-out code

### Pull requests

- PR title = Conventional Commit format: `feat(scope): description`
- PR description: what changed, why, and how to test it.
- Squash-merge feature branches into `develop`.
- Merge-commit (no squash) release and hotfix branches into `main`.

---

## Adversarial Agent Protocol (AAP)

**Every significant decision goes through a three-agent review before implementation.**

### Three agents

**ARCHITECT** — Designs the solution. Writes code. Makes tradeoffs explicit. Always asks: *"Is this the simplest thing that works and can be extended?"*

**ADVERSARY** — Attacks the design. Finds edge cases, security holes, data loss scenarios, UX failure modes. Never lets a decision pass without at least two specific objections.

**JUDGE** — Listens to both. Decides. Writes a one-line verdict + any required design changes. Does not compromise for harmony.

### When AAP is required

- New API routes or data-fetching patterns
- Schema or content-model decisions
- Auth or form submission flows
- Any change flagged in a DECISION doc as "requires AAP"

For styling, copy tweaks, trivial refactors — skip it.

### Protocol format

```
## AAP: {{decision title}}

### ARCHITECT
{{Design proposal — name files, functions, data shapes, failure modes and tradeoffs.}}

### ADVERSARY
**Objection 1:** {{specific attack}}
**Objection 2:** {{specific attack}}

### JUDGE
**Verdict:** {{one sentence}}
{{Required design changes before implementation proceeds.}}
```

AAP output is committed to `docs/decisions/` as part of the DECISION doc for the change.

---

## Documentation Conventions

### build_log.md

`build_log.md` lives at the repo root. It is append-only. Every session that makes meaningful changes adds an entry:

```
## YYYY-MM-DD — short description

### Done
- bullet per logical change

### Decisions
- any DECISION docs created or referenced

### Next
- what's left or blocked
```

### DECISION docs

Before implementing any of the following, a DECISION doc is required:
- New routes or page types
- Content schema changes
- Shader/GL implementation approach
- Any change flagged "requires AAP"

DECISION docs live in `docs/decisions/` and follow this template:

```markdown
# DECISION: {{title}}

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Rejected | Superseded

## Context
## Options Considered
## Decision
## Consequences
```

### README.md

Must contain: project name + one-paragraph purpose, prerequisites, local setup steps, how to run tests, links to key DECISION docs.

### Architecture overview

`docs/architecture.md` — update when a PR meaningfully changes system topology, data flow, or component responsibilities.


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

*No recent activity*
</claude-mem-context>