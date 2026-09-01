import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import {
  CATEGORIAS,
  loadStore,
  saveStore,
  uid,
  type CategoryId,
  type KnowledgeSession,
} from "@/lib/memoria";

export const Route = createFileRoute("/nova")({
  validateSearch: (s: Record<string, unknown>) => ({
    categoria: typeof s['categoria'] === "string" ? (s['categoria'] as CategoryId) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Começar uma conversa — Memória Viva" },
      {
        name: "description",
        content:
          "Escolha uma categoria e um tema para começar a conversa com a entrevistadora da Memória Viva.",
      },
      { property: "og:title", content: "Começar uma conversa — Memória Viva" },
      { property: "og:description", content: "Escolha a categoria e o tema da sua história." },
    ],
  }),
  component: Nova,
});

function Nova() {
  const { categoria } = Route.useSearch();
  const navigate = useNavigate();
  const [catId, setCatId] = useState<CategoryId | null>(categoria ?? null);
  const [tema, setTema] = useState<string>("");
  const [temaLivre, setTemaLivre] = useState("");

  const cat = CATEGORIAS.find((c) => c.id === catId) ?? null;
  const temaFinal = temaLivre.trim() || tema;

  function iniciar() {
    if (!cat || !temaFinal) return;
    const sessao: KnowledgeSession = {
      id: uid(),
      user_id: null,
      category: cat.id,
      topic: temaFinal,
      status: "em_andamento",
      created_at: new Date().toISOString(),
    };
    const store = loadStore();
    saveStore({ sessions: [...store.sessions, sessao] });
    navigate({ to: "/conversa/$id", params: { id: sessao.id } });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="paper flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">Sobre o que vamos conversar?</h1>
          <p className="mt-3 text-xl text-muted-foreground">
            Passo 1: escolha a área. Passo 2: escolha o tema.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">1. Escolha a área</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CATEGORIAS.map((c) => {
              const ativo = catId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => {
                    setCatId(c.id);
                    setTema("");
                  }}
                  className={`rounded-3xl border-2 p-5 text-left transition-all ${
                    ativo
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span className="text-3xl" aria-hidden>
                    {c.emoji}
                  </span>
                  <p className="mt-2 text-xl font-bold">{c.nome}</p>
                  <p className="text-lg text-muted-foreground">{c.descricao}</p>
                </button>
              );
            })}
          </div>

          {cat && (
            <>
              <h2 className="mt-12 text-2xl font-semibold">2. Escolha o tema</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {cat.temas.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tema === t && !temaLivre}
                    onClick={() => {
                      setTema(t);
                      setTemaLivre("");
                    }}
                    className={`rounded-2xl border-2 px-6 py-4 text-lg font-semibold transition-colors ${
                      tema === t && !temaLivre
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-secondary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <label htmlFor="tema-livre" className="mt-8 block text-lg font-semibold">
                Ou escreva o seu próprio tema
              </label>
              <input
                id="tema-livre"
                value={temaLivre}
                onChange={(e) => setTemaLivre(e.target.value)}
                placeholder="Ex.: como fazer telha de barro"
                className="mt-2 w-full rounded-2xl border-2 border-input bg-background px-5 py-4 text-xl"
              />

              <button
                type="button"
                disabled={!temaFinal}
                onClick={iniciar}
                className="mt-8 w-full rounded-2xl bg-primary px-8 py-5 text-xl font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Começar a conversa
              </button>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
