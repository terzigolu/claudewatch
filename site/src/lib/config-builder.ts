import type { CellKey, Config } from '@/types';
import { computeLayout } from './statusline-mock';
import { MIN_BREAKPOINT, MAX_BREAKPOINT } from '@/constants';

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
