import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * Vintage CRT monitor body — CSS-only frame.
 * Wraps any content (3D Canvas, HTML, etc.) inside a recessed screen well
 * with phosphor glow, scanline overlay, glass reflection, power LED, and stand.
 */
export function CRTFrame({ children }: Props) {
  return (
    <div className="crt-wrapper">
      <div className="crt-body">
        <div className="crt-screen">
          <div className="crt-screen-content">{children}</div>
          <div className="crt-screen-glass" aria-hidden="true" />
          <div className="crt-screen-scanlines" aria-hidden="true" />
        </div>

        <div className="crt-bezel-controls">
          <div className="crt-led-group">
            <span className="crt-led" aria-hidden="true" />
            <span className="crt-led-label">power</span>
          </div>
          <span className="crt-brand">ccwatch v1.0.1</span>
        </div>
      </div>
      <div className="crt-stand" aria-hidden="true" />
      <div className="crt-stand-base" aria-hidden="true" />
    </div>
  );
}
