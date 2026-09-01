import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { CATEGORIAS, getCategoria } from "@/data/categorias";
import { listarPublicos } from "@/services/knowledgeService";
import type { CategoriaId } from "@/types";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar conhecimentos — Memória Viva" },
      {
        name: "description",
        content:
          "Receitas, ofícios, cuidados e histórias de vida registrados por pessoas que aprenderam na prática.",
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
  const [filtro, setFiltro] = useState<CategoriaId | "todas">("todas");
  const [busca, setBusca] = useState("");

  const consulta = useQuery({
    queryKey: ["publicos", filtro, busca.trim()],
    queryFn: () => listarPublicos({ categoria: filtro, busca }),
  });

  const lista = consulta.data ?? [];

  return (
    <AppShell largura="larga">
      <h1 className="text-3xl sm:text-4xl">O que você gostaria de aprender?</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Tudo aqui foi contado por alguém que viveu. Busque um assunto ou escolha uma categoria.
      </p>

      <div className="relative mt-6">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar conhecimento"
          placeholder="Buscar por assunto…"
          className="h-14 rounded-2xl pl-12 text-lg"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {([{ id: "todas", emoji: "✨", nome: "Todos" }, ...CATEGORIAS] as const).map((c) => {
          const ativo = filtro === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => setFiltro(c.id as CategoriaId | "todas")}
              className={`min-h-11 rounded-full border-2 px-5 text-base font-semibold transition-colors ${
                ativo
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary"
              }`}
            >
              {c.emoji} {c.nome}
            </button>
          );
        })}
      </div>

      {consulta.isLoading ? (
        <p className="mt-12 text-lg text-muted-foreground">Carregando conhecimentos…</p>
      ) : lista.length === 0 ? (
        <p className="mt-12 text-lg text-muted-foreground">
          Nenhum conhecimento encontrado com esses filtros.
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((a) => {
            const cat = getCategoria(a.category);
            return (
              <li key={a.id}>
                <Link
                  to="/guia/$id"
                  params={{ id: a.id }}
                  className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary"
                >
                  <span className="text-sm font-bold tracking-widest text-primary">
                    {cat.emoji} {cat.rotulo}
                  </span>
                  <span className="mt-2 text-xl font-bold leading-snug">{a.title}</span>
                  <span className="mt-2 flex-1 text-base text-muted-foreground">{a.summary}</span>
                  <span className="mt-4 text-base font-semibold text-foreground">
                    Por {a.author_name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
