import { afterEach, describe, expect, it } from 'vitest';
import { useWizardStore } from './store';

const initial = useWizardStore.getState();
afterEach(() => {
  useWizardStore.setState(initial, true);
});

describe('useWizardStore', () => {
  it('starts with the README default cells enabled', () => {
    const { enabledCells } = useWizardStore.getState();
    expect(enabledCells.has('5h')).toBe(true);
    expect(enabledCells.has('7d')).toBe(true);
    expect(enabledCells.has('session')).toBe(true);
    expect(enabledCells.has('ctxbar')).toBe(true);
    expect(enabledCells.has('today')).toBe(false);
  });

  it('starts with breakpoint 113', () => {
    expect(useWizardStore.getState().breakpoint).toBe(113);
  });

  it('toggles a cell on', () => {
    useWizardStore.getState().toggleCell('today');
    expect(useWizardStore.getState().enabledCells.has('today')).toBe(true);
  });

  it('toggles a cell off', () => {
    useWizardStore.getState().toggleCell('5h');
    expect(useWizardStore.getState().enabledCells.has('5h')).toBe(false);
  });

  it('replaces the Set instance on toggle (immutability for React)', () => {
    const before = useWizardStore.getState().enabledCells;
    useWizardStore.getState().toggleCell('today');
    const after = useWizardStore.getState().enabledCells;
    expect(after).not.toBe(before);
  });

  it('sets breakpoint, clamped to [80, 160]', () => {
    useWizardStore.getState().setBreakpoint(50);
    expect(useWizardStore.getState().breakpoint).toBe(80);
    useWizardStore.getState().setBreakpoint(200);
    expect(useWizardStore.getState().breakpoint).toBe(160);
    useWizardStore.getState().setBreakpoint(120);
    expect(useWizardStore.getState().breakpoint).toBe(120);
  });

  it('exposes a sessionMock with non-zero starting cost', () => {
    const { sessionMock } = useWizardStore.getState();
    expect(sessionMock.cost).toBeGreaterThan(0);
    expect(sessionMock.burnRatePerHour).toBeGreaterThan(0);
    expect(sessionMock.contextPct).toBeGreaterThanOrEqual(0);
    expect(sessionMock.contextPct).toBeLessThanOrEqual(100);
  });

  it('resets to defaults', () => {
    useWizardStore.getState().toggleCell('5h');
    useWizardStore.getState().setBreakpoint(150);
    useWizardStore.getState().reset();
    expect(useWizardStore.getState().enabledCells.has('5h')).toBe(true);
    expect(useWizardStore.getState().breakpoint).toBe(113);
  });
});
