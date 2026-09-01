import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { LogoIcone } from "@/components/logo";
import { Protegido } from "@/components/protegido";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ERROS, mensagemDeErro } from "@/lib/erros";
import { generateNextQuestion } from "@/services/aiService";
import { criarSessao } from "@/services/knowledgeService";
import { adicionarMensagem } from "@/services/messageService";
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
  component: () => (
    <Protegido>
      <Preparando />
    </Protegido>
  ),
});

function Preparando() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const proximaPerguntaFn = useServerFn(generateNextQuestion);
  const iniciado = useRef(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const { categoria, descricao } = lerRascunho();
    if (!categoria || !descricao) {
      void navigate({ to: "/criar" });
      return;
    }
    if (!user || iniciado.current) return;
    iniciado.current = true;

    void (async () => {
      try {
        // 1. Cria a sessão  2. guarda a descrição da pessoa  3. pede a primeira pergunta à IA.
        const sessao = await criarSessao(user.id, categoria, descricao);
        await adicionarMensagem(sessao.id, "user", descricao);
        await proximaPerguntaFn({ data: { sessionId: sessao.id } });
        void navigate({ to: "/conversa/$id", params: { id: sessao.id } });
      } catch (e) {
        iniciado.current = false;
        setErro(mensagemDeErro(e, ERROS.ia));
      }
    })();
  }, [navigate, user, proximaPerguntaFn]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <LogoIcone size={84} className={erro ? "text-muted-foreground" : "mv-pulso text-primary"} />

      {erro ? (
        <>
          <h1 className="mt-8 text-2xl">Não conseguimos começar agora.</h1>
          <p className="mt-3 max-w-sm text-lg text-muted-foreground">{erro}</p>
          <Button
            size="lg"
            className="mt-6 h-14 rounded-2xl px-8 text-lg font-bold"
            onClick={() => void navigate({ to: "/criar" })}
          >
            Tentar novamente
          </Button>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
