import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PassoIndicador } from "@/components/passo-indicador";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCategoria } from "@/data/categorias";
import { registrarEvento } from "@/services/analytics";
import { lerRascunho, salvarRascunho } from "@/services/rascunho";
import type { CategoriaId } from "@/types";

const LIMITE = 500;

const EXEMPLOS = [
  "Trabalhei 25 anos consertando máquinas de lavar.",
  "Faço o pão da minha avó desde criança.",
  "Aprendi a cuidar de uma horta sozinho, no quintal de casa.",
];

export const Route = createFileRoute("/criar/descrever")({
  head: () => ({
    meta: [
      { title: "Conte sobre o que você sabe — Memória Viva" },
      {
        name: "description",
        content:
          "Descreva rapidamente sua experiência. Depois conversamos e fazemos as perguntas certas.",
      },
      { property: "og:title", content: "Conte sobre o que você sabe — Memória Viva" },
      {
        property: "og:description",
        content: "Escreva com suas palavras. Não existe resposta certa.",
      },
    ],
  }),
  component: Descrever,
});

function Descrever() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<CategoriaId | null>(null);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const r = lerRascunho();
    if (!r.categoria) {
      void navigate({ to: "/criar" });
      return;
    }
    setCategoria(r.categoria);
    setTexto(r.descricao);
  }, [navigate]);

  function comecar() {
    if (texto.trim().length < 10) return;
    salvarRascunho({ descricao: texto.trim() });
    registrarEvento("topic_submitted", { tamanho: texto.trim().length });
    void navigate({ to: "/criar/preparando" });
  }

  return (
    <AppShell>
      <PassoIndicador passo={2} />

      <h1 className="mt-4 text-3xl">Conte rapidamente sobre o que você sabe.</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Não precisa escrever muito nem organizar as ideias. Duas ou três linhas já bastam.
      </p>

      {categoria && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-bold text-primary">
          {getCategoria(categoria).emoji} {getCategoria(categoria).nome}
        </p>
      )}

      <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface p-4">
        <p className="text-sm font-semibold text-muted-foreground">
          Exemplos de como começar — toque em um para usar
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {EXEMPLOS.map((exemplo) => (
            <button
              key={exemplo}
              type="button"
              onClick={() => setTexto(exemplo)}
              className="min-h-12 rounded-xl bg-card px-4 py-3 text-left text-lg text-foreground hover:bg-primary-soft"
            >
              “{exemplo}”
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="descricao" className="mt-6 block text-lg font-semibold">
        Sua experiência
      </label>
      <Textarea
        id="descricao"
        value={texto}
        maxLength={LIMITE}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Comece contando um pouco sobre sua experiência…"
        className="mt-2 min-h-44 rounded-2xl text-lg leading-relaxed"
      />
      <p className="mt-2 text-right text-sm text-muted-foreground" aria-live="polite">
        {texto.length} de {LIMITE} caracteres
      </p>

      <p className="mt-4 rounded-2xl bg-accent-soft p-4 text-base text-accent-foreground">
        Não existe resposta certa, e você poderá editar tudo depois.
      </p>

      <Button
        onClick={comecar}
        disabled={texto.trim().length < 10}
        size="lg"
        className="mt-6 h-14 w-full rounded-2xl text-lg font-bold"
      >
        Começar conversa
      </Button>
    </AppShell>
  );
}
