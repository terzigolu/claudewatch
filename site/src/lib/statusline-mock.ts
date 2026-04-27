import { CELL_KEYS, type CellKey, type Config } from '@/types';
import { DEFAULT_BREAKPOINT } from '@/constants';

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
