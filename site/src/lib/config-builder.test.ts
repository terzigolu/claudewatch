import { describe, expect, it } from 'vitest';
import { buildConfig, serializeConfig } from './config-builder';
import type { CellKey } from '@/types';

describe('buildConfig', () => {
  it('produces empty rows when no cells enabled', () => {
    const cfg = buildConfig(new Set(), 113);
    expect(cfg.rows).toEqual([]);
    expect(cfg.compactRows).toEqual([]);
    expect(cfg.compactBreakpoint).toBe(113);
    expect(cfg.columns).toBeNull();
  });

  it('produces wide and compact layouts from same cell set', () => {
    const enabled = new Set<CellKey>(['5h', '7d', 'session', 'ctxbar']);
    const cfg = buildConfig(enabled, 113);
    expect(cfg.rows).toEqual([
      ['5h', '7d'],
      ['session', 'ctxbar'],
    ]);
    expect(cfg.compactRows).toEqual([['5h'], ['7d'], ['session'], ['ctxbar']]);
  });

  it('respects custom breakpoint in produced config', () => {
    const enabled = new Set<CellKey>(['5h']);
    expect(buildConfig(enabled, 90).compactBreakpoint).toBe(90);
  });

  it('clamps breakpoint to [80, 160]', () => {
    expect(buildConfig(new Set(['5h']), 50).compactBreakpoint).toBe(80);
    expect(buildConfig(new Set(['5h']), 200).compactBreakpoint).toBe(160);
    expect(buildConfig(new Set(['5h']), 113).compactBreakpoint).toBe(113);
  });
});

describe('serializeConfig', () => {
  it('produces stable, pretty JSON', () => {
    const enabled = new Set<CellKey>(['5h', '7d']);
    const cfg = buildConfig(enabled, 113);
    const json = serializeConfig(cfg);
    expect(json).toBe(
      [
        '{',
        '  "rows": [',
        '    [',
        '      "5h",',
        '      "7d"',
        '    ]',
        '  ],',
        '  "compactRows": [',
        '    [',
        '      "5h"',
        '    ],',
        '    [',
        '      "7d"',
        '    ]',
        '  ],',
        '  "compactBreakpoint": 113,',
        '  "columns": null',
        '}',
      ].join('\n'),
    );
  });

  it('round-trips through JSON.parse', () => {
    const cfg = buildConfig(new Set<CellKey>(['session', 'ctxbar']), 113);
    const json = serializeConfig(cfg);
    const parsed = JSON.parse(json);
    expect(parsed.rows).toEqual(cfg.rows);
    expect(parsed.compactRows).toEqual(cfg.compactRows);
    expect(parsed.columns).toBeNull();
  });
});
