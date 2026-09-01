import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { LogoIcone } from "@/components/logo";
import { proximaPergunta } from "@/services/entrevista";
import { adicionarMensagem, criarSessao } from "@/services/db";
import { lerRascunho } from "@/services/rascunho";

export const Route = createFileRoute("/criar/preparando")({
  head: () => ({
    meta: [
      { title: "Preparando suas perguntas — Memória Viva" },
      { name: "description", content: "Estamos preparando perguntas sobre a sua experiência." },
      { property: "og:title", content: "Preparando suas perguntas — Memória Viva" },
      { property: "og:description", content: "Queremos conhecer melhor sua experiência." },
    ],
  }),
  component: Preparando,
});

function Preparando() {
  const navigate = useNavigate();
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;

    const { categoria, descricao } = lerRascunho();
    if (!categoria || !descricao) {
      void navigate({ to: "/criar" });
      return;
    }

    const sessao = criarSessao(categoria, descricao);
    adicionarMensagem(sessao.id, "user", descricao);
    const primeira = proximaPergunta(categoria, descricao, []);
    adicionarMensagem(sessao.id, "assistant", primeira.pergunta);

    const t = setTimeout(() => {
      void navigate({ to: "/conversa/$id", params: { id: sessao.id } });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <LogoIcone size={84} className="mv-pulso text-primary" />
      <h1 className="mt-8 text-3xl">Estamos preparando suas perguntas.</h1>
      <p className="mt-3 max-w-sm text-lg text-muted-foreground">
        Queremos conhecer melhor sua experiência.
      </p>
      <div
        className="mt-8 h-2 w-56 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Preparando a conversa"
      >
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}
