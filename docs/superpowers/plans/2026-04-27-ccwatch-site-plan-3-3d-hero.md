# ccwatch Site — Plan 3: 3D CRT Hero

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hero's placeholder with a live 3D CRT monitor that displays the same statusline state the wizard controls. The CRT shows native R3F primitives (drei `<Text>` + meshes) that read the zustand store — toggling a cell in Demo updates both the HTML preview AND the 3D screen in the same frame. Includes WebGL fallback, performance auto-degrade, and reduced-motion handling.

**Architecture:** Lazy-load `<CRTScene />` via `React.lazy` so the initial bundle stays at ~52KB gzipped — 3D code (~130KB gz) loads only when the hero mounts. Native R3F primitives (NOT html2canvas, NOT drei `<Html>`) render the statusline content so it inherits all post-processing passes. Single zustand store remains the source of truth.

**Tech Stack:** Plan 2 stack + `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `@types/three`. ~130KB gzipped extra after code-splitting.

**Predecessor:** Plan 2 fully landed on `feat/site` (latest commit: `eebcc49`). Hero currently shows `[ 3D CRT — Plan 3 ]` placeholder div — Plan 3 swaps it.

---

## File Structure

```
/site/
├── package.json                          # MODIFY: add R3F deps
└── src/
    ├── components/
    │   ├── three/                        # NEW directory
    │   │   ├── CRTScene.tsx              # <Canvas> + Suspense + lighting + post-fx wrapper
    │   │   ├── CRTMonitor.tsx            # 3D mesh: bezel + curved glass + screen plane
    │   │   ├── CRTScreen.tsx             # native R3F primitives reading zustand store
    │   │   ├── DustParticles.tsx         # ambient floating dust (perf-degradable)
    │   │   └── PostFX.tsx                # EffectComposer chain
    │   └── sections/
    │       └── Hero.tsx                  # MODIFY: lazy-import CRTScene with WebGL fallback
    └── lib/
        └── webgl.ts                      # NEW: tiny WebGL availability check
```

**End state:** Hero displays a slowly rotating amber CRT with the statusline rendered on its curved screen. Toggling cells in Demo updates both 2D preview AND 3D screen. Ambient dust particles drift. Bloom + scanline + vignette post-processing. On mobile or no-WebGL, falls back to static placeholder — no broken state. Bundle: ~180KB gzipped JS total (with R3F lazy-loaded).

---

## Phase A — Dependencies (Task 1)

### Task 1: Install R3F dependencies

- [ ] **Step 1: Install**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site
npm install three@^0.169.0 @react-three/fiber@^8.17.10 @react-three/drei@^9.114.0 @react-three/postprocessing@^2.16.3
npm install --save-dev @types/three@^0.169.0
```

Expected: 4 runtime deps + 1 dev dep added. `node_modules/three`, `node_modules/@react-three/*` exist.

- [ ] **Step 2: Verify install**

```bash
ls node_modules/three node_modules/@react-three/fiber node_modules/@react-three/drei | head -3
```

- [ ] **Step 3: Run typecheck (still clean — no usage yet)**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run typecheck
```

Expected: clean exit.

- [ ] **Step 4: Commit**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch
git add site/package.json site/package-lock.json
git commit -m "site(deps): install three + R3F + drei + postprocessing for 3D hero"
```

---

## Phase B — 3D Building Blocks (Tasks 2-5)

### Task 2: `lib/webgl.ts` — WebGL availability check

**File:** `site/src/lib/webgl.ts`

```typescript
/**
 * Detect WebGL availability without instantiating a Three.js context.
 * Used by Hero to decide whether to mount <CRTScene /> or static fallback.
 */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

/**
 * Detect prefers-reduced-motion at module import time.
 * Returns false on SSR / missing matchMedia.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

Commit: `site(lib): add webgl/reduced-motion availability checks`.

---

### Task 3: `CRTMonitor.tsx` — the 3D mesh

**File:** `site/src/components/three/CRTMonitor.tsx`

Renders the physical CRT shape: outer bezel, slightly curved glass screen, base. The screen plane is positioned so `<CRTScreen />` content (Task 6) sits flush against it.

```typescript
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { CRTScreen } from './CRTScreen';

interface Props {
  rotate?: boolean;
}

/**
 * Vintage CRT monitor 3D model. Built from primitives — no GLB asset to load.
 * Bezel: BoxGeometry, slightly larger than screen.
 * Glass: SphereGeometry segment (curved screen).
 * Screen content: <CRTScreen /> rendered as native R3F primitives.
 *
 * On `rotate`, the whole group slowly oscillates ~5 degrees on Y axis.
 */
export function CRTMonitor({ rotate = true }: Props) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (rotate && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer bezel — dark plastic */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[4.2, 3.2, 0.4]} />
        <meshStandardMaterial color="#0a0606" roughness={0.7} />
      </mesh>

      {/* Inner bezel — slight gradient */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[3.9, 2.9, 0.2]} />
        <meshStandardMaterial color="#1a0f00" roughness={0.5} />
      </mesh>

      {/* Curved glass — using sphere segment, projected to look slightly bulged */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[8, 32, 32, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.16]} />
        <meshPhysicalMaterial
          color="#000"
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      {/* Screen content — flat plane behind glass */}
      <group position={[0, 0, 0.02]}>
        <mesh>
          <planeGeometry args={[3.5, 2.5]} />
          <meshBasicMaterial color="#1a0f00" />
        </mesh>
        <CRTScreen />
      </group>

      {/* Stand */}
      <mesh position={[0, -1.85, -0.1]}>
        <boxGeometry args={[1.2, 0.3, 1]} />
        <meshStandardMaterial color="#0a0606" roughness={0.8} />
      </mesh>
    </group>
  );
}
```

Commit: `site(three): add CRTMonitor 3D mesh (bezel + curved glass + stand)`.

---

### Task 4: `CRTScreen.tsx` — native R3F primitives that read store

This is the core integration point. The same zustand state that drives `<StatuslineMock>` (HTML, in Demo section) drives this 3D rendering. Toggling a cell updates both in the same React tick.

**File:** `site/src/components/three/CRTScreen.tsx`

```typescript
import { Text } from '@react-three/drei';
import { useWizardStore } from '@/lib/store';
import { computeLayout } from '@/lib/statusline-mock';
import type { CellKey, SessionMock } from '@/types';

const AMBER = '#ffb000';
const AMBER_DIM = '#806000';
const AMBER_CREAM = '#fff8e1';

/**
 * Native R3F rendering of the statusline content for the CRT screen plane.
 * Shares zustand state with <StatuslineMock /> (HTML twin in Demo section).
 *
 * Layout: rows stacked vertically, cells horizontally within each row.
 * Origin (0,0,0) is screen center; we offset everything from there.
 *
 * Inherits all post-processing (bloom, scanline, vignette) from <PostFX />.
 */
export function CRTScreen() {
  const enabledCells = useWizardStore((s) => s.enabledCells);
  const breakpoint = useWizardStore((s) => s.breakpoint);
  const sessionMock = useWizardStore((s) => s.sessionMock);

  const rows = computeLayout(enabledCells, breakpoint + 1, breakpoint);

  if (rows.length === 0) {
    return (
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.15}
        color={AMBER_DIM}
        anchorX="center"
        anchorY="middle"
      >
        no cells enabled
      </Text>
    );
  }

  // Layout math: 2.5 units total height, distribute rows vertically
  const rowHeight = 0.45;
  const totalHeight = rows.length * rowHeight;
  const startY = totalHeight / 2 - rowHeight / 2;

  return (
    <group>
      {rows.map((row, rowIdx) => {
        const y = startY - rowIdx * rowHeight;
        // Cells horizontal: distribute across 3 units width
        const cellWidth = 3 / row.length;
        const startX = -1.5 + cellWidth / 2;
        return (
          <group key={rowIdx} position={[0, y, 0]}>
            {row.map((cellKey, cellIdx) => {
              const x = startX + cellIdx * cellWidth;
              return (
                <CellGroup
                  key={cellKey}
                  cellKey={cellKey}
                  session={sessionMock}
                  position={[x, 0, 0]}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

interface CellGroupProps {
  cellKey: CellKey;
  session: SessionMock;
  position: [number, number, number];
}

function CellGroup({ cellKey, session, position }: CellGroupProps) {
  switch (cellKey) {
    case '5h':
      return <BarGroup label="5h" pct={session.quota5hUsedPct} suffix="2h 14m" position={position} />;
    case '7d':
      return <BarGroup label="7d" pct={session.quota7dUsedPct} suffix="3d 02h" position={position} />;
    case 'ctxbar':
      return <BarGroup label="ctx" pct={session.contextPct} suffix={`${session.contextPct}%`} position={position} />;
    case 'session':
      return (
        <CellGroupText
          label="session"
          value={`$${session.cost.toFixed(2)} · $${session.burnRatePerHour.toFixed(2)}/h`}
          position={position}
        />
      );
    case 'today':
      return <CellGroupText label="today" value={`$${session.cost.toFixed(2)}`} position={position} />;
    case 'history':
      return <CellGroupText label="week" value="$12.40" position={position} />;
    case 'total':
      return <CellGroupText label="total" value="$248.55" position={position} />;
    case 'model':
      return <CellGroupText label={`${session.contextPct}%`} value="sonnet-4-6" position={position} />;
  }
}

function CellGroupText({
  label,
  value,
  position,
}: {
  label: string;
  value: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <Text
        position={[0, 0.1, 0.01]}
        fontSize={0.08}
        color={AMBER_DIM}
        anchorX="center"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      <Text
        position={[0, -0.05, 0.01]}
        fontSize={0.13}
        color={AMBER}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
}

function BarGroup({
  label,
  pct,
  suffix,
  position,
}: {
  label: string;
  pct: number;
  suffix: string;
  position: [number, number, number];
}) {
  const barColor = pct < 50 ? AMBER : pct < 80 ? '#ff6700' : '#ff3030';
  const fillWidth = (Math.min(100, Math.max(0, pct)) / 100) * 1.0;
  return (
    <group position={position}>
      {/* Label */}
      <Text
        position={[-0.5, 0.12, 0.01]}
        fontSize={0.08}
        color={AMBER_DIM}
        anchorX="left"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      {/* Suffix (right side) */}
      <Text
        position={[0.5, 0.12, 0.01]}
        fontSize={0.08}
        color={AMBER_CREAM}
        anchorX="right"
        anchorY="middle"
      >
        {suffix}
      </Text>
      {/* Bar background */}
      <mesh position={[0, -0.05, 0.01]}>
        <planeGeometry args={[1.0, 0.06]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* Bar fill (left-aligned) */}
      <mesh position={[-0.5 + fillWidth / 2, -0.05, 0.02]}>
        <planeGeometry args={[fillWidth, 0.05]} />
        <meshBasicMaterial color={barColor} toneMapped={false} />
      </mesh>
    </group>
  );
}
```

Commit: `site(three): add CRTScreen — native R3F text+mesh primitives reading zustand`.

---

### Task 5: `DustParticles.tsx` — ambient floating dust

**File:** `site/src/components/three/DustParticles.tsx`

```typescript
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as ThreePoints } from 'three';

interface Props {
  count?: number;
}

/**
 * Ambient floating dust — small amber points in front of the CRT.
 * Density auto-degrades via Plan 3 Task 7's PerformanceMonitor.
 */
export function DustParticles({ count = 200 }: Props) {
  const ref = useRef<ThreePoints>(null);

  // Pre-compute random positions in a 5x4x3 box around the CRT
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 5; // x
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4; // y
      arr[i * 3 + 2] = Math.random() * 3 + 0.5;   // z (in front of CRT)
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      // Slow horizontal drift, gentle vertical bob
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        size={0.015}
        color="#ffb000"
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </Points>
  );
}
```

Commit: `site(three): add DustParticles ambient amber dot field`.

---

### Task 6: `PostFX.tsx` — bloom + scanline + vignette + glitch

**File:** `site/src/components/three/PostFX.tsx`

```typescript
import { EffectComposer, Bloom, Vignette, Scanline, Glitch } from '@react-three/postprocessing';
import { GlitchMode, BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

interface Props {
  reduced?: boolean;
}

/**
 * Post-processing chain. Bloom + scanline + vignette always on (subtle).
 * Glitch only fires occasionally, and is suppressed under reduced-motion.
 */
export function PostFX({ reduced = false }: Props) {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Scanline density={1.25} opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.3} darkness={0.7} />
      {!reduced && (
        <Glitch
          delay={new Vector2(8, 14)}
          duration={new Vector2(0.15, 0.3)}
          strength={new Vector2(0.05, 0.1)}
          mode={GlitchMode.SPORADIC}
          ratio={0.3}
        />
      )}
    </EffectComposer>
  );
}
```

Commit: `site(three): add PostFX — bloom+scanline+vignette+sporadic glitch`.

---

## Phase C — Scene Composition + Performance (Tasks 7-8)

### Task 7: `CRTScene.tsx` — Canvas wrapper with lights + perf monitor

**File:** `site/src/components/three/CRTScene.tsx`

```typescript
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { CRTMonitor } from './CRTMonitor';
import { DustParticles } from './DustParticles';
import { PostFX } from './PostFX';
import { prefersReducedMotion } from '@/lib/webgl';

export function CRTScene() {
  const [degraded, setDegraded] = useState(false);
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 38 }}
      dpr={degraded ? 1 : Math.min(window.devicePixelRatio, 2)}
      gl={{ antialias: !degraded, alpha: false }}
      style={{ background: '#0a0606' }}
    >
      <PerformanceMonitor
        onDecline={() => setDegraded(true)}
        flipflops={2}
        bounds={() => [25, 60]}
      />

      {/* Lighting — single warm amber rim + ambient */}
      <ambientLight intensity={0.15} color="#1a0f00" />
      <pointLight position={[2, 2, 4]} intensity={1.2} color="#ffb000" />
      <pointLight position={[-3, -1, 2]} intensity={0.3} color="#ff6700" />

      <Suspense fallback={null}>
        <CRTMonitor rotate={!reduced} />
        {!degraded && <DustParticles count={reduced ? 0 : 200} />}
      </Suspense>

      {!degraded && <PostFX reduced={reduced} />}
    </Canvas>
  );
}

export default CRTScene;
```

Commit: `site(three): add CRTScene — Canvas wrapper with lights + perf-monitor degrade`.

---

### Task 8: Replace Hero placeholder with lazy-loaded CRTScene

**File:** `site/src/components/sections/Hero.tsx` (REPLACE)

```typescript
import { Suspense, lazy, useEffect, useState } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlitchText } from '@/components/ui/GlitchText';
import { TerminalCursor } from '@/components/ui/TerminalCursor';
import { hasWebGL } from '@/lib/webgl';

// Code-split: 3D bundle loads only when Hero mounts
const CRTScene = lazy(() => import('@/components/three/CRTScene'));

function ScenePlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-amber-dim">
        <div className="font-mono text-xs uppercase tracking-widest">{message}</div>
        <div className="mt-2 text-amber-primary/40">▢</div>
      </div>
    </div>
  );
}

export function Hero() {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  return (
    <section className="px-8 pt-16 pb-20">
      <div className="grid gap-12 lg:grid-cols-[55%_45%]">
        {/* Left: 3D CRT scene with WebGL fallback + lazy boundary */}
        <div className="aspect-[4/3] border border-amber-dim/40 bg-gradient-to-br from-amber-bg to-black/80 overflow-hidden">
          {webglOk === null ? (
            <ScenePlaceholder message="[ initializing ]" />
          ) : webglOk ? (
            <Suspense fallback={<ScenePlaceholder message="[ loading 3D ]" />}>
              <CRTScene />
            </Suspense>
          ) : (
            <ScenePlaceholder message="[ no WebGL — static mode ]" />
          )}
        </div>

        {/* Right: copy + CTAs (unchanged from Plan 2) */}
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

Commit: `site(sections): replace Hero placeholder with lazy-loaded 3D CRT scene`.

---

## Phase D — Verification (Task 9)

### Task 9: Final build + bundle audit + manual smoke

- [ ] **Step 1: Typecheck + tests**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run typecheck && npm test
```

Expected: clean typecheck. 36 tests pass (no test changes). New files have no tests (3D rendering correctness is visual, not unit-testable).

- [ ] **Step 2: Build**

```bash
cd /Users/yajinn/Desktop/Projects/ccwatch/site && npm run build
```

Expected: clean build. Bundle now produces multiple chunks:
- `index-*.js` (main app, ~52KB gzipped — unchanged)
- `CRTScene-*.js` (3D bundle, ~120-140KB gzipped — lazy chunk)
- CSS unchanged

Total gzipped JS across all chunks should be < 200KB.

- [ ] **Step 3: Manual smoke test**

```bash
cd site && timeout 20 npm run dev 2>&1 | head -5
```

Open `http://localhost:5173/`. Verify:
- Hero shows brief "loading 3D" then 3D CRT appears
- CRT slowly oscillates ~5° on Y axis (gentle rotation)
- Toggle cells in Demo section → CRT screen content updates LIVE
- Toggle ALL cells off → CRT shows "no cells enabled"
- Bloom glow visible around amber text
- Subtle scanline texture
- Occasional glitch flash (every 8-14 seconds)
- No console errors (right-click → Inspect → Console)

If any of these fails, report DONE_WITH_CONCERNS with screenshots/video.

- [ ] **Step 4: Performance check**

In Chrome DevTools → Performance tab → Record while site loads. Verify:
- Hero 3D scene reaches 60fps within 2s
- No frame longer than 50ms
- LCP (Largest Contentful Paint) < 2.5s

If FPS < 30 sustained, the PerformanceMonitor should auto-degrade. Verify by toggling Network throttle → Slow 3G + CPU → 4× slowdown → reload.

- [ ] **Step 5: Final commit (if any tweaks needed)**

If everything works first try, no final commit needed beyond Task 8's. Otherwise tweak and:

```bash
git commit -am "site(three): polish 3D scene per smoke test feedback"
```

---

## Acceptance Checklist

- [ ] All 9 tasks committed
- [ ] `npm run typecheck` clean
- [ ] `npm test` — 36 tests pass
- [ ] `npm run build` clean
- [ ] Bundle: main < 60KB gz, CRTScene chunk < 150KB gz, total < 200KB gz
- [ ] CRT renders in browser
- [ ] Toggle cells in Demo → CRT updates live (the "render-to-CRT" promise)
- [ ] WebGL fallback verified by disabling WebGL in DevTools (`chrome://flags` → WebGL → Disabled, restart)
- [ ] `prefers-reduced-motion: reduce` (DevTools → Rendering → emulate) → CRT static, no glitch, no dust
- [ ] No console errors

---

## Risks & Watch-Outs

1. **R3F + Tailwind v4 build interaction:** `@theme` token CSS variables may not be available inside R3F materials. Mitigation: hardcode hex strings in `CRTScreen.tsx` (`#ffb000`, etc) — they're already extracted as constants at the top.

2. **Bundle size creep:** If R3F/drei imports pull more than expected, audit with `vite-bundle-visualizer`. Tree-shake any unused drei components (we use only `Text`, `Points`, `PointMaterial`, `PerformanceMonitor`).

3. **`useFrame` and React StrictMode double-invoke:** `useFrame` callbacks should be idempotent. Our oscillation (`Math.sin(time * 0.3)`) is — same input → same output. Safe.

4. **Suspense boundary inside Canvas:** `<Suspense fallback={null}>` inside `<Canvas>` is required because drei `<Text>` lazy-loads font glyphs. `null` fallback means the CRT is briefly invisible (~100ms) on first render — acceptable.

5. **Mobile performance:** PerformanceMonitor's `bounds={() => [25, 60]}` means below 25fps for 2 consecutive intervals → degrade. With degraded state, dust particles disappear, antialias off, dpr=1, post-fx removed. Sufficient for iPhone 12+.

---

## What Plan 4 Will Cover

- Open Graph + Twitter Card meta tags
- Canonical URL
- `og-image.png` (1200x630, hero screenshot)
- Playwright visual smoke (9 screenshots)
- GitHub Actions CI (typecheck + test + build gate)
- Cloudflare Pages connection setup
- Bundle size budget enforcement
