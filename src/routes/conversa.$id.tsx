import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  gerarArtigo,
  getCategoria,
  loadStore,
  proximaPergunta,
  saveStore,
  totalPerguntas,
  uid,
  type KnowledgeSession,
  type Message,
} from "@/lib/memoria";

export const Route = createFileRoute("/conversa/$id")({
  head: () => ({
    meta: [
      { title: "Conversa com a entrevistadora — Memória Viva" },
      {
        name: "description",
        content:
          "Responda com calma às perguntas da entrevistadora e transforme sua experiência em conhecimento organizado.",
      },
      { property: "og:title", content: "Conversa com a entrevistadora — Memória Viva" },
      { property: "og:description", content: "Uma pergunta de cada vez, no seu ritmo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Conversa,
});

function Conversa() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<KnowledgeSession | null>(null);
  const [mensagens, setMensagens] = useState<Message[]>([]);
  const [texto, setTexto] = useState("");
  const [pronta, setPronta] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const store = loadStore();
    const s = store.sessions.find((x) => x.id === id) ?? null;
    setSessao(s);
    let msgs = store.messages.filter((m) => m.session_id === id);
    if (s && msgs.length === 0) {
      const { pergunta } = proximaPergunta(s.category, s.topic, []);
      const primeira: Message = {
        id: uid(),
        session_id: s.id,
        role: "assistant",
        content: pergunta,
        created_at: new Date().toISOString(),
      };
      msgs = [primeira];
      saveStore({ messages: [...store.messages, primeira] });
    }
    setMensagens(msgs);
    setPronta(true);
  }, [id]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  const respostas = mensagens.filter((m) => m.role === "user").map((m) => m.content);
  const total = totalPerguntas(respostas);
  const feitas = Math.min(respostas.length, total);
  const concluida = respostas.length >= total;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!sessao || !texto.trim()) return;
    const agora = new Date().toISOString();
    const resposta: Message = {
      id: uid(),
      session_id: sessao.id,
      role: "user",
      content: texto.trim(),
      created_at: agora,
    };
    const novasRespostas = [...respostas, resposta.content];
    const novas: Message[] = [...mensagens, resposta];

    if (novasRespostas.length < totalPerguntas(novasRespostas)) {
      const { pergunta } = proximaPergunta(sessao.category, sessao.topic, novasRespostas);
      novas.push({
        id: uid(),
        session_id: sessao.id,
        role: "assistant",
        content: pergunta,
        created_at: agora,
      });
    } else {
      novas.push({
        id: uid(),
        session_id: sessao.id,
        role: "assistant",
        content:
          "Que conversa rica! Já tenho tudo o que preciso. Quando quiser, toque no botão abaixo e eu organizo tudo isso em um texto bonito para você guardar e compartilhar.",
        created_at: agora,
      });
    }

    const store = loadStore();
    saveStore({
      messages: [...store.messages.filter((m) => m.session_id !== sessao.id), ...novas],
    });
    setMensagens(novas);
    setTexto("");
  }

  function gerar() {
    if (!sessao) return;
    const store = loadStore();
    const artigo = gerarArtigo(sessao, mensagens, store.profile?.name ?? "Você");
    saveStore({
      articles: [artigo, ...store.articles],
      sessions: store.sessions.map((s) =>
        s.id === sessao.id ? { ...s, status: "concluida" as const } : s,
      ),
    });
    navigate({ to: "/conhecimento/$id", params: { id: artigo.id } });
  }

  if (pronta && !sessao) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold">Não encontramos essa conversa</h1>
          <Link
            to="/nova"
            search={{}}
            className="mt-6 inline-block rounded-2xl bg-primary px-8 py-4 text-xl font-bold text-primary-foreground"
          >
            Começar uma nova
          </Link>
        </div>
      </div>
    );
  }

  const cat = sessao ? getCategoria(sessao.category) : null;

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <SiteHeader />

      <div className="border-b border-border/70 bg-background">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">
              {cat?.emoji} {sessao?.topic}
            </p>
            <p className="text-base text-muted-foreground">{cat?.nome}</p>
          </div>
          <p className="shrink-0 text-lg font-semibold text-primary">
            {feitas} de {total}
          </p>
        </div>
        <div className="h-2 w-full bg-secondary">
          <div
            className="h-2 bg-primary transition-all"
            style={{ width: `${(feitas / total) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">
          {mensagens.map((m) => (
            <div
              key={m.id}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[90%] rounded-3xl px-6 py-5 text-xl leading-relaxed shadow-sm sm:max-w-[80%] ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-card-foreground"
                }`}
              >
                {m.role === "assistant" && (
                  <p className="mb-1 text-base font-bold uppercase tracking-wide text-primary">
                    Entrevistadora
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          <div ref={fim} />
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          {concluida ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={gerar}
                className="w-full rounded-2xl bg-primary px-8 py-5 text-xl font-bold text-primary-foreground shadow-lg"
              >
                Gerar conhecimento organizado
              </button>
              <p className="text-center text-base text-muted-foreground">
                Você ainda pode responder mais, se quiser acrescentar algo.
              </p>
            </div>
          ) : null}
          <form onSubmit={enviar} className="mt-3 space-y-3">
            <label htmlFor="resposta" className="sr-only">
              Sua resposta
            </label>
            <textarea
              id="resposta"
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreva sua resposta aqui, com calma..."
              className="w-full resize-none rounded-2xl border-2 border-input bg-background px-5 py-4 text-xl leading-relaxed"
            />
            <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
              <button
                type="button"
                disabled
                title="Em breve: responder falando"
                className="rounded-2xl border-2 border-dashed border-border px-5 py-4 text-lg font-semibold text-muted-foreground"
              >
                🎤 Falar (em breve)
              </button>
              <button
                type="submit"
                disabled={!texto.trim()}
                className="rounded-2xl bg-primary px-8 py-4 text-xl font-bold text-primary-foreground disabled:opacity-40"
              >
                Enviar resposta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
