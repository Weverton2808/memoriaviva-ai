interface Props {
  className?: string;
  /** Tamanho em pixels do ícone. */
  size?: number;
}

/**
 * Ícone da marca: uma bolha de conversa que guarda uma chama —
 * memória + conversa + conhecimento preservado.
 */
export function LogoIcone({ className, size = 40 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M24 5c10.5 0 19 7.2 19 16.1 0 8.9-8.5 16.1-19 16.1-1.7 0-3.4-.2-5-.6l-8.8 4.8a1 1 0 0 1-1.5-1l1.3-6.5C5.6 30.9 5 26.6 5 21.1 5 12.2 13.5 5 24 5Z"
        fill="currentColor"
      />
      <path
        d="M24 12.5c2.6 2.6 4.4 4.9 4.4 7.7 0 1.3-.5 2.4-1.3 3.2.9.6 1.5 1.7 1.5 3 0 2.6-2.1 4.6-4.6 4.6s-4.6-2-4.6-4.6c0-3.6 2.4-5.2 2.4-8.1 0-1.5-.6-3-1.2-4.2 1.3-.5 2.5-1 3.4-1.6Z"
        fill="var(--color-accent)"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoIcone size={32} className="text-primary" />
      <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
        Memória Viva
      </span>
    </span>
  );
}
