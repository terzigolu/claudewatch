/**
 * Shared numeric constants for the wizard and statusline layout calc.
 * Single source of truth — referenced by lib/, components/, and JSX min/max attrs.
 */
export const MIN_BREAKPOINT = 80;
export const MAX_BREAKPOINT = 160;
export const DEFAULT_BREAKPOINT = 113;

/**
 * The four cells enabled by default — matches ccwatch README example.
 */
export const DEFAULT_ENABLED_CELLS = ['5h', '7d', 'session', 'ctxbar'] as const;
