# ccwatch Site — Plan 1: Foundations & Pure Logic

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `/site` directory as an isolated Vite + React + TypeScript project, install all dependencies, configure tooling, and ship a fully tested pure-logic layer (types, pricing data, statusline layout, config builder, zustand store) with no UI yet.

**Architecture:** Self-contained sub-project at `/site/` with its own `package.json`. No imports from the parent ccwatch CLI. The pure-logic layer is the single source of truth that the later UI/3D layers will subscribe to. TDD throughout because the layout-calculation logic is the most failure-prone piece — if `config.json` output is wrong, users paste broken configs into production.

**Tech Stack:** Vite 5, React 18, TypeScript 5.6 (strict), Tailwind CSS v4, Vitest, zustand. (Playwright + R3F come in later plans.)

**Predecessor spec:** `docs/superpowers/specs/2026-04-27-ccwatch-site-design.md`

---

## File Structure (this plan creates)

```
/site/
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── index.html
├── README.md
└── src/
    ├── main.tsx                # Vite entry, mounts <App />
    ├── App.tsx                 # placeholder root, prints zustand state
    ├── types.ts                # CellKey, Config types
    ├── styles/
    │   └── global.css          # Tailwind v4 + @theme amber palette tokens
    └── lib/
        ├── pricing-data.ts     # per-model cost rates (Opus/Sonnet/Haiku)
        ├── pricing-data.test.ts
        ├── statusline-mock.ts  # layout calc: enabledCells → rows
        ├── statusline-mock.test.ts
        ├── config-builder.ts   # store state → config.json string
        ├── config-builder.test.ts
        └── store.ts            # zustand store: WizardState + actions
```

**End state:** `cd site && npm run dev` shows a placeholder page with a button that toggles a cell. `npm test` runs 20+ unit tests, all green. `npm run build` produces `site/dist/`. No 3D, no styled UI, no sections — those come in Plan 2.

---

## Phase 0 — Scaffolding (Tasks 1-7)

### Task 1: Create `/site` directory and write `package.json`

**Files:**
- Create: `site/package.json`

- [ ] **Step 1: Create the directory**

Run:
```bash
mkdir -p /Users/yajinn/Desktop/Projects/ccwatch/site/src/lib /Users/yajinn/Desktop/Projects/ccwatch/site/src/styles
```

- [ ] **Step 2: Write `site/package.json`**

```json
{
  "name": "ccwatch-site",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "description": "Marketing site for @terzigolu/ccwatch",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc -b --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm install
```

Expected: `node_modules/` created. No errors.

- [ ] **Step 4: Verify install**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && ls node_modules/react node_modules/zustand node_modules/vite | head -5
```

Expected: directories listed.

- [ ] **Step 5: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/package.json
git commit -m "site: scaffold package.json with Vite + React + TS + zustand + Tailwind v4"
```

---

### Task 2: Add `.gitignore` and update root `package.json` exclusions

**Files:**
- Create: `site/.gitignore`
- Verify: `package.json` (root) — confirm `files` array excludes `site/`

- [ ] **Step 1: Write `site/.gitignore`**

```
node_modules
dist
dist-ssr
*.local
.vite
coverage
*.log

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

- [ ] **Step 2: Verify root `package.json#files` does NOT include `site/`**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch && cat package.json | grep -A20 '"files"'
```

Expected output includes `.claude-plugin/`, `assets/`, `bin/`, `commands/`, `dist/`, `hooks/`, `src/`, `LICENSE`, `README.md`, `CHANGELOG.md` — but **no** `site/`. The `files` array in `package.json` is an allowlist, so `site/` is excluded by default. No change needed.

- [ ] **Step 3: Verify lock file is in site, not root**

Run:
```bash
ls /Users/yajinn/Desktop/Projects/ccwatch/site/package-lock.json && ls /Users/yajinn/Desktop/Projects/ccwatch/package-lock.json 2>&1 || echo "no root lock — good"
```

Expected: site lock exists. Root has `yarn.lock` (existing — leave alone).

- [ ] **Step 4: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/.gitignore site/package-lock.json
git commit -m "site: add gitignore + package lock"
```

---

### Task 3: TypeScript configuration

**Files:**
- Create: `site/tsconfig.json`
- Create: `site/tsconfig.node.json`

- [ ] **Step 1: Write `site/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    "types": ["vitest/globals"],

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 2: Write `site/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 3: Run typecheck (should fail — no source files yet, that's fine)**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx tsc -b --noEmit 2>&1 | head -10
```

Expected: errors about missing src files OR clean run. Either is OK at this stage.

- [ ] **Step 4: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/tsconfig.json site/tsconfig.node.json
git commit -m "site: add TypeScript strict config with @/ path alias"
```

---

### Task 4: Vite + Vitest config

**Files:**
- Create: `site/vite.config.ts`
- Create: `site/vitest.config.ts`
- Create: `site/index.html`

- [ ] **Step 1: Write `site/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
```

- [ ] **Step 2: Write `site/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts'],
    },
  },
});
```

- [ ] **Step 3: Write `site/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1a0f00" />
    <title>ccwatch — watch the meter, not the bill</title>
    <meta
      name="description"
      content="Fast cost & quota statusline for Claude Code. Cached transcript scanning. Zero deps."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/vite.config.ts site/vitest.config.ts site/index.html
git commit -m "site: add Vite + Vitest config and index.html"
```

---

### Task 5: Tailwind v4 with amber palette

**Files:**
- Create: `site/src/styles/global.css`

- [ ] **Step 1: Write `site/src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  /* Amber terminal palette — see spec §4.2 */
  --color-amber-bg: #1a0f00;
  --color-amber-primary: #ffb000;
  --color-amber-glow: #ff6700;
  --color-amber-cream: #fff8e1;
  --color-amber-dim: #806000;

  /* Fonts (loaded later in Plan 2) */
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --font-display: 'Geist', ui-sans-serif, system-ui, sans-serif;
}

html, body, #root {
  height: 100%;
  background: var(--color-amber-bg);
  color: var(--color-amber-primary);
  font-family: var(--font-mono);
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
}

/* Faint global scanline overlay — appears across the whole page */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 2px,
    rgba(255, 176, 0, 0.04) 3px,
    transparent 4px
  );
  mix-blend-mode: overlay;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/styles/global.css
git commit -m "site: add Tailwind v4 global stylesheet with amber palette + scanline overlay"
```

---

### Task 6: Minimal entry point — verify dev server runs

**Files:**
- Create: `site/src/main.tsx`
- Create: `site/src/App.tsx`

- [ ] **Step 1: Write `site/src/main.tsx`**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 2: Write placeholder `site/src/App.tsx`**

```typescript
export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-display text-4xl text-amber-primary">
          ccwatch site — scaffold ok
        </h1>
        <p className="mt-4 text-amber-dim">
          Plan 1 / Phase 0 complete. Logic layer next.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Run dev server**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && timeout 15 npm run dev 2>&1 | head -10
```

Expected: `VITE v5.x.x ready in NNN ms` and `Local: http://localhost:5173/`. No errors.

- [ ] **Step 4: Run typecheck**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run typecheck
```

Expected: clean exit (0 errors).

- [ ] **Step 5: Run build**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run build
```

Expected: `dist/` created. No errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/main.tsx site/src/App.tsx
git commit -m "site: add minimal entry point — dev server and build verified"
```

---

### Task 7: README for `/site/` subdirectory

**Files:**
- Create: `site/README.md`

- [ ] **Step 1: Write `site/README.md`**

```markdown
# ccwatch-site

Marketing site for [@terzigolu/ccwatch](https://www.npmjs.com/package/@terzigolu/ccwatch).

This is a self-contained Vite + React + TypeScript project. It does NOT import from the parent ccwatch CLI — it simulates statusline output independently so its lifecycle is decoupled from the CLI version.

## Develop

```bash
cd site
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # → dist/
```

## Deploy

Cloudflare Pages connected to the parent repo. Build settings:
- Build command: `cd site && npm install && npm run build`
- Output directory: `site/dist`
- Root directory: `/` (repo root)

## Structure

See `docs/superpowers/specs/2026-04-27-ccwatch-site-design.md` in the parent repo for the full spec.
```

- [ ] **Step 2: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/README.md
git commit -m "site: add README for /site/ subdirectory"
```

---

## Phase 1 — Pure Logic with TDD (Tasks 8-13)

### Task 8: Domain types (`src/types.ts`)

**Files:**
- Create: `site/src/types.ts`

- [ ] **Step 1: Write `site/src/types.ts`**

```typescript
/**
 * Statusline cell keys — the 8 visibility options from ccwatch's wizard.
 * Source of truth: README.md "Available cells" table.
 */
export const CELL_KEYS = [
  '5h',
  '7d',
  'today',
  'history',
  'session',
  'total',
  'model',
  'ctxbar',
] as const;

export type CellKey = (typeof CELL_KEYS)[number];

/**
 * Layout: each row is a horizontal grouping of cells.
 * `null` columns means auto (width-driven). See ccwatch config schema.
 */
export type CellRow = CellKey[];

export interface Config {
  rows: CellRow[];
  compactRows: CellRow[];
  compactBreakpoint: number;
  columns: number | null;
}

/**
 * Per-model rates — USD per 1 million tokens. Cache reads are 10% of input rate.
 * Mirror of ccwatch's pricing.ts (manually kept in sync).
 */
export interface ModelRates {
  inputPerM: number;
  outputPerM: number;
  cacheReadPerM: number;
}

export type ModelId = 'opus' | 'sonnet' | 'haiku';

/**
 * Live-tickered values used by hero CRT and demo preview to look "alive".
 * Not user-controlled — animated via R3F's useFrame loop in later plans.
 */
export interface SessionMock {
  cost: number;
  burnRatePerHour: number;
  contextPct: number;
  quota5hUsedPct: number;
  quota7dUsedPct: number;
  durationSec: number;
}
```

- [ ] **Step 2: Run typecheck**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/types.ts
git commit -m "site: add domain types (CellKey, Config, ModelRates, SessionMock)"
```

---

### Task 9: Pricing data with TDD

**Files:**
- Create: `site/src/lib/pricing-data.test.ts`
- Create: `site/src/lib/pricing-data.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// site/src/lib/pricing-data.test.ts
import { describe, expect, it } from 'vitest';
import { MODEL_RATES, costFor, getRates } from './pricing-data';

describe('MODEL_RATES', () => {
  it('has Opus rates', () => {
    expect(MODEL_RATES.opus).toEqual({
      inputPerM: 15,
      outputPerM: 75,
      cacheReadPerM: 1.5,
    });
  });

  it('has Sonnet rates', () => {
    expect(MODEL_RATES.sonnet).toEqual({
      inputPerM: 3,
      outputPerM: 15,
      cacheReadPerM: 0.3,
    });
  });

  it('has Haiku rates', () => {
    expect(MODEL_RATES.haiku).toEqual({
      inputPerM: 0.8,
      outputPerM: 4,
      cacheReadPerM: 0.08,
    });
  });

  it('cache read is 10% of input rate for all models', () => {
    for (const id of ['opus', 'sonnet', 'haiku'] as const) {
      const rates = MODEL_RATES[id];
      expect(rates.cacheReadPerM).toBeCloseTo(rates.inputPerM * 0.1, 5);
    }
  });
});

describe('getRates', () => {
  it('returns rates by model id', () => {
    expect(getRates('opus').outputPerM).toBe(75);
  });
});

describe('costFor', () => {
  it('computes cost for input tokens', () => {
    // 1 million Opus input tokens = $15
    expect(costFor('opus', { input: 1_000_000, output: 0, cacheRead: 0 })).toBeCloseTo(15, 4);
  });

  it('computes cost for output tokens', () => {
    // 1M Opus output = $75
    expect(costFor('opus', { input: 0, output: 1_000_000, cacheRead: 0 })).toBeCloseTo(75, 4);
  });

  it('computes cost for cache reads', () => {
    // 1M Opus cache reads = $1.50
    expect(costFor('opus', { input: 0, output: 0, cacheRead: 1_000_000 })).toBeCloseTo(1.5, 4);
  });

  it('sums all three components', () => {
    // 100k input + 50k output + 200k cache reads on Sonnet
    // = (0.1 * 3) + (0.05 * 15) + (0.2 * 0.3)
    // = 0.3 + 0.75 + 0.06 = 1.11
    expect(costFor('sonnet', { input: 100_000, output: 50_000, cacheRead: 200_000 })).toBeCloseTo(1.11, 4);
  });

  it('returns zero for zero usage', () => {
    expect(costFor('haiku', { input: 0, output: 0, cacheRead: 0 })).toBe(0);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/pricing-data.test.ts
```

Expected: FAIL with module-not-found error for `./pricing-data`.

- [ ] **Step 3: Implement `site/src/lib/pricing-data.ts`**

```typescript
import type { ModelId, ModelRates } from '@/types';

/**
 * Per-model token rates in USD per million tokens.
 * Cache read rate is 10% of input rate (Anthropic pricing convention).
 *
 * Manually kept in sync with ccwatch's src/pricing.ts.
 */
export const MODEL_RATES: Record<ModelId, ModelRates> = {
  opus: { inputPerM: 15, outputPerM: 75, cacheReadPerM: 1.5 },
  sonnet: { inputPerM: 3, outputPerM: 15, cacheReadPerM: 0.3 },
  haiku: { inputPerM: 0.8, outputPerM: 4, cacheReadPerM: 0.08 },
};

export function getRates(model: ModelId): ModelRates {
  return MODEL_RATES[model];
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
}

/**
 * Compute USD cost for a given token usage on a given model.
 * Returns dollars (e.g. 1.11 = $1.11).
 */
export function costFor(model: ModelId, usage: TokenUsage): number {
  const rates = getRates(model);
  return (
    (usage.input / 1_000_000) * rates.inputPerM +
    (usage.output / 1_000_000) * rates.outputPerM +
    (usage.cacheRead / 1_000_000) * rates.cacheReadPerM
  );
}
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/pricing-data.test.ts
```

Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/lib/pricing-data.ts site/src/lib/pricing-data.test.ts
git commit -m "site(lib): add pricing-data with per-model rates and cost calculator (TDD)"
```

---

### Task 10: Statusline mock layout calc with TDD

**Files:**
- Create: `site/src/lib/statusline-mock.test.ts`
- Create: `site/src/lib/statusline-mock.ts`

This module decides which cells appear in which row given the user's selection and current viewport. It is the brain of both the HTML preview (Plan 2) and the 3D CRT screen (Plan 3).

- [ ] **Step 1: Write the failing test**

```typescript
// site/src/lib/statusline-mock.test.ts
import { describe, expect, it } from 'vitest';
import { computeLayout, defaultLayout } from './statusline-mock';
import type { CellKey } from '@/types';

describe('defaultLayout', () => {
  it('returns the README example as default', () => {
    expect(defaultLayout()).toEqual({
      rows: [['5h', '7d'], ['session', 'ctxbar']],
      compactRows: [['5h', '7d'], ['session'], ['ctxbar']],
      compactBreakpoint: 113,
      columns: null,
    });
  });
});

describe('computeLayout', () => {
  it('places 2 cells in a single row when terminal is wide', () => {
    const enabled = new Set<CellKey>(['5h', '7d']);
    expect(computeLayout(enabled, 200)).toEqual([['5h', '7d']]);
  });

  it('drops to one cell per row when below breakpoint', () => {
    const enabled = new Set<CellKey>(['5h', '7d']);
    expect(computeLayout(enabled, 80)).toEqual([['5h'], ['7d']]);
  });

  it('groups cells in pairs (2 per row) when wide', () => {
    const enabled = new Set<CellKey>(['5h', '7d', 'session', 'ctxbar']);
    expect(computeLayout(enabled, 200)).toEqual([
      ['5h', '7d'],
      ['session', 'ctxbar'],
    ]);
  });

  it('handles odd cell count (last row has single cell)', () => {
    const enabled = new Set<CellKey>(['5h', '7d', 'session']);
    expect(computeLayout(enabled, 200)).toEqual([
      ['5h', '7d'],
      ['session'],
    ]);
  });

  it('preserves canonical cell order regardless of insertion order', () => {
    const enabled = new Set<CellKey>(['ctxbar', 'today', '5h']);
    expect(computeLayout(enabled, 200)).toEqual([
      ['5h', 'today'],
      ['ctxbar'],
    ]);
  });

  it('returns empty array when no cells enabled', () => {
    expect(computeLayout(new Set(), 200)).toEqual([]);
  });

  it('uses provided breakpoint', () => {
    const enabled = new Set<CellKey>(['5h', '7d']);
    // breakpoint=150: width 140 < 150 → compact mode
    expect(computeLayout(enabled, 140, 150)).toEqual([['5h'], ['7d']]);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/statusline-mock.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `site/src/lib/statusline-mock.ts`**

```typescript
import { CELL_KEYS, type CellKey, type Config } from '@/types';

const DEFAULT_BREAKPOINT = 113;

/**
 * Default README example config — 2x2 wide, 1x3 compact.
 */
export function defaultLayout(): Config {
  return {
    rows: [['5h', '7d'], ['session', 'ctxbar']],
    compactRows: [['5h', '7d'], ['session'], ['ctxbar']],
    compactBreakpoint: DEFAULT_BREAKPOINT,
    columns: null,
  };
}

/**
 * Given the user's enabled cells and a terminal width, compute the row layout.
 *
 * Rules:
 * - Cells appear in canonical CELL_KEYS order, regardless of insertion order.
 * - Wide mode (width >= breakpoint): 2 cells per row, last row may have 1.
 * - Compact mode (width < breakpoint): 1 cell per row.
 * - No enabled cells → empty layout.
 */
export function computeLayout(
  enabled: Set<CellKey>,
  width: number,
  breakpoint = DEFAULT_BREAKPOINT,
): CellKey[][] {
  if (enabled.size === 0) return [];

  const ordered = CELL_KEYS.filter((key) => enabled.has(key));
  const compact = width < breakpoint;
  const cellsPerRow = compact ? 1 : 2;

  const rows: CellKey[][] = [];
  for (let i = 0; i < ordered.length; i += cellsPerRow) {
    rows.push(ordered.slice(i, i + cellsPerRow));
  }
  return rows;
}
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/statusline-mock.test.ts
```

Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/lib/statusline-mock.ts site/src/lib/statusline-mock.test.ts
git commit -m "site(lib): add statusline-mock layout calc (canonical order + compact mode)"
```

---

### Task 11: Config builder with TDD

**Files:**
- Create: `site/src/lib/config-builder.test.ts`
- Create: `site/src/lib/config-builder.ts`

This module produces the `config.json` string the user copies into their `~/.claude/plugins/ccwatch/config.json`. **This is the most user-facing piece of pure logic** — if it produces malformed JSON, the user pastes it into prod and breaks their statusline. Defensive testing matters here.

- [ ] **Step 1: Write the failing test**

```typescript
// site/src/lib/config-builder.test.ts
import { describe, expect, it } from 'vitest';
import { buildConfig, serializeConfig } from './config-builder';
import type { CellKey } from '@/types';

describe('buildConfig', () => {
  it('produces empty rows when no cells enabled', () => {
    const cfg = buildConfig(new Set(), 113);
    expect(cfg.rows).toEqual([]);
    expect(cfg.compactRows).toEqual([]);
    expect(cfg.compactBreakpoint).toBe(113);
    expect(cfg.columns).toBeNull();
  });

  it('produces wide and compact layouts from same cell set', () => {
    const enabled = new Set<CellKey>(['5h', '7d', 'session', 'ctxbar']);
    const cfg = buildConfig(enabled, 113);
    expect(cfg.rows).toEqual([
      ['5h', '7d'],
      ['session', 'ctxbar'],
    ]);
    expect(cfg.compactRows).toEqual([['5h'], ['7d'], ['session'], ['ctxbar']]);
  });

  it('respects custom breakpoint in produced config', () => {
    const enabled = new Set<CellKey>(['5h']);
    expect(buildConfig(enabled, 90).compactBreakpoint).toBe(90);
  });

  it('clamps breakpoint to [80, 160]', () => {
    expect(buildConfig(new Set(['5h']), 50).compactBreakpoint).toBe(80);
    expect(buildConfig(new Set(['5h']), 200).compactBreakpoint).toBe(160);
    expect(buildConfig(new Set(['5h']), 113).compactBreakpoint).toBe(113);
  });
});

describe('serializeConfig', () => {
  it('produces stable, pretty JSON', () => {
    const enabled = new Set<CellKey>(['5h', '7d']);
    const cfg = buildConfig(enabled, 113);
    const json = serializeConfig(cfg);
    expect(json).toBe(
      [
        '{',
        '  "rows": [',
        '    [',
        '      "5h",',
        '      "7d"',
        '    ]',
        '  ],',
        '  "compactRows": [',
        '    [',
        '      "5h",',
        '      "7d"',
        '    ]',
        '  ],',
        '  "compactBreakpoint": 113,',
        '  "columns": null',
        '}',
      ].join('\n'),
    );
  });

  it('round-trips through JSON.parse', () => {
    const cfg = buildConfig(new Set<CellKey>(['session', 'ctxbar']), 113);
    const json = serializeConfig(cfg);
    const parsed = JSON.parse(json);
    expect(parsed.rows).toEqual(cfg.rows);
    expect(parsed.compactRows).toEqual(cfg.compactRows);
    expect(parsed.columns).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/config-builder.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `site/src/lib/config-builder.ts`**

```typescript
import type { CellKey, Config } from '@/types';
import { computeLayout } from './statusline-mock';

const MIN_BREAKPOINT = 80;
const MAX_BREAKPOINT = 160;

/**
 * Build a ccwatch config object from the wizard state.
 *
 * - Wide layout: derived via computeLayout at width = breakpoint + 1 (just-wide).
 * - Compact layout: derived at width = breakpoint - 1 (just-compact).
 * - Breakpoint is clamped to [80, 160] cols.
 */
export function buildConfig(enabled: Set<CellKey>, breakpoint: number): Config {
  const clampedBreakpoint = Math.max(
    MIN_BREAKPOINT,
    Math.min(MAX_BREAKPOINT, Math.round(breakpoint)),
  );

  return {
    rows: computeLayout(enabled, clampedBreakpoint + 1, clampedBreakpoint),
    compactRows: computeLayout(enabled, clampedBreakpoint - 1, clampedBreakpoint),
    compactBreakpoint: clampedBreakpoint,
    columns: null,
  };
}

/**
 * Serialize a Config to a stable, human-readable JSON string.
 * 2-space indent, ordered keys, suitable for pasting into config.json.
 */
export function serializeConfig(config: Config): string {
  return JSON.stringify(
    {
      rows: config.rows,
      compactRows: config.compactRows,
      compactBreakpoint: config.compactBreakpoint,
      columns: config.columns,
    },
    null,
    2,
  );
}
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/config-builder.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/lib/config-builder.ts site/src/lib/config-builder.test.ts
git commit -m "site(lib): add config-builder (clamps breakpoint, stable JSON serialize)"
```

---

### Task 12: Zustand store

**Files:**
- Create: `site/src/lib/store.ts`
- Create: `site/src/lib/store.test.ts`

The store is the single source of truth shared between the wizard (Plan 2) and the 3D CRT (Plan 3). Per spec §5.2, user-driven state lives here; animated tickers go through refs in later plans.

- [ ] **Step 1: Write the failing test**

```typescript
// site/src/lib/store.test.ts
import { afterEach, describe, expect, it } from 'vitest';
import { useWizardStore } from './store';

const initial = useWizardStore.getState();
afterEach(() => {
  useWizardStore.setState(initial, true);
});

describe('useWizardStore', () => {
  it('starts with the README default cells enabled', () => {
    const { enabledCells } = useWizardStore.getState();
    expect(enabledCells.has('5h')).toBe(true);
    expect(enabledCells.has('7d')).toBe(true);
    expect(enabledCells.has('session')).toBe(true);
    expect(enabledCells.has('ctxbar')).toBe(true);
    expect(enabledCells.has('today')).toBe(false);
  });

  it('starts with breakpoint 113', () => {
    expect(useWizardStore.getState().breakpoint).toBe(113);
  });

  it('toggles a cell on', () => {
    useWizardStore.getState().toggleCell('today');
    expect(useWizardStore.getState().enabledCells.has('today')).toBe(true);
  });

  it('toggles a cell off', () => {
    useWizardStore.getState().toggleCell('5h');
    expect(useWizardStore.getState().enabledCells.has('5h')).toBe(false);
  });

  it('replaces the Set instance on toggle (immutability for React)', () => {
    const before = useWizardStore.getState().enabledCells;
    useWizardStore.getState().toggleCell('today');
    const after = useWizardStore.getState().enabledCells;
    expect(after).not.toBe(before);
  });

  it('sets breakpoint, clamped to [80, 160]', () => {
    useWizardStore.getState().setBreakpoint(50);
    expect(useWizardStore.getState().breakpoint).toBe(80);
    useWizardStore.getState().setBreakpoint(200);
    expect(useWizardStore.getState().breakpoint).toBe(160);
    useWizardStore.getState().setBreakpoint(120);
    expect(useWizardStore.getState().breakpoint).toBe(120);
  });

  it('exposes a sessionMock with non-zero starting cost', () => {
    const { sessionMock } = useWizardStore.getState();
    expect(sessionMock.cost).toBeGreaterThan(0);
    expect(sessionMock.burnRatePerHour).toBeGreaterThan(0);
    expect(sessionMock.contextPct).toBeGreaterThanOrEqual(0);
    expect(sessionMock.contextPct).toBeLessThanOrEqual(100);
  });

  it('resets to defaults', () => {
    useWizardStore.getState().toggleCell('5h');
    useWizardStore.getState().setBreakpoint(150);
    useWizardStore.getState().reset();
    expect(useWizardStore.getState().enabledCells.has('5h')).toBe(true);
    expect(useWizardStore.getState().breakpoint).toBe(113);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/store.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `site/src/lib/store.ts`**

```typescript
import { create } from 'zustand';
import type { CellKey, SessionMock } from '@/types';

const MIN_BREAKPOINT = 80;
const MAX_BREAKPOINT = 160;

const DEFAULT_ENABLED: ReadonlyArray<CellKey> = ['5h', '7d', 'session', 'ctxbar'];
const DEFAULT_BREAKPOINT = 113;

const DEFAULT_SESSION_MOCK: SessionMock = {
  cost: 0.42,
  burnRatePerHour: 1.4,
  contextPct: 36,
  quota5hUsedPct: 28,
  quota7dUsedPct: 64,
  durationSec: 18 * 60,
};

export interface WizardStore {
  enabledCells: Set<CellKey>;
  breakpoint: number;
  sessionMock: SessionMock;

  toggleCell: (key: CellKey) => void;
  setBreakpoint: (n: number) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  enabledCells: new Set(DEFAULT_ENABLED),
  breakpoint: DEFAULT_BREAKPOINT,
  sessionMock: { ...DEFAULT_SESSION_MOCK },

  toggleCell: (key) =>
    set((state) => {
      const next = new Set(state.enabledCells);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { enabledCells: next };
    }),

  setBreakpoint: (n) =>
    set({
      breakpoint: Math.max(
        MIN_BREAKPOINT,
        Math.min(MAX_BREAKPOINT, Math.round(n)),
      ),
    }),

  reset: () =>
    set({
      enabledCells: new Set(DEFAULT_ENABLED),
      breakpoint: DEFAULT_BREAKPOINT,
      sessionMock: { ...DEFAULT_SESSION_MOCK },
    }),
}));
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npx vitest run src/lib/store.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/lib/store.ts site/src/lib/store.test.ts
git commit -m "site(lib): add zustand wizard store with toggle/breakpoint/reset actions"
```

---

### Task 13: Wire store into placeholder App and verify end-to-end

**Files:**
- Modify: `site/src/App.tsx`

This is the smoke test for the whole foundation: the store is reactive in the actual UI, the layout updates on toggle, the JSON is correct, builds run clean.

- [ ] **Step 1: Replace `site/src/App.tsx`**

```typescript
import { CELL_KEYS } from '@/types';
import { buildConfig, serializeConfig } from '@/lib/config-builder';
import { useWizardStore } from '@/lib/store';

export default function App() {
  const enabledCells = useWizardStore((s) => s.enabledCells);
  const breakpoint = useWizardStore((s) => s.breakpoint);
  const toggleCell = useWizardStore((s) => s.toggleCell);
  const setBreakpoint = useWizardStore((s) => s.setBreakpoint);
  const reset = useWizardStore((s) => s.reset);

  const config = buildConfig(enabledCells, breakpoint);
  const json = serializeConfig(config);

  return (
    <main className="min-h-screen p-8 font-mono">
      <header className="mb-8">
        <h1 className="font-display text-4xl">ccwatch site — Plan 1 smoke test</h1>
        <p className="mt-2 text-amber-dim">
          Click a cell to toggle. Slide breakpoint. JSON updates live.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-2 max-w-md">
        {CELL_KEYS.map((key) => {
          const on = enabledCells.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleCell(key)}
              className={`border px-3 py-2 text-left transition ${
                on
                  ? 'border-amber-primary bg-amber-primary/10'
                  : 'border-amber-dim/50 opacity-60'
              }`}
            >
              [{on ? 'x' : ' '}] {key}
            </button>
          );
        })}
      </section>

      <section className="mb-6 max-w-md">
        <label className="block mb-2 text-sm">
          Compact breakpoint: <span className="text-amber-cream">{breakpoint}</span> cols
        </label>
        <input
          type="range"
          min="80"
          max="160"
          value={breakpoint}
          onChange={(e) => setBreakpoint(Number(e.target.value))}
          className="w-full accent-amber-primary"
        />
      </section>

      <section className="mb-6">
        <button
          onClick={reset}
          className="border border-amber-glow px-4 py-2 hover:bg-amber-glow/20"
        >
          reset
        </button>
      </section>

      <section>
        <h2 className="mb-2 text-amber-cream">config.json</h2>
        <pre className="border border-amber-dim/30 bg-black/40 p-4 text-sm overflow-x-auto">
          {json}
        </pre>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run typecheck
```

Expected: clean.

- [ ] **Step 3: Run all tests**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm test
```

Expected: all tests across `pricing-data`, `statusline-mock`, `config-builder`, `store` PASS. Test count ≥ 25.

- [ ] **Step 4: Run dev server, manually verify**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && timeout 10 npm run dev 2>&1 | head -5
```

Expected: server starts, no errors.

Open `http://localhost:5173` in a browser. Verify:
- 8 cell buttons render, 4 are pre-selected (5h, 7d, session, ctxbar)
- Clicking a button toggles its visual state
- The JSON below updates on each toggle
- Breakpoint slider changes the JSON's `compactBreakpoint`
- Reset returns to defaults

- [ ] **Step 5: Run build**

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run build
```

Expected: `dist/` produced. Bundle size sanity-check — should be well under 100KB gzipped at this stage (no R3F yet).

Run:
```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && du -sh dist/assets/*.js dist/assets/*.css
```

Expected: numbers visible, no surprise bloat.

- [ ] **Step 6: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/src/App.tsx
git commit -m "site: wire zustand store into App; smoke-test toggle/breakpoint/JSON output"
```

---

## Phase 1 — Done. Verification Checklist

- [ ] `cd site && npm run typecheck` exits clean
- [ ] `cd site && npm test` runs ≥ 25 unit tests, all pass
- [ ] `cd site && npm run dev` serves a working interactive page at :5173
- [ ] `cd site && npm run build` produces `dist/`
- [ ] Toggling cells in the browser updates the JSON live
- [ ] Breakpoint slider works (80-160)
- [ ] Reset button returns to default state
- [ ] No imports from `../src/` (parent ccwatch CLI) anywhere in `site/src/`
  - Verify: `cd site && grep -r "../../src" src/ || echo "clean"`
- [ ] Final commit on main branch

---

## What Plan 2 Will Cover (preview, not in scope here)

- 21st.dev-pattern UI primitives (`NeonButton`, `GlitchText`, `TerminalCursor`, `CellCheckbox`)
- `<StatuslineMock>` HTML/Tailwind component (the 2D twin of the 3D CRT screen)
- 6 sections (`Hero`, `Demo`, `WhyFast`, `Accurate`, `Install`, `Footer`) — the Hero will show a placeholder image until Plan 3 adds the 3D CRT
- Font loading (JetBrains Mono + Geist)
- The full 2D site is deployable to Cloudflare Pages at the end of Plan 2 — useful as a fallback even if 3D never lands

## What Plan 3 Will Cover

- R3F dependencies install
- `CRTScene`, `CRTMonitor`, `CRTScreen`, `DustParticles`, `PostFX`
- Render-to-CRT integration: `<CRTScreen>` reads same zustand store as `<StatuslineMock>`, both update on wizard interaction
- Performance auto-degrade via drei `<PerformanceMonitor>`
- WebGL fallback to static image

## What Plan 4 Will Cover

- Playwright visual smoke tests (9 screenshots)
- GitHub Actions CI (typecheck + test + build gate)
- Cloudflare Pages connection + custom domain notes
- Bundle size budget enforcement
- Final README + spec status update

---

## Self-Review Notes

**Spec coverage check** (Plan 1 vs spec sections):
- Spec §3 "Decisions Locked" — tech stack, repo location, hosting all reflected ✓
- Spec §4.1 "Tech Stack" — Vite + React + TS + Tailwind v4 + zustand all here; Vitest added; R3F deferred to Plan 3 (correct) ✓
- Spec §4.2 "Color Palette" — Tailwind `@theme` tokens added in Task 5 ✓
- Spec §4.3 "File Structure" — only `lib/`, `types.ts`, `App.tsx`, `main.tsx`, `styles/global.css` in this plan; rest deferred ✓
- Spec §5.4 "Config Output" — `serializeConfig` matches the example shape ✓
- Spec §13 "Acceptance Criteria" — none of the user-facing criteria can be checked yet (no real sections, no 3D, no deploy) — correct, they belong to later plans ✓

**Placeholder scan:** No "TBD" / "TODO" / "fill in later" in the plan. Every code step shows actual code. ✓

**Type consistency:** `CellKey`, `Config`, `ModelRates`, `SessionMock`, `WizardStore` defined in `types.ts` (Task 8) and used consistently in Tasks 9-13. `MIN_BREAKPOINT`/`MAX_BREAKPOINT` constants appear in both `config-builder.ts` and `store.ts` — same values (80/160). ✓

**Forward references:** `enabledCells: Set<CellKey>` in store — `Set` semantics match `computeLayout`'s expectations. `buildConfig`'s `breakpoint` param is `number` (not clamped at call site, clamped inside) — store's `setBreakpoint` ALSO clamps. Defense-in-depth, no contradiction. ✓
