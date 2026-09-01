import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PassoIndicador } from "@/components/passo-indicador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIAS } from "@/data/categorias";
import { registrarEvento } from "@/services/analytics";
import { lerRascunho, salvarRascunho } from "@/services/rascunho";
import type { CategoriaId } from "@/types";

export const Route = createFileRoute("/criar/")({
  head: () => ({
    meta: [
      { title: "O que você quer compartilhar? — Memória Viva" },
      {
        name: "description",
        content: "Escolha a categoria que melhor representa o conhecimento que você quer preservar.",
      },
      { property: "og:title", content: "Compartilhar um conhecimento — Memória Viva" },
      {
        property: "og:description",
        content: "Escolha uma categoria e comece a preservar sua experiência.",
      },
    ],
  }),
  component: EscolherCategoria,
});

function EscolherCategoria() {
  const navigate = useNavigate();
  const [selecionada, setSelecionada] = useState<CategoriaId | null>(null);
  const [outro, setOutro] = useState("");

  useEffect(() => {
    const r = lerRascunho();
    if (r.categoria) setSelecionada(r.categoria);
  }, []);

  function seguir(categoria: CategoriaId, descricao = "") {
    salvarRascunho({ categoria, descricao });
    registrarEvento("category_selected", { categoria });
    void navigate({ to: "/criar/descrever" });
  }

  // Escolher já avança: uma decisão por tela, sem formulário.
  function escolher(categoria: CategoriaId) {
    setSelecionada(categoria);
    if (categoria !== "outro") seguir(categoria);
  }

  return (
    <AppShell>
      <PassoIndicador passo={1} />

      <h1 className="mt-4 text-3xl">O que você gostaria de compartilhar?</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Escolha a opção que mais se parece com o que você quer contar. Nada aqui é definitivo.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CATEGORIAS.map((c) => {
          const ativa = selecionada === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => escolher(c.id)}
              aria-pressed={ativa}
              className={`flex min-h-24 w-full items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all ${
                ativa
                  ? "border-primary bg-primary-soft shadow-md"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                {c.emoji}
              </span>
              <span>
                <span className="block text-xl font-bold text-foreground">{c.nome}</span>
                <span className="block text-base text-muted-foreground">{c.descricao}</span>
              </span>
              {ativa && <span className="ml-auto text-sm font-bold text-primary">Escolhido</span>}
            </button>
          );
        })}
      </div>

      {selecionada === "outro" && (
        <div className="mt-5">
          <label htmlFor="outro" className="text-lg font-semibold">
            Sobre o que você quer falar?
          </label>
          <Input
            id="outro"
            value={outro}
            onChange={(e) => setOutro(e.target.value)}
            placeholder="Escreva com suas palavras…"
            className="mt-2 h-14 rounded-2xl text-lg"
          />
        </div>
      )}

      {selecionada === "outro" && (
        <Button
          onClick={() => seguir("outro", outro)}
          size="lg"
          className="mt-8 h-14 w-full rounded-2xl text-lg font-bold"
        >
          Continuar
        </Button>
      )}
    </AppShell>
  );
}
