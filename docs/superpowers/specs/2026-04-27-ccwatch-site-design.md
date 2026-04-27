# ccwatch Marketing Site — Design Spec

**Date:** 2026-04-27
**Status:** Approved (brainstorming complete)
**Authors:** yajinn, terzigolu
**Repo:** [terzigolu/ccwatch](https://github.com/terzigolu/ccwatch)

---

## 1. Goal

Build a single-page marketing site for ccwatch (a Claude Code plugin for cost & quota statusline tracking) that:

1. Showcases the product visually with an amber-terminal cyberpunk aesthetic and a 3D vintage CRT monitor in the hero.
2. Lets visitors interactively configure their `config.json` via a live wizard, with the result rendered in real time on the hero CRT screen and as a 2D HTML preview.
3. Drives conversion to `npx @terzigolu/ccwatch` install or the Claude Code plugin install flow.
4. Stays minimal in scope: one page, one interactive demo, free hosting, no backend.

## 2. Out of Scope

- Multi-page documentation site (README on GitHub remains canonical reference).
- Server-side rendering, edge functions, or backend APIs.
- Authentication, user accounts, or persistence beyond clipboard/download.
- Live integration with the real ccwatch CLI (the site simulates statusline output independently).
- Scroll-driven CRT state machine (Section 7 stretch goal, not MVP).
- Custom domain registration (`ccwatch.dev`) — start with `ccwatch.pages.dev`, upgrade later if desired.

## 3. Decisions Locked

| Area | Decision | Rationale (short) |
|---|---|---|
| Scope | Landing + Interactive Demo | Demo doubles as conversion + showcase |
| Aesthetic | Amber Terminal Cyberpunk (DEC VT220 / Fallout / Alien Nostromo vibes) | Amber = precision instrument color; aligns with ccwatch's "measurement" identity |
| Tech stack | Vite 5 + React 18 + TypeScript strict + Tailwind CSS v4 | Right-sized for SPA; Next.js overkill for one page |
| 3D | `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` | Native R3F primitives for live state-driven 3D content |
| State | `zustand` | Crosses R3F's Canvas/React-root boundary without provider bridging |
| Hosting | Cloudflare Pages | Most generous free tier; global edge CDN; free custom domain later |
| Repo location | `/site` subdirectory in main ccwatch repo | `package.json#files` array excludes it from npm publish; no monorepo tooling needed |
| Bundle target | ~280KB gzipped | Acceptable for 3D-heavy dev-tool landing |

## 4. Architecture

### 4.1 Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite 5 + TypeScript strict |
| UI | React 18 + Tailwind CSS v4 (`@theme` token system) |
| 3D | `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` |
| State | `zustand` (~3KB) |
| Fonts | JetBrains Mono (terminal text) + Geist (display headings) |
| Tests | Vitest (unit, pure logic only) + Playwright (visual smoke, 9 screenshots) |
| Deploy | Cloudflare Pages, GitHub auto-deploy on push |

### 4.2 Color Palette (Tailwind `@theme` tokens)

```css
--amber-bg: #1a0f00;       /* CRT-base dark brown-black */
--amber-primary: #ffb000;  /* DEC VT220 phosphor amber */
--amber-glow: #ff6700;     /* warm orange accent */
--amber-cream: #fff8e1;    /* high-contrast highlight */
--amber-dim: #806000;      /* low-contrast borders/secondary */
```

All shaders, components, and 3D materials reference these CSS variables — single point of change for global palette tweaks.

### 4.3 File Structure

```
/site/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
├── public/
│   ├── fonts/         # JetBrains Mono, Geist subsets
│   └── hero-fallback.webp  # static CRT image for no-WebGL fallback
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    │   ├── global.css        # Tailwind + @theme tokens + global scanline overlay
    │   └── crt.css           # CRT-specific filters & noise
    ├── components/
    │   ├── sections/
    │   │   ├── Hero.tsx
    │   │   ├── Demo.tsx
    │   │   ├── WhyFast.tsx
    │   │   ├── Accurate.tsx
    │   │   ├── Install.tsx
    │   │   └── Footer.tsx
    │   ├── three/
    │   │   ├── CRTScene.tsx       # <Canvas>, lighting, EffectComposer
    │   │   ├── CRTMonitor.tsx     # 3D mesh: bezel + curved glass + screen plane
    │   │   ├── CRTScreen.tsx      # native R3F primitives rendering statusline content
    │   │   ├── DustParticles.tsx  # ambient floating dust, perf-degradable
    │   │   └── PostFX.tsx         # Bloom + Scanline + Vignette + subtle Glitch
    │   └── ui/
    │       ├── StatuslineMock.tsx # HTML/Tailwind statusline (2D twin of 3D content)
    │       ├── CellCheckbox.tsx
    │       ├── NeonButton.tsx
    │       ├── GlitchText.tsx
    │       └── TerminalCursor.tsx
    └── lib/
        ├── statusline-mock.ts   # pure logic: which cells go where, layout calc
        ├── config-builder.ts    # wizard state → config.json
        ├── store.ts             # zustand: shared Hero ↔ Demo state
        └── pricing-data.ts      # static per-model rates (mirrors ccwatch pricing.ts)
```

**Total estimated size:** ~24 source files in `src/`, ~1800-2200 LOC.

**Dependency graph (one-direction):** `lib/` → `components/ui/` → `components/three/` & `components/sections/` → `App.tsx`. No cycles.

**Independence rule:** `/site/src/` does NOT import anything from `ccwatch/src/`. The site simulates ccwatch output via its own `statusline-mock.ts`. This decouples site lifecycle from CLI lifecycle — bumping ccwatch version doesn't break the site.

## 5. Data Flow (Hero CRT ↔ Wizard)

### 5.1 The Render-to-CRT Decision

Three approaches considered:

1. **drei `<Html>` overlay** — rejected: DOM overlay doesn't pass through `<EffectComposer>`, breaks "behind the glass" illusion.
2. **`html2canvas` → `THREE.CanvasTexture`** — rejected: 30-80ms canvas redraw per wizard interaction kills "live system" feel.
3. **Native R3F primitives (`<Text>` + `<mesh>`)** — selected: GPU-rendered, instant updates, naturally inherits all post-processing (bloom + scanline + vignette + glitch).

`<CRTScreen>` reads zustand store and emits drei `<Text>` (SDF font rendering) and `<planeGeometry>` meshes (for quota bars) at the right positions on the CRT screen plane.

### 5.2 State Flow

```
              ┌──────────────────────┐
              │  zustand store       │
              │  - enabledCells: Set │
              │  - rows: layout      │
              │  - sessionMock: {…}  │  ← live-tickered values
              └──────────────────────┘
                    ↓          ↓
        ┌───────────┘          └─────────────┐
        ↓                                    ↓
   <StatuslineMock>                      <CRTScreen>
   (HTML preview in Demo)                (R3F primitives in Canvas)
   user sees: "I'm building              user sees: "my config is
    my config"                            running on the CRT"
```

### 5.3 Animated Values Optimization

`sessionMock.cost` ticks upward each second to simulate live burn. To avoid React re-render storms:

- User-driven changes (checkbox toggle, breakpoint slider) → write to zustand store → both subscribers re-render.
- Animated tickers (`cost += rate * dt`) → mutate `useRef` values inside `useFrame` (R3F animation loop), bypass store entirely. Only the 3D `<Text>` content updates via Three.js direct mutation; React reconciliation is not invoked.

Result: 60fps on mid-range hardware, zero React re-renders for animated values.

### 5.4 Config Output

`config-builder.ts` produces `config.json` matching ccwatch's actual format:

```json
{
  "rows": [["5h", "7d"], ["session", "ctxbar"]],
  "compactRows": [["5h", "7d"], ["session"], ["ctxbar"]],
  "compactBreakpoint": 113,
  "columns": null
}
```

Two actions: `Copy` (navigator.clipboard) + `Download` (Blob URL → `config.json`).

## 6. Sections (Content)

### 6.1 Hero
- **Layout:** 55% CRT (left), 45% copy + CTA (right) on desktop; stacked on mobile.
- **Eyebrow:** `[ ccwatch v1.0.1 ]` mono dim amber.
- **H1:** `watch the meter, not the bill` (Geist 72px, glitch-on-hover effect).
- **Sub:** `Fast cost & quota statusline for Claude Code. Cached transcript scanning. Zero deps.`
- **CTAs:** primary `[ npx @terzigolu/ccwatch ]` (copy-on-click neon button) + ghost `View on GitHub →`.
- **Stat strip:** `~80ms warm render · 1163 LOC compiled · 0 runtime deps`.

### 6.2 Live Demo (the wizard)
- **Heading:** `// Build your statusline`.
- **Left panel:** 8 cell checkboxes (`5h`, `7d`, `today`, `history`, `session`, `total`, `model`, `ctxbar`) + compact-breakpoint slider (80-160 cols).
- **Right panel:** HTML `<StatuslineMock>` preview (live-updating).
- **Sync note:** the hero CRT (above) and this preview share state — toggling a checkbox updates both simultaneously.
- **Actions:** `[ Copy config.json ]` + `[ Download ]` + collapsible raw JSON view.

### 6.3 Why it's fast (3 cards)
1. **`mtime + size cache`** — "Per-file fingerprint. We don't re-read what hasn't changed." → `cold 0.9s · warm 80ms`.
2. **`streaming dedup`** — "Each API call writes 2-7 JSONL entries. We dedupe by message.id." → `1.0× counted, never inflated`.
3. **`substring prefilter`** — "Skip JSON.parse on lines that can't match. 50× faster." → `~50× scan speedup`.

Hover state: amber rim-light + scanline shift.

### 6.4 Accurate to the cent
- **H2:** `Opus output is 19× more expensive than Haiku.`
- **Sub:** `Most tools estimate. We don't.`
- **Pricing table:** Model / Input / Output / Cache-read columns for Opus, Sonnet, Haiku.
- **Side panel:** small amber bar chart — "Same 100k tokens, different model": Opus $9.00 / Sonnet $1.80 / Haiku $0.48.

### 6.5 Install
- Two tabs: `npx (one-line)` | `Claude Code plugin`.
- Mono amber code blocks with copy buttons.
- Strip below: 4 slash commands (`/ccwatch`, `/setup`, `/configure`, `/doctor`) with one-line descriptions.

### 6.6 Footer
- Left: `built by yajinn & terzigolu` + GitHub link + npm link.
- Right: small amber line-drawing of a CRT silhouette + `MIT 2026`.
- Bottom-edge animated scanline.

### 6.7 Global UI Conventions
- Mono text → JetBrains Mono. Display text → Geist.
- Borders: `1px solid var(--amber-primary) / 30%`.
- Hover: text-shadow `0 0 8px var(--amber-primary)`.
- Terminal cursor (`▍` glyph, CSS blink animation) appears in input contexts.
- Smooth native scroll. No scroll-jacking.

## 7. Error Handling & Fallbacks

| Scenario | Behavior |
|---|---|
| WebGL unavailable (~1-2% users) | Pre-render `<img src="hero-fallback.webp">` (80KB). Tagline + CTAs unchanged. Wizard works (no 3D dependency). |
| `prefers-reduced-motion: reduce` | Disable bloom/glitch passes, freeze dust particles, freeze marquee, freeze sessionMock ticker. Scanline + bloom remain (subtle, not motion). |
| FPS < 30 (drei `<PerformanceMonitor>`) | Particle count 200 → 50; bloom pass off; CRT geometry segments 64 → 16. Auto-degrade silent. |
| Clipboard API unavailable/blocked | Try/catch on `navigator.clipboard.writeText`. On fail, show JSON in textarea with select-all hint + temporary highlight. |

## 8. Testing Strategy

| Layer | Tool | Scope |
|---|---|---|
| Build gate | `tsc --noEmit` + `vite build` in CI | Type errors and build failures block PR. |
| Pure logic units | Vitest | `lib/config-builder.ts`, `lib/statusline-mock.ts` (layout calc), `lib/pricing-data.ts` lookups. Coverage target: 90%+. |
| Visual smoke | Playwright | 3 viewports (1440 / 768 / 390) × 3 sections (hero, demo, install) = 9 screenshots. Bounding-box & text-content assertions only — no pixel-perfect diff (3D output varies by GPU). |

**Explicitly NOT tested:** 3D pixel correctness, scroll animations, font loading edge cases. Caught manually via 5-minute deploy-preview smoke.

## 9. Performance Targets

| Metric | Target |
|---|---|
| Bundle (gzipped) | < 300KB |
| LCP (mobile, 4G) | < 2.5s |
| TTI (desktop) | < 1.5s |
| Hero 3D FPS (mid-range laptop) | 60 |
| Hero 3D FPS (mobile) | ≥ 30 (auto-degrade if below) |

## 10. Deployment

1. Push to `main` branch on GitHub.
2. Cloudflare Pages connects to the repo, builds `/site` directory: `cd site && npm install && npm run build`, output dir `site/dist`.
3. Auto-deploy on every push. Preview URLs for PRs.
4. Initial domain: `ccwatch.pages.dev`. Future: optional custom domain (`ccwatch.dev`) via Cloudflare DNS — code-side change zero.

## 11. Future Stretch (Not MVP)

- **Scroll-driven CRT state machine:** scroll position drives CRT content through phases (boot → "competitor" rescan → wizard live → final config). Adds storytelling but doubles 3D code; deferred until base site ships.
- **Custom domain `ccwatch.dev`:** depends on user purchasing the domain (~$12/yr).
- **Real ccwatch live integration:** site fetches a user's actual quota via OAuth and renders their real statusline. High complexity, low marginal value over the simulator.

## 12. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| 3D bundle size creeps over budget | Monitor with `vite-bundle-visualizer` in CI; tree-shake drei imports per-component. |
| Three.js mobile perf on iOS Safari | Auto-degrade via `<PerformanceMonitor>` is the primary lever; static fallback exists if WebGL fails. |
| 21st.dev component patterns evolve | We're copying patterns, not pinning to a registry — drift is fine, occasional re-pull on visual refresh. |
| Cloudflare Pages free-tier policy change | Vercel and GitHub Pages are drop-in alternatives; Vite static build is host-agnostic. |

## 13. Acceptance Criteria

The site ships when:

- [ ] All 6 sections render correctly on desktop (1440), tablet (768), mobile (390).
- [ ] Hero CRT shows live statusline content driven by wizard state.
- [ ] Wizard produces valid `config.json` matching ccwatch's `~/.claude/plugins/ccwatch/config.json` schema.
- [ ] No-WebGL fallback verified by disabling WebGL in browser devtools.
- [ ] `prefers-reduced-motion` respected (verified via emulation).
- [ ] All visual smoke screenshots pass.
- [ ] Pure logic unit tests at ≥ 90% coverage.
- [ ] Bundle size ≤ 300KB gzipped.
- [ ] Deployed to `ccwatch.pages.dev` and reachable.
