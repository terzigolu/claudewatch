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
    <section className="border-t border-amber-dim/20 px-4 sm:px-6 lg:px-8 py-16 lg:py-20 bg-black/30">
      <div className="section-divider">
        <span className="section-locator">
          <span className="sl-mark">§</span>
          <span>04</span>
          <span className="sl-divider">/</span>
          <span>pricing.dat</span>
        </span>
      </div>
      <h2 className="font-display text-3xl sm:text-4xl leading-tight">
        Opus output is <span className="text-amber-glow">19×</span> more expensive than Haiku.
      </h2>
      <p className="mt-3 font-mono text-amber-cream/85">
        <span className="text-amber-dim">›</span> Most tools estimate. We don&apos;t.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Pricing table — wrapped with corner brackets */}
        <div className="cb overflow-x-auto border border-amber-dim/30 bg-black/40">
          <span className="cb-bl" aria-hidden="true" />
          <span className="cb-br" aria-hidden="true" />
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
            <span className="text-amber-glow">┌</span> Same 100k in + 100k out <span className="text-amber-glow">┐</span>
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
