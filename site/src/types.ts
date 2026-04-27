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
