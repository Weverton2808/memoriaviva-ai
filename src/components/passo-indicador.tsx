interface Props {
  passo: 1 | 2 | 3;
  total?: number;
}

/** Indicador simples de progresso do fluxo de criação: "Passo X de 3". */
export function PassoIndicador({ passo, total = 3 }: Props) {
  return (
    <div>
      <p className="text-sm font-bold tracking-wide text-primary">
        PASSO {passo} DE {total}
      </p>
      <div className="mt-2 flex gap-2" role="presentation">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < passo ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
    </div>
  );
}
