import type { ModelId, ModelRates } from '@/types';

/**
 * Per-model token rates in USD per million tokens.
 * Cache read rate is 10% of input rate (Anthropic pricing convention).
 *
 * Manually kept in sync with ccwatch's src/pricing.ts.
 */
export const MODEL_RATES: Record<ModelId, ModelRates> = {
  opus: { inputPerM: 15, outputPerM: 75, cacheReadPerM: 1.5 },
  sonnet: { inputPerM: 3, outputPerM: 15, cacheReadPerM: 0.3 },
  haiku: { inputPerM: 0.8, outputPerM: 4, cacheReadPerM: 0.08 },
};

export function getRates(model: ModelId): ModelRates {
  return MODEL_RATES[model];
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
}

/**
 * Compute USD cost for a given token usage on a given model.
 * Returns dollars (e.g. 1.11 = $1.11).
 */
export function costFor(model: ModelId, usage: TokenUsage): number {
  const rates = getRates(model);
  return (
    (usage.input / 1_000_000) * rates.inputPerM +
    (usage.output / 1_000_000) * rates.outputPerM +
    (usage.cacheRead / 1_000_000) * rates.cacheReadPerM
  );
}
