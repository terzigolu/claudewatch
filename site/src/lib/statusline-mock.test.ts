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
