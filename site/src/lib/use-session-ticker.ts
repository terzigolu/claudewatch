import { useEffect } from 'react';
import { useWizardStore } from './store';
import { prefersReducedMotion } from './webgl';

const CYCLE_MS = 30_000; // full session cycle length
const TICK_MS = 200; // 5 fps update rate

/**
 * Drives sessionMock values forward — cost grows, quota fills, context fills.
 * At cycle end, values snap back to baseline (modulo wrap).
 *
 * Updates zustand store; both Demo's <StatuslineMock> and Hero's 3D <CRTScreen>
 * subscribe to sessionMock and re-render.
 *
 * Suppressed under prefers-reduced-motion (a11y).
 */
export function useSessionTicker() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - start) % CYCLE_MS;
      const progress = elapsed / CYCLE_MS;

      useWizardStore.setState({
        sessionMock: {
          cost: 0.42 + progress * 8,
          burnRatePerHour: 1.4 + progress * 0.6,
          contextPct: Math.round(36 + progress * 64),
          quota5hUsedPct: Math.round(28 + progress * 60),
          quota7dUsedPct: Math.round(64 + progress * 30),
          durationSec: 18 * 60 + Math.floor(progress * 30 * 60),
        },
      });
    }, TICK_MS);

    return () => {
      clearInterval(interval);
    };
  }, []);
}
