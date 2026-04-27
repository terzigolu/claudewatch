import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function NeonButton({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center gap-2 px-5 py-3 font-mono text-sm uppercase tracking-wider transition-all duration-200';

  const variants = {
    primary:
      'border border-amber-primary text-amber-primary bg-amber-primary/5 hover:bg-amber-primary/15 hover:shadow-[0_0_24px_rgba(255,176,0,0.4)]',
    ghost:
      'border border-amber-dim text-amber-dim hover:text-amber-primary hover:border-amber-primary',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
