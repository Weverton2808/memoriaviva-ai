import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Info, Plus, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LogoIcone } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useHidratado } from "@/hooks/use-db";
import {
  adicionarMensagem,
  atualizarStatusSessao,
  getPerfil,
  getSessao,
  listarMensagens,
  salvarArtigo,
} from "@/services/db";
import { mensagemProgresso, proximaPergunta, MIN_PERGUNTAS } from "@/services/entrevista";
import { gerarGuia } from "@/services/gerador";
import type { KnowledgeSession, Message } from "@/types";

export const Route = createFileRoute("/conversa/$id")({
  head: () => ({
    meta: [
      { title: "Registrando sua experiência — Memória Viva" },
      {
        name: "description",
        content: "Converse e responda perguntas simples sobre aquilo que você sabe.",
      },
      { property: "og:title", content: "Registrando sua experiência — Memória Viva" },
      { property: "og:description", content: "Uma conversa tranquila sobre o que você sabe." },
    ],
  }),
  component: Conversa,
});

function Conversa() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const hidratado = useHidratado();
  const [sessao, setSessao] = useState<KnowledgeSession | null>(null);
  const [mensagens, setMensagens] = useState<Message[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [oferta, setOferta] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hidratado) return;
    const s = getSessao(id);
    if (!s) {
      void navigate({ to: "/criar" });
      return;
    }
    setSessao(s);
    setMensagens(listarMensagens(id));
  }, [hidratado, id, navigate]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length, pensando]);

  const respostas = mensagens.filter((m) => m.role === "user").length - 1;

  function enviar() {
    if (!sessao || !texto.trim() || pensando) return;
    adicionarMensagem(sessao.id, "user", texto.trim());
    const atualizadas = listarMensagens(sessao.id);
    setMensagens(atualizadas);
    setTexto("");
    setPensando(true);

    setTimeout(() => {
      const prox = proximaPergunta(sessao.category, sessao.topic, atualizadas);
      adicionarMensagem(sessao.id, "assistant", prox.pergunta);
      setMensagens(listarMensagens(sessao.id));
      setPensando(false);
      if (prox.oferecerGuia) setOferta(true);
    }, 900);
  }

  function criarGuia() {
    if (!sessao) return;
    const perfil = getPerfil();
    const artigo = gerarGuia(
      sessao,
      listarMensagens(sessao.id),
      perfil?.name ?? "Você",
      perfil?.id ?? null,
    );
    salvarArtigo(artigo);
    atualizarStatusSessao(sessao.id, "completed");
    void navigate({ to: "/guia/$id", params: { id: artigo.id }, search: { novo: true } });
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center gap-3 px-3">
          <Link
            to="/"
            aria-label="Voltar para o início"
            className="flex size-11 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <p className="font-display text-lg font-extrabold leading-tight">Memória Viva</p>
            <p className="text-sm text-muted-foreground">Registrando sua experiência</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11" aria-label="Como funciona">
                <Info className="size-5" aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Como funciona esta conversa</DialogTitle>
                <DialogDescription className="text-base">
                  Fazemos uma pergunta por vez sobre a sua experiência. Responda com suas palavras,
                  sem pressa. Quando quiser, você pode encerrar e criar o seu guia.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        <p
          className="mb-4 rounded-full bg-accent-soft px-4 py-2 text-center text-sm font-semibold text-accent-foreground"
          aria-live="polite"
        >
          {mensagemProgresso(Math.max(0, respostas))}
        </p>

        <ul className="space-y-4">
          {mensagens.map((m, i) =>
            i === 0 ? null : (
              <li
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex items-start gap-3"}
              >
                {m.role === "assistant" && (
                  <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                    <LogoIcone size={20} className="text-primary" />
                  </span>
                )}
                <p
                  className={`max-w-[85%] rounded-3xl px-5 py-4 text-lg leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-lg bg-primary text-primary-foreground"
                      : "rounded-bl-lg border border-border bg-card text-card-foreground"
                  }`}
                >
                  {m.content}
                </p>
              </li>
            ),
          )}

          {pensando && (
            <li className="flex items-center gap-3 text-muted-foreground" aria-live="polite">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft">
                <LogoIcone size={20} className="mv-pulso text-primary" />
              </span>
              <span className="text-base">Pensando na próxima pergunta…</span>
            </li>
          )}
        </ul>

        {oferta && (
          <section className="mv-entrada mt-6 rounded-3xl border-2 border-primary bg-card p-6">
            <h2 className="text-2xl">Estamos aprendendo muito com sua experiência.</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Já reunimos bastante informação para criar um guia organizado baseado no que você
              compartilhou.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse">
              <Button
                onClick={criarGuia}
                size="lg"
                className="h-14 flex-1 rounded-2xl text-lg font-bold"
              >
                Criar meu guia
              </Button>
              <Button
                onClick={() => setOferta(false)}
                variant="outline"
                size="lg"
                className="h-14 flex-1 rounded-2xl text-lg"
              >
                Continuar conversando
              </Button>
            </div>
          </section>
        )}

        <div ref={fim} />
      </main>

      <div className="sticky bottom-0 border-t border-border bg-background">
        <div className="mx-auto w-full max-w-2xl px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-12 shrink-0 rounded-2xl"
                  aria-label="Outras formas de responder"
                >
                  <Plus className="size-5" aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Em breve</DialogTitle>
                  <DialogDescription className="text-base">
                    Você poderá responder por voz, enviar fotos e anexar documentos. Por enquanto,
                    conte com suas palavras escritas.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder="Conte com suas palavras…"
              aria-label="Sua resposta"
              className="min-h-12 flex-1 resize-none rounded-2xl text-lg"
              rows={1}
            />

            <Button
              onClick={enviar}
              disabled={!texto.trim() || pensando}
              size="icon"
              className="size-12 shrink-0 rounded-2xl"
              aria-label="Enviar resposta"
            >
              <Send className="size-5" aria-hidden="true" />
            </Button>
          </div>

          {respostas >= MIN_PERGUNTAS && !oferta && (
            <button
              type="button"
              onClick={criarGuia}
              className="mt-3 w-full rounded-2xl py-2 text-base font-bold text-primary underline-offset-4 hover:underline"
            >
              Encerrar e criar meu guia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
