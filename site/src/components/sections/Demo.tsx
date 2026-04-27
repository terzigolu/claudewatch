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
