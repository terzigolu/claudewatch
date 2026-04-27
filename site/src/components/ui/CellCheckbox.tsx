import type { CellKey } from '@/types';

interface Props {
  cellKey: CellKey;
  enabled: boolean;
  label: string;
  onToggle: (key: CellKey) => void;
}

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
