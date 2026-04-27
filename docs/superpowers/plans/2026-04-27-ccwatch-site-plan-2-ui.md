# ccwatch Site — Plan 2: UI Primitives + 2D Sections

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully styled, deployable 2D version of the ccwatch marketing site. All six sections render. The Live Demo wizard works end-to-end (cell toggles, breakpoint slider, copy/download `config.json`). The Hero shows a placeholder image where the 3D CRT will land in Plan 3. No 3D yet.

**Architecture:** Build atop Plan 1's pure-logic foundation. Add five UI primitives (`StatuslineMock`, `CellCheckbox`, `NeonButton`, `GlitchText`, `TerminalCursor`), six section components, fonts, favicon, and a constants module. After Plan 2, the site is shippable as-is to Cloudflare Pages — Plan 3's 3D upgrade is a swap-in for the Hero placeholder, nothing else changes.

**Tech Stack:** Plan 1 stack + JetBrains Mono + Geist (woff2 subsets, self-hosted), `@testing-library/jest-dom` setup, no new deps.

**Predecessor:** Plan 1 (`docs/superpowers/plans/2026-04-27-ccwatch-site-plan-1-foundations.md`) — fully landed on `feat/site` branch.

---

## File Structure (this plan creates / modifies)

```
/site/
├── public/
│   ├── favicon.svg                  # NEW: minimal amber CRT silhouette
│   └── fonts/
│       ├── JetBrainsMono-Regular.woff2  # NEW: hosted subset
│       ├── JetBrainsMono-Bold.woff2
│       └── Geist-Regular.woff2
└── src/
    ├── App.tsx                      # MODIFY: replace smoke test with full site composition
    ├── constants.ts                 # NEW: shared MIN/MAX/DEFAULT_BREAKPOINT, copy strings, stat numbers
    ├── test-setup.ts                # NEW: imports jest-dom matchers (referenced in vitest.config.ts)
    ├── styles/
    │   ├── global.css               # MODIFY: add @font-face declarations
    │   └── animations.css           # NEW: keyframes for glitch, cursor blink, marquee
    ├── components/
    │   ├── ui/                      # NEW directory — UI primitives
    │   │   ├── StatuslineMock.tsx
    │   │   ├── CellCheckbox.tsx
    │   │   ├── NeonButton.tsx
    │   │   ├── GlitchText.tsx
    │   │   └── TerminalCursor.tsx
    │   └── sections/                # NEW directory — page sections
    │       ├── Hero.tsx
    │       ├── Demo.tsx
    │       ├── WhyFast.tsx
    │       ├── Accurate.tsx
    │       ├── Install.tsx
    │       └── Footer.tsx
    └── lib/                         # MODIFY: refactor breakpoint constants out of store + config-builder
        ├── store.ts                 # use constants.ts
        ├── config-builder.ts        # use constants.ts
        └── statusline-mock.ts       # use constants.ts (DEFAULT_BREAKPOINT)
```

**Configuration changes:**
- `vitest.config.ts` — `setupFiles: ['./src/test-setup.ts']`
- No new npm deps. (Tailwind v4 utilities + Plan 1 stack covers everything.)

**End state:** `npm run dev` shows the full marketing site — six visually-styled sections, working wizard, hero placeholder image. `npm run build` → `dist/` ≤ 110KB gzipped JS (still well under 300KB budget). 32+ unit tests still pass; new tests added for `StatuslineMock` rendering logic and constants centralization invariants.

---

## Phase A — Setup (Tasks 1-4)

### Task 1: Create `constants.ts` and refactor `lib/` to use it

**Files:**
- Create: `site/src/constants.ts`
- Modify: `site/src/lib/store.ts`, `site/src/lib/config-builder.ts`, `site/src/lib/statusline-mock.ts`

**Why:** Plan 1's final review flagged that `MIN_BREAKPOINT=80`, `MAX_BREAKPOINT=160`, `DEFAULT_BREAKPOINT=113` live in three places (`store.ts`, `config-builder.ts`, `statusline-mock.ts`) plus hardcoded as strings in `App.tsx` slider. Centralizing prevents drift.

- [ ] **Step 1: Write `site/src/constants.ts`**

```typescript
/**
 * Shared numeric constants for the wizard and statusline layout calc.
 * Single source of truth — referenced by lib/, components/, and JSX min/max attrs.
 */
export const MIN_BREAKPOINT = 80;
export const MAX_BREAKPOINT = 160;
export const DEFAULT_BREAKPOINT = 113;

/**
 * The four cells enabled by default — matches ccwatch README example.
 */
export const DEFAULT_ENABLED_CELLS = ['5h', '7d', 'session', 'ctxbar'] as const;
```

- [ ] **Step 2: Modify `site/src/lib/store.ts`** — replace local constants with imports

Find:
```typescript
const MIN_BREAKPOINT = 80;
const MAX_BREAKPOINT = 160;

const DEFAULT_ENABLED: ReadonlyArray<CellKey> = ['5h', '7d', 'session', 'ctxbar'];
const DEFAULT_BREAKPOINT = 113;
```

Replace with:
```typescript
import {
  MIN_BREAKPOINT,
  MAX_BREAKPOINT,
  DEFAULT_BREAKPOINT,
  DEFAULT_ENABLED_CELLS,
} from '@/constants';
```

Then update the references inside the file (e.g., `new Set(DEFAULT_ENABLED_CELLS)` instead of `DEFAULT_ENABLED`).

- [ ] **Step 3: Modify `site/src/lib/config-builder.ts`** — same pattern

Replace local `MIN_BREAKPOINT` / `MAX_BREAKPOINT` with imports from `@/constants`.

- [ ] **Step 4: Modify `site/src/lib/statusline-mock.ts`** — same

Replace `const DEFAULT_BREAKPOINT = 113;` with import.

- [ ] **Step 5: Run all tests**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm test
```

Expected: 32 tests still pass. Refactor preserves behavior.

- [ ] **Step 6: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/constants.ts site/src/lib/
git commit -m "site(lib): centralize breakpoint constants in constants.ts"
```

---

### Task 2: Add jest-dom test setup

**Files:**
- Create: `site/src/test-setup.ts`
- Modify: `site/vitest.config.ts`

- [ ] **Step 1: Write `site/src/test-setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Modify `site/vitest.config.ts`**

Find: `setupFiles: [],`
Replace: `setupFiles: ['./src/test-setup.ts'],`

- [ ] **Step 3: Verify tests still pass**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm test
```

Expected: 32 tests pass. Setup file loads cleanly.

- [ ] **Step 4: Commit**

```bash
git add site/src/test-setup.ts site/vitest.config.ts
git commit -m "site(test): wire jest-dom matchers via test-setup.ts"
```

---

### Task 3: Self-host Geist + JetBrains Mono fonts

**Files:**
- Create: `site/public/fonts/Geist-Regular.woff2`
- Create: `site/public/fonts/JetBrainsMono-Regular.woff2`
- Create: `site/public/fonts/JetBrainsMono-Bold.woff2`
- Modify: `site/src/styles/global.css` — add `@font-face` declarations
- Modify: `site/index.html` — add font preload link

- [ ] **Step 1: Download font files**

Run from `/site/`:

```bash
mkdir -p public/fonts
# JetBrains Mono Regular (Latin subset)
curl -L -o public/fonts/JetBrainsMono-Regular.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff2"
# JetBrains Mono Bold
curl -L -o public/fonts/JetBrainsMono-Bold.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.woff2"
# Geist Regular
curl -L -o public/fonts/Geist-Regular.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/geist@latest/latin-400-normal.woff2"
```

Verify:
```bash
ls -la public/fonts/
# Each file should be ~20-50KB. If 0 bytes, the URL changed — try fontsource@5.1.0 explicit version.
```

If any download fails or file is zero bytes, report BLOCKED — do not silently use empty files.

- [ ] **Step 2: Add `@font-face` declarations** to `site/src/styles/global.css`

Insert AFTER the `@import "tailwindcss";` line (before `@theme`):

```css
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist';
  src: url('/fonts/Geist-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 3: Add font preload** to `site/index.html`

Find: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
Insert AFTER it:
```html
<link rel="preload" href="/fonts/JetBrainsMono-Regular.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/Geist-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

(Only preload the most critical fonts — JetBrains Mono Bold loads on demand for headings that use it.)

- [ ] **Step 4: Verify dev server**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && timeout 10 npm run dev 2>&1 | head -10
```

Open `http://localhost:5173` in browser. The "ccwatch site — Plan 1 smoke test" heading should now render in Geist instead of system sans. Log shows no 404 for fonts.

- [ ] **Step 5: Commit**

```bash
git add site/public/fonts/ site/src/styles/global.css site/index.html
git commit -m "site: self-host Geist + JetBrains Mono (font-display: swap, preload)"
```

---

### Task 4: Minimal favicon

**Files:**
- Create: `site/public/favicon.svg`

- [ ] **Step 1: Write `site/public/favicon.svg`**

Tiny amber CRT silhouette — single-color, scales clean.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="4" y="6" width="24" height="18" rx="2" fill="none" stroke="#ffb000" stroke-width="2"/>
  <rect x="8" y="10" width="16" height="10" fill="#ffb000" opacity="0.3"/>
  <rect x="12" y="24" width="8" height="2" fill="#ffb000"/>
  <rect x="10" y="26" width="12" height="2" fill="#ffb000"/>
</svg>
```

- [ ] **Step 2: Commit**

```bash
git add site/public/favicon.svg
git commit -m "site: add minimal amber CRT silhouette favicon"
```

---

## Phase B — UI Primitives (Tasks 5-9)

Each primitive is a single React component with optional minimal tests for non-trivial logic.

### Task 5: `TerminalCursor` — blinking ▍ glyph

**Files:**
- Create: `site/src/components/ui/TerminalCursor.tsx`
- Modify: `site/src/styles/animations.css` (or create it)

- [ ] **Step 1: Create `site/src/styles/animations.css`**

```css
@keyframes terminal-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@keyframes glitch-skew {
  0%, 100% { transform: skewX(0deg); }
  20% { transform: skewX(-2deg); }
  40% { transform: skewX(1deg); }
  60% { transform: skewX(-1deg); }
  80% { transform: skewX(2deg); }
}

@keyframes glitch-shift {
  0%, 100% { text-shadow: 1px 0 0 rgba(255, 103, 0, 0.5), -1px 0 0 rgba(0, 200, 255, 0.5); }
  25% { text-shadow: -2px 0 0 rgba(255, 103, 0, 0.7), 2px 0 0 rgba(0, 200, 255, 0.7); }
  50% { text-shadow: 1px 0 0 rgba(255, 103, 0, 0.4), -1px 0 0 rgba(0, 200, 255, 0.4); }
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-terminal-blink { animation: terminal-blink 1s step-end infinite; }
.animate-glitch:hover { animation: glitch-skew 0.3s steps(4) 1, glitch-shift 0.3s steps(4) 1; }
.animate-marquee { animation: marquee-scroll 30s linear infinite; }
```

- [ ] **Step 2: Import animations.css** in `site/src/main.tsx`

Find: `import './styles/global.css';`
Insert AFTER:
```typescript
import './styles/animations.css';
```

- [ ] **Step 3: Write `site/src/components/ui/TerminalCursor.tsx`**

```typescript
interface Props {
  className?: string;
}

export function TerminalCursor({ className = '' }: Props) {
  return (
    <span
      className={`inline-block animate-terminal-blink text-amber-primary ${className}`}
      aria-hidden="true"
    >
      ▍
    </span>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add site/src/styles/animations.css site/src/main.tsx site/src/components/ui/TerminalCursor.tsx
git commit -m "site(ui): add TerminalCursor + animation keyframes (blink/glitch/marquee)"
```

---

### Task 6: `NeonButton` — primary CTA with amber glow

**Files:**
- Create: `site/src/components/ui/NeonButton.tsx`

- [ ] **Step 1: Write `site/src/components/ui/NeonButton.tsx`**

```typescript
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function NeonButton({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center gap-2 px-5 py-3 font-mono text-sm uppercase tracking-wider transition-all duration-200';

  const variants = {
    primary:
      'border border-amber-primary text-amber-primary bg-amber-primary/5 hover:bg-amber-primary/15 hover:shadow-[0_0_24px_rgba(255,176,0,0.4)]',
    ghost:
      'border border-amber-dim text-amber-dim hover:text-amber-primary hover:border-amber-primary',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/ui/NeonButton.tsx
git commit -m "site(ui): add NeonButton with primary/ghost variants and amber-glow hover"
```

---

### Task 7: `GlitchText` — hover-triggered glitch effect

**Files:**
- Create: `site/src/components/ui/GlitchText.tsx`

- [ ] **Step 1: Write `site/src/components/ui/GlitchText.tsx`**

```typescript
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps text with hover glitch effect — RGB split + skew, ~300ms.
 * Animation classes defined in animations.css.
 */
export function GlitchText({ children, className = '' }: Props) {
  return <span className={`animate-glitch ${className}`}>{children}</span>;
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/ui/GlitchText.tsx
git commit -m "site(ui): add GlitchText hover effect (RGB split + skew)"
```

---

### Task 8: `CellCheckbox` — wizard cell toggler

**Files:**
- Create: `site/src/components/ui/CellCheckbox.tsx`

- [ ] **Step 1: Write `site/src/components/ui/CellCheckbox.tsx`**

```typescript
import type { CellKey } from '@/types';

interface Props {
  cellKey: CellKey;
  enabled: boolean;
  label: string;
  onToggle: (key: CellKey) => void;
}

/**
 * Visual checkbox styled as terminal selection: [x] active / [ ] inactive.
 * Uses a button (not native input) for full styling control.
 */
export function CellCheckbox({ cellKey, enabled, label, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(cellKey)}
      aria-pressed={enabled}
      className={`group flex items-start gap-3 border px-4 py-3 text-left transition-all ${
        enabled
          ? 'border-amber-primary bg-amber-primary/5 text-amber-primary'
          : 'border-amber-dim/40 text-amber-dim hover:border-amber-dim hover:text-amber-cream/80'
      }`}
    >
      <span className="font-mono text-amber-primary">[{enabled ? 'x' : ' '}]</span>
      <span className="flex-1">
        <span className="block font-mono text-sm">{cellKey}</span>
        <span className="block text-xs opacity-70 mt-0.5">{label}</span>
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/ui/CellCheckbox.tsx
git commit -m "site(ui): add CellCheckbox with [x]/[ ] terminal-style toggle"
```

---

### Task 9: `StatuslineMock` — HTML rendering of the statusline (THE critical primitive)

This is the most behavior-rich primitive. It reads zustand store state and renders the actual cell layout — what the user will paste into ccwatch. The HTML version IS the source of truth for what Plan 3's 3D version must reproduce.

**Files:**
- Create: `site/src/components/ui/StatuslineMock.tsx`
- Create: `site/src/components/ui/StatuslineMock.test.tsx`

- [ ] **Step 1: Write the failing test** at `site/src/components/ui/StatuslineMock.test.tsx`

```typescript
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useWizardStore } from '@/lib/store';
import { StatuslineMock } from './StatuslineMock';

beforeEach(() => {
  useWizardStore.getState().reset();
});

describe('StatuslineMock', () => {
  it('renders rows of enabled cells in canonical order', () => {
    // Default state has 5h, 7d, session, ctxbar enabled
    const { container } = render(<StatuslineMock />);
    // Two rows in wide mode
    const rows = container.querySelectorAll('[data-row]');
    expect(rows.length).toBe(2);
    // First row: 5h + 7d
    expect(rows[0]?.textContent).toMatch(/5h/);
    expect(rows[0]?.textContent).toMatch(/7d/);
    // Second row: session + ctxbar
    expect(rows[1]?.textContent).toMatch(/session/);
    expect(rows[1]?.textContent).toMatch(/ctxbar/);
  });

  it('shows session cost from store', () => {
    render(<StatuslineMock />);
    // Default sessionMock.cost is 0.42
    expect(screen.getByText(/\$0\.42/)).toBeInTheDocument();
  });

  it('updates rows when cells are toggled', () => {
    useWizardStore.getState().toggleCell('5h');  // turn off
    useWizardStore.getState().toggleCell('today'); // turn on
    const { container } = render(<StatuslineMock />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\b5h\b/);  // 5h gone
    expect(text).toMatch(/today/);  // today appears
  });

  it('renders empty placeholder when no cells enabled', () => {
    // Toggle off all defaults
    for (const k of ['5h', '7d', 'session', 'ctxbar'] as const) {
      useWizardStore.getState().toggleCell(k);
    }
    render(<StatuslineMock />);
    expect(screen.getByText(/no cells enabled/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test (Red)**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/components/ui/StatuslineMock.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `site/src/components/ui/StatuslineMock.tsx`**

```typescript
import { useWizardStore } from '@/lib/store';
import { computeLayout } from '@/lib/statusline-mock';
import type { CellKey, SessionMock } from '@/types';

/**
 * HTML rendering of ccwatch's statusline. Reads zustand store and emits
 * one row per CellKey row from computeLayout. Uses the breakpoint state
 * directly (NOT a derived "wide vs compact" UI mode — see lib/statusline-mock.ts).
 */
export function StatuslineMock() {
  const enabledCells = useWizardStore((s) => s.enabledCells);
  const breakpoint = useWizardStore((s) => s.breakpoint);
  const sessionMock = useWizardStore((s) => s.sessionMock);

  // For preview, use a fixed width slightly above breakpoint to show wide layout
  const rows = computeLayout(enabledCells, breakpoint + 1, breakpoint);

  if (rows.length === 0) {
    return (
      <div className="border border-amber-dim/30 bg-black/40 p-6 font-mono text-sm text-amber-dim">
        no cells enabled — pick at least one above
      </div>
    );
  }

  return (
    <div className="border border-amber-primary/30 bg-black/60 p-4 font-mono text-sm">
      {rows.map((row, i) => (
        <div
          key={i}
          data-row={i}
          className="flex gap-6 border-b border-amber-dim/20 py-2 last:border-b-0"
        >
          {row.map((cell) => (
            <CellRender key={cell} cellKey={cell} session={sessionMock} />
          ))}
        </div>
      ))}
    </div>
  );
}

function CellRender({
  cellKey,
  session,
}: {
  cellKey: CellKey;
  session: SessionMock;
}) {
  switch (cellKey) {
    case '5h':
      return <Bar label="5h" pct={session.quota5hUsedPct} countdown="2h 14m" />;
    case '7d':
      return <Bar label="7d" pct={session.quota7dUsedPct} countdown="3d 02h" />;
    case 'today':
      return <Cell label="today" value={`$${session.cost.toFixed(2)} · 4.2k tok`} />;
    case 'history':
      return <Cell label="this week" value="$12.40 · this month $48.90" />;
    case 'session':
      return (
        <Cell
          label="session"
          value={`$${session.cost.toFixed(2)} · $${session.burnRatePerHour.toFixed(2)}/h · →$${(
            session.cost +
            session.burnRatePerHour * 0.5
          ).toFixed(2)}`}
        />
      );
    case 'total':
      return <Cell label="total" value="$248.55 · ccwatch" />;
    case 'model':
      return <Cell label={`${session.contextPct}% · sonnet-4-6`} value="22:14" />;
    case 'ctxbar':
      return <Bar label="ctx" pct={session.contextPct} countdown={`${session.contextPct}%`} />;
  }
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-amber-dim text-xs uppercase tracking-wider">{label}</span>
      <span className="text-amber-primary">{value}</span>
    </div>
  );
}

function Bar({
  label,
  pct,
  countdown,
}: {
  label: string;
  pct: number;
  countdown: string;
}) {
  // amber → orange → red gradient based on pct
  const color =
    pct < 50 ? 'bg-amber-primary' : pct < 80 ? 'bg-amber-glow' : 'bg-red-500';
  return (
    <div className="flex flex-col min-w-[140px]">
      <div className="flex justify-between text-xs">
        <span className="text-amber-dim uppercase">{label}</span>
        <span className="text-amber-cream">{countdown}</span>
      </div>
      <div className="mt-1 h-2 w-full bg-black border border-amber-dim/30">
        <div
          className={`h-full transition-all ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests (Green)**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/components/ui/StatuslineMock.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add site/src/components/ui/StatuslineMock.tsx site/src/components/ui/StatuslineMock.test.tsx
git commit -m "site(ui): add StatuslineMock — HTML rendering of statusline (TDD, 4 tests)"
```

---

## Phase C — Sections (Tasks 10-15)

Each section is a self-contained component. They compose primitives + read store. Order: Demo first (highest behavior content), then visual sections.

### Task 10: `Demo.tsx` — Live Config Wizard

**Files:**
- Create: `site/src/components/sections/Demo.tsx`

This is the centerpiece interactive section. Left panel: cell checkboxes + breakpoint slider. Right panel: live `<StatuslineMock>`. Bottom: copy/download buttons + collapsible JSON.

- [ ] **Step 1: Write `site/src/components/sections/Demo.tsx`**

```typescript
import { useState } from 'react';
import { CELL_KEYS, type CellKey } from '@/types';
import { useWizardStore } from '@/lib/store';
import { buildConfig, serializeConfig } from '@/lib/config-builder';
import { MIN_BREAKPOINT, MAX_BREAKPOINT } from '@/constants';
import { CellCheckbox } from '@/components/ui/CellCheckbox';
import { NeonButton } from '@/components/ui/NeonButton';
import { StatuslineMock } from '@/components/ui/StatuslineMock';

const CELL_LABELS: Record<CellKey, string> = {
  '5h': '5-hour quota bar + countdown',
  '7d': '7-day quota bar + countdown',
  today: "today's tokens + cost",
  history: 'this week + this month',
  session: 'session cost + burn rate + projection',
  total: 'all-time cost + cwd',
  model: 'context % + model + clock',
  ctxbar: 'dedicated context window bar',
};

export function Demo() {
  const enabledCells = useWizardStore((s) => s.enabledCells);
  const breakpoint = useWizardStore((s) => s.breakpoint);
  const toggleCell = useWizardStore((s) => s.toggleCell);
  const setBreakpoint = useWizardStore((s) => s.setBreakpoint);
  const reset = useWizardStore((s) => s.reset);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = buildConfig(enabledCells, breakpoint);
  const json = serializeConfig(config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setShowJson(true);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="border-t border-amber-dim/20 px-8 py-20" id="demo">
      <h2 className="font-mono text-sm uppercase tracking-widest text-amber-dim">
        // Build your statusline
      </h2>
      <p className="mt-2 max-w-2xl text-amber-cream">
        Pick the cells you want, drag the breakpoint, copy the config. The preview on the
        right updates live — same data ccwatch shows in your terminal.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Left: controls */}
        <div className="space-y-6">
          <div className="grid gap-2 sm:grid-cols-2">
            {CELL_KEYS.map((key) => (
              <CellCheckbox
                key={key}
                cellKey={key}
                enabled={enabledCells.has(key)}
                label={CELL_LABELS[key]}
                onToggle={toggleCell}
              />
            ))}
          </div>

          <div>
            <label className="mb-2 block font-mono text-sm text-amber-dim">
              Compact breakpoint:{' '}
              <span className="text-amber-cream">{breakpoint}</span> cols
            </label>
            <input
              type="range"
              min={MIN_BREAKPOINT}
              max={MAX_BREAKPOINT}
              value={breakpoint}
              onChange={(e) => setBreakpoint(Number(e.target.value))}
              className="w-full accent-amber-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-amber-dim">
              <span>{MIN_BREAKPOINT} (compact)</span>
              <span>{MAX_BREAKPOINT} (wide)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <NeonButton onClick={handleCopy}>
              {copied ? '✓ copied' : 'Copy config.json'}
            </NeonButton>
            <NeonButton variant="ghost" onClick={handleDownload}>
              Download
            </NeonButton>
            <NeonButton variant="ghost" onClick={reset}>
              Reset
            </NeonButton>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-dim">
            Preview
          </h3>
          <StatuslineMock />
          <button
            type="button"
            onClick={() => setShowJson((v) => !v)}
            className="font-mono text-xs text-amber-dim hover:text-amber-primary"
          >
            {showJson ? '▼' : '▶'} raw config.json
          </button>
          {showJson && (
            <pre className="overflow-x-auto border border-amber-dim/30 bg-black/40 p-4 text-xs text-amber-cream">
              {json}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify dev server still runs (visual check)**

```bash
cd site && timeout 10 npm run dev 2>&1 | head -5
```

Expected: server boots. Visual verification deferred until App.tsx wires this section in (Task 16).

- [ ] **Step 3: Commit**

```bash
git add site/src/components/sections/Demo.tsx
git commit -m "site(sections): add Demo — live config wizard with copy/download"
```

---

### Task 11: `Hero.tsx` — placeholder for 3D, real copy

**Files:**
- Create: `site/src/components/sections/Hero.tsx`

Hero gets a placeholder image where the 3D CRT will land in Plan 3. Right side has the real tagline + CTAs.

- [ ] **Step 1: Write `site/src/components/sections/Hero.tsx`**

```typescript
import { NeonButton } from '@/components/ui/NeonButton';
import { GlitchText } from '@/components/ui/GlitchText';
import { TerminalCursor } from '@/components/ui/TerminalCursor';

export function Hero() {
  return (
    <section className="px-8 pt-16 pb-20">
      <div className="grid gap-12 lg:grid-cols-[55%_45%]">
        {/* Left: 3D placeholder (Plan 3 swaps this with <CRTScene/>) */}
        <div className="aspect-[4/3] border border-amber-dim/40 bg-gradient-to-br from-amber-bg to-black/80 flex items-center justify-center">
          <div className="text-center text-amber-dim">
            <div className="font-mono text-xs uppercase tracking-widest">
              [ 3D CRT — Plan 3 ]
            </div>
            <div className="mt-2 text-amber-primary/40">▢</div>
          </div>
        </div>

        {/* Right: copy + CTAs */}
        <div className="flex flex-col justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-amber-dim">
            [ ccwatch v1.0.1 ]
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] sm:text-6xl">
            <GlitchText>watch the meter,</GlitchText>
            <br />
            <GlitchText>not the bill</GlitchText>
            <TerminalCursor className="ml-2" />
          </h1>
          <p className="mt-6 max-w-md text-amber-cream/90">
            Fast cost &amp; quota statusline for Claude Code. Cached transcript scanning. Zero deps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton
              onClick={() => navigator.clipboard.writeText('npx @terzigolu/ccwatch')}
            >
              <span className="text-amber-primary">$</span>
              <span>npx @terzigolu/ccwatch</span>
            </NeonButton>
            <NeonButton
              variant="ghost"
              onClick={() => window.open('https://github.com/terzigolu/ccwatch', '_blank')}
            >
              View on GitHub →
            </NeonButton>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-amber-dim">
            <span>~80ms warm render</span>
            <span>·</span>
            <span>1163 LOC compiled</span>
            <span>·</span>
            <span>0 runtime deps</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/sections/Hero.tsx
git commit -m "site(sections): add Hero with placeholder for Plan 3 CRT + tagline + CTAs"
```

---

### Task 12: `WhyFast.tsx` — 3 cards

**Files:**
- Create: `site/src/components/sections/WhyFast.tsx`

- [ ] **Step 1: Write `site/src/components/sections/WhyFast.tsx`**

```typescript
const CARDS = [
  {
    title: 'mtime + size cache',
    quote: 'Per-file fingerprint. We don\'t re-read what hasn\'t changed.',
    stat: 'cold 0.9s · warm 80ms',
  },
  {
    title: 'streaming dedup',
    quote: 'Each API call writes 2-7 JSONL entries. We dedupe by message.id.',
    stat: '1.0× counted, never inflated',
  },
  {
    title: 'substring prefilter',
    quote: 'Skip JSON.parse on lines that can\'t match. 50× faster.',
    stat: '~50× scan speedup',
  },
];

export function WhyFast() {
  return (
    <section className="border-t border-amber-dim/20 px-8 py-20">
      <h2 className="font-mono text-sm uppercase tracking-widest text-amber-dim">
        // Why it&apos;s fast
      </h2>
      <p className="mt-2 max-w-2xl text-amber-cream">
        Other tools re-scan the entire ~/.claude/projects tree every render. ccwatch caches
        per-file. Three techniques compound.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="group border border-amber-dim/30 bg-black/30 p-6 transition-all hover:border-amber-primary hover:shadow-[0_0_24px_rgba(255,176,0,0.15)]"
          >
            <h3 className="font-mono text-amber-primary">{card.title}</h3>
            <p className="mt-3 text-amber-cream/85 leading-relaxed">{card.quote}</p>
            <div className="mt-4 font-mono text-xs uppercase tracking-wider text-amber-glow">
              {card.stat}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/sections/WhyFast.tsx
git commit -m "site(sections): add WhyFast with 3 performance cards (cache/dedup/prefilter)"
```

---

### Task 13: `Accurate.tsx` — pricing table + comparison

**Files:**
- Create: `site/src/components/sections/Accurate.tsx`

- [ ] **Step 1: Write `site/src/components/sections/Accurate.tsx`**

```typescript
import { MODEL_RATES, costFor } from '@/lib/pricing-data';

const ROWS: Array<{ id: 'opus' | 'sonnet' | 'haiku'; label: string }> = [
  { id: 'opus', label: 'Opus' },
  { id: 'sonnet', label: 'Sonnet' },
  { id: 'haiku', label: 'Haiku' },
];

export function Accurate() {
  // 100k input + 100k output → cost per model
  const usage = { input: 100_000, output: 100_000, cacheRead: 0 };

  return (
    <section className="border-t border-amber-dim/20 px-8 py-20 bg-black/20">
      <h2 className="font-display text-3xl">
        Opus output is <span className="text-amber-glow">19×</span> more expensive than Haiku.
      </h2>
      <p className="mt-3 text-amber-cream/85">
        Most tools estimate. We don&apos;t.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Pricing table */}
        <div className="overflow-x-auto border border-amber-dim/30">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-amber-dim/30 bg-black/40">
                <th className="px-4 py-3 text-left text-amber-dim uppercase text-xs tracking-wider">
                  Model
                </th>
                <th className="px-4 py-3 text-right text-amber-dim uppercase text-xs tracking-wider">
                  Input / M
                </th>
                <th className="px-4 py-3 text-right text-amber-dim uppercase text-xs tracking-wider">
                  Output / M
                </th>
                <th className="px-4 py-3 text-right text-amber-dim uppercase text-xs tracking-wider">
                  Cache read / M
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const rates = MODEL_RATES[row.id];
                return (
                  <tr key={row.id} className="border-b border-amber-dim/15 last:border-b-0">
                    <td className="px-4 py-3 text-amber-primary">{row.label}</td>
                    <td className="px-4 py-3 text-right text-amber-cream">${rates.inputPerM}</td>
                    <td className="px-4 py-3 text-right text-amber-cream">${rates.outputPerM}</td>
                    <td className="px-4 py-3 text-right text-amber-cream">
                      ${rates.cacheReadPerM.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar chart: same usage, different bills */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-dim">
            Same 100k input + 100k output
          </h3>
          <div className="mt-4 space-y-3">
            {ROWS.map((row) => {
              const cost = costFor(row.id, usage);
              const max = costFor('opus', usage);
              const pct = (cost / max) * 100;
              return (
                <div key={row.id} className="space-y-1">
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-amber-primary">{row.label}</span>
                    <span className="text-amber-cream">${cost.toFixed(2)}</span>
                  </div>
                  <div className="h-3 w-full bg-black border border-amber-dim/30">
                    <div
                      className="h-full bg-amber-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/sections/Accurate.tsx
git commit -m "site(sections): add Accurate — pricing table + Opus/Sonnet/Haiku comparison bars"
```

---

### Task 14: `Install.tsx` — npm + plugin tabs

**Files:**
- Create: `site/src/components/sections/Install.tsx`

- [ ] **Step 1: Write `site/src/components/sections/Install.tsx`**

```typescript
import { useState } from 'react';

const TABS = [
  {
    id: 'npx' as const,
    label: 'npx (one-line)',
    code: 'npx @terzigolu/ccwatch',
  },
  {
    id: 'plugin' as const,
    label: 'Claude Code plugin',
    code: '/plugin marketplace add https://github.com/terzigolu/ccwatch\n/plugin install ccwatch\n/setup',
  },
];

const COMMANDS = [
  { name: '/ccwatch', desc: 'interactive visibility wizard' },
  { name: '/setup', desc: 'wire statusLine.command if it drifts' },
  { name: '/configure', desc: 'edit config JSON directly' },
  { name: '/doctor', desc: 'diagnose plugin install + statusline wiring' },
];

export function Install() {
  const [activeTab, setActiveTab] = useState<'npx' | 'plugin'>('npx');
  const [copied, setCopied] = useState(false);
  const active = TABS.find((t) => t.id === activeTab) ?? TABS[0]!;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="border-t border-amber-dim/20 px-8 py-20">
      <h2 className="font-mono text-sm uppercase tracking-widest text-amber-dim">
        // Install
      </h2>

      <div className="mt-8 max-w-3xl">
        {/* Tab buttons */}
        <div className="flex border-b border-amber-dim/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-mono text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-amber-primary text-amber-primary -mb-px'
                  : 'text-amber-dim hover:text-amber-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="relative mt-4 border border-amber-dim/30 bg-black/60">
          <pre className="overflow-x-auto p-5 font-mono text-sm text-amber-cream">
            {active.code}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 border border-amber-dim/40 bg-black/50 px-3 py-1 font-mono text-xs text-amber-dim hover:border-amber-primary hover:text-amber-primary"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
        </div>

        {/* Slash commands */}
        <div className="mt-10">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-dim">
            Slash commands
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {COMMANDS.map((cmd) => (
              <div key={cmd.name} className="flex gap-3">
                <dt className="font-mono text-amber-primary">{cmd.name}</dt>
                <dd className="text-amber-cream/80">{cmd.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/sections/Install.tsx
git commit -m "site(sections): add Install with npx/plugin tabs + slash commands list"
```

---

### Task 15: `Footer.tsx`

**Files:**
- Create: `site/src/components/sections/Footer.tsx`

- [ ] **Step 1: Write `site/src/components/sections/Footer.tsx`**

```typescript
export function Footer() {
  return (
    <footer className="border-t border-amber-dim/30 px-8 py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-amber-dim">
            Built by
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-amber-primary">
            <a
              href="https://github.com/yajinn"
              className="hover:text-amber-cream hover:underline"
            >
              yajinn
            </a>
            <span className="text-amber-dim">+</span>
            <a
              href="https://github.com/terzigolu"
              className="hover:text-amber-cream hover:underline"
            >
              terzigolu
            </a>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs">
            <a
              href="https://github.com/terzigolu/ccwatch"
              className="text-amber-dim hover:text-amber-primary"
            >
              github →
            </a>
            <a
              href="https://www.npmjs.com/package/@terzigolu/ccwatch"
              className="text-amber-dim hover:text-amber-primary"
            >
              npm →
            </a>
          </div>
        </div>

        <div className="font-mono text-xs text-amber-dim">
          MIT 2026 · ccwatch
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add site/src/components/sections/Footer.tsx
git commit -m "site(sections): add Footer with author credits + repo links"
```

---

## Phase D — Integration (Task 16)

### Task 16: Wire all sections into `App.tsx` + final verification

**Files:**
- Modify: `site/src/App.tsx`

- [ ] **Step 1: Replace `site/src/App.tsx`**

```typescript
import { Hero } from '@/components/sections/Hero';
import { Demo } from '@/components/sections/Demo';
import { WhyFast } from '@/components/sections/WhyFast';
import { Accurate } from '@/components/sections/Accurate';
import { Install } from '@/components/sections/Install';
import { Footer } from '@/components/sections/Footer';

export default function App() {
  return (
    <main className="mx-auto max-w-7xl">
      <Hero />
      <Demo />
      <WhyFast />
      <Accurate />
      <Install />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Run all verifications**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run typecheck && npm test && npm run build && du -sh dist/assets/*.js dist/assets/*.css
```

Expected:
- typecheck: 0 errors
- tests: 36+ pass (32 from Plan 1 + StatuslineMock's 4)
- build: clean, dist/ produced
- bundle: JS gzipped < 110KB, CSS < 15KB

If any step fails, report DONE_WITH_CONCERNS with full output.

- [ ] **Step 3: Open dev server and visual smoke**

```bash
cd site && timeout 15 npm run dev 2>&1 | head -5
```

Visit `http://localhost:5173/`. Verify:
- All six sections render top-to-bottom
- Hero shows the 3D placeholder + tagline + CTAs
- Demo wizard works (toggle cells, slide breakpoint, see live preview, copy/download)
- Tabs in Install work
- Footer links open correctly

If any section is broken, report DONE_WITH_CONCERNS with screenshots/notes.

- [ ] **Step 4: Commit**

```bash
git add site/src/App.tsx
git commit -m "site: wire all six sections into App — full 2D site renders"
```

---

## Phase D — Done. Verification Checklist

- [ ] `cd site && npm run typecheck` clean
- [ ] `cd site && npm test` ≥ 36 tests pass
- [ ] `cd site && npm run build` clean, bundle < 110KB gz JS
- [ ] All 6 sections visible at :5173
- [ ] Demo wizard fully functional (toggle, slider, copy, download, reset)
- [ ] Hero placeholder visible (Plan 3 swaps in 3D scene)
- [ ] Fonts loaded (Geist + JetBrains Mono visible in DevTools Network)
- [ ] Favicon shows in browser tab
- [ ] No console errors
- [ ] No imports from `../src/` in `site/src/`

---

## Self-Review Notes

**Spec coverage:**
- Spec §6 sections — all 6 implemented (Hero, Demo, WhyFast, Accurate, Install, Footer) ✓
- Spec §6.2 Demo wizard — full state binding via Plan 1 store + config-builder ✓
- Spec §6.3 WhyFast cards — 3 cards with stats ✓
- Spec §6.4 Accurate — table + comparison bars (no 3D required) ✓
- Spec §6.5 Install — npx + plugin tabs + commands list ✓
- Spec §6.6 Footer — author credits + links ✓
- Spec §6.7 UI conventions — JetBrains Mono / Geist (Task 3), amber palette (Plan 1), border 30% opacity (component CSS) ✓
- Spec §7 error handling — clipboard fallback (Demo Task 10), reduced-motion (Plan 1 global.css) ✓

**Out of scope (deferred):**
- 3D CRT (Plan 3) — placeholder image stands in
- WebGL fallback for hero — N/A until 3D lands
- Open Graph tags / canonical URL (Plan 4 SEO polish)
- Playwright visual smoke (Plan 4)
- Cloudflare Pages deploy (Plan 4)

**Plan coherence:**
- Tasks 1-4 (Setup) — independent of each other, can run in any order; serial chosen for clarity
- Tasks 5-9 (UI primitives) — TerminalCursor → NeonButton → GlitchText → CellCheckbox → StatuslineMock dependency chain (each builds on previous)
- Tasks 10-15 (Sections) — Demo (Task 10) is the most complex; visual sections (11-15) follow with simpler patterns
- Task 16 wires it all — single-file change, the visual smoke is here

**Forward references:**
- Plan 3 will swap `<div>[ 3D CRT — Plan 3 ]</div>` placeholder in Hero for `<CRTScene />` — single-file diff
- Plan 4 will add Open Graph + Playwright + Cloudflare config — no code changes to existing components

**Type consistency:** `CellKey`, `Config`, `ModelRates`, `SessionMock`, `WizardStore` all from `@/types`/`@/lib/store`. New types added: `Tab` (in Install.tsx, local) — fine because not exported.
