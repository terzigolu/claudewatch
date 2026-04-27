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
