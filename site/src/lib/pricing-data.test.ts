import { describe, expect, it } from 'vitest';
import { MODEL_RATES, costFor, getRates } from './pricing-data';

describe('MODEL_RATES', () => {
  it('has Opus rates', () => {
    expect(MODEL_RATES.opus).toEqual({
      inputPerM: 15,
      outputPerM: 75,
      cacheReadPerM: 1.5,
    });
  });

  it('has Sonnet rates', () => {
    expect(MODEL_RATES.sonnet).toEqual({
      inputPerM: 3,
      outputPerM: 15,
      cacheReadPerM: 0.3,
    });
  });

  it('has Haiku rates', () => {
    expect(MODEL_RATES.haiku).toEqual({
      inputPerM: 0.8,
      outputPerM: 4,
      cacheReadPerM: 0.08,
    });
  });

  it('cache read is 10% of input rate for all models', () => {
    for (const id of ['opus', 'sonnet', 'haiku'] as const) {
      const rates = MODEL_RATES[id];
      expect(rates.cacheReadPerM).toBeCloseTo(rates.inputPerM * 0.1, 5);
    }
  });
});

describe('getRates', () => {
  it('returns rates by model id', () => {
    expect(getRates('opus').outputPerM).toBe(75);
  });
});

describe('costFor', () => {
  it('computes cost for input tokens', () => {
    // 1 million Opus input tokens = $15
    expect(costFor('opus', { input: 1_000_000, output: 0, cacheRead: 0 })).toBeCloseTo(15, 4);
  });

  it('computes cost for output tokens', () => {
    // 1M Opus output = $75
    expect(costFor('opus', { input: 0, output: 1_000_000, cacheRead: 0 })).toBeCloseTo(75, 4);
  });

  it('computes cost for cache reads', () => {
    // 1M Opus cache reads = $1.50
    expect(costFor('opus', { input: 0, output: 0, cacheRead: 1_000_000 })).toBeCloseTo(1.5, 4);
  });

  it('sums all three components', () => {
    // 100k input + 50k output + 200k cache reads on Sonnet
    // = (0.1 * 3) + (0.05 * 15) + (0.2 * 0.3)
    // = 0.3 + 0.75 + 0.06 = 1.11
    expect(costFor('sonnet', { input: 100_000, output: 50_000, cacheRead: 200_000 })).toBeCloseTo(1.11, 4);
  });

  it('returns zero for zero usage', () => {
    expect(costFor('haiku', { input: 0, output: 0, cacheRead: 0 })).toBe(0);
  });
});
