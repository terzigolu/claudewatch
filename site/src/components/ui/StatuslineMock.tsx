import { useWizardStore } from '@/lib/store';
import { computeLayout } from '@/lib/statusline-mock';
import type { CellKey, SessionMock } from '@/types';

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
      return <Bar label="ctxbar" pct={session.contextPct} countdown={`${session.contextPct}%`} />;
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
