import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function GlitchText({ children, className = '' }: Props) {
  return <span className={`animate-glitch ${className}`}>{children}</span>;
}
