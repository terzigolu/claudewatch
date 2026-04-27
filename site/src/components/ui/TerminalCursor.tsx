interface Props {
  className?: string;
}

export function TerminalCursor({ className = '' }: Props) {
  return (
    <span
      className={`inline-block animate-terminal-blink text-amber-primary ${className}`}
      aria-hidden="true"
    >
      ▍
    </span>
  );
}
