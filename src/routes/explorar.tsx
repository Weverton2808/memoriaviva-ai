import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import {
  ARTIGOS_EXEMPLO,
  CATEGORIAS,
  loadStore,
  type CategoryId,
  type KnowledgeArticle,
} from "@/lib/memoria";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar conhecimentos — Memória Viva" },
      {
        name: "description",
        content:
          "Receitas, ofícios, cuidados caseiros e histórias de vida registrados por pessoas que viveram e aprenderam na prática.",
      },
      { property: "og:title", content: "Explorar conhecimentos — Memória Viva" },
      {
        property: "og:description",
        content: "Navegue por saberes reais registrados por quem viveu.",
      },
    ],
  }),
  component: Explorar,
});

function Explorar() {
  const [meus, setMeus] = useState<KnowledgeArticle[]>([]);
  const [filtro, setFiltro] = useState<CategoryId | "todos">("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => setMeus(loadStore().articles), []);

  const todos = useMemo(() => [...meus, ...ARTIGOS_EXEMPLO], [meus]);
  const lista = todos.filter(
    (a) =>
      (filtro === "todos" || a.category === filtro) &&
      (busca.trim() === "" ||
        `${a.title} ${a.summary} ${a.author_name} ${a.topic}`
          .toLowerCase()
          .includes(busca.toLowerCase())),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="paper border-b border-border/70">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h1 className="text-3xl font-semibold sm:text-5xl">Explorar conhecimentos</h1>
            <p className="mt-3 max-w-2xl text-xl text-muted-foreground">
              Tudo aqui foi contado por alguém que viveu. Leia, aprenda e passe adiante.
            </p>
            <label htmlFor="busca" className="sr-only">
              Buscar conhecimento
            </label>
            <input
              id="busca"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por assunto, autor ou palavra..."
              className="mt-6 w-full max-w-2xl rounded-2xl border-2 border-input bg-background px-5 py-4 text-xl"
            />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-3">
            {(["todos", ...CATEGORIAS.map((c) => c.id)] as const).map((id) => {
              const c = CATEGORIAS.find((x) => x.id === id);
              const ativo = filtro === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setFiltro(id as CategoryId | "todos")}
                  className={`rounded-2xl border-2 px-5 py-3 text-lg font-semibold transition-colors ${
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  {c ? `${c.emoji} ${c.nome}` : "Todos"}
                </button>
              );
            })}
          </div>

          {lista.length === 0 ? (
            <p className="mt-12 text-xl text-muted-foreground">
              Nenhum conhecimento encontrado com esses filtros.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lista.map((a) => (
                <Link
                  key={a.id}
                  to="/conhecimento/$id"
                  params={{ id: a.id }}
                  className="flex flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-base font-semibold uppercase tracking-wide text-primary">
                    {CATEGORIAS.find((c) => c.id === a.category)?.nome} · {a.topic}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{a.title}</h2>
                  <p className="mt-2 flex-1 text-lg text-muted-foreground">{a.summary}</p>
                  <p className="mt-4 text-base font-semibold">{a.author_name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
