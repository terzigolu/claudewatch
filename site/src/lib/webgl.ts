/**
 * Detect WebGL availability without instantiating a Three.js context.
 * Used by Hero to decide whether to mount <CRTScene /> or static fallback.
 */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

/**
 * Detect prefers-reduced-motion at module import time.
 * Returns false on SSR / missing matchMedia.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
