import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Globe, Lock, Plus, Settings } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getCategoria } from "@/data/categorias";
import { useBanco } from "@/hooks/use-db";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Memória Viva" },
      {
        name: "description",
        content: "Veja os conhecimentos que você já registrou e continue compartilhando.",
      },
      { property: "og:title", content: "Meu perfil — Memória Viva" },
      { property: "og:description", content: "Seus conhecimentos registrados no Memória Viva." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { perfil, artigos } = useBanco();
  const meus = artigos.filter((a) => !a.demo);

  return (
    <AppShell>
      <div className="flex items-center gap-4">
        <span
          className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-2xl font-extrabold text-primary"
          aria-hidden="true"
        >
          {(perfil?.name ?? "V").slice(0, 1).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-3xl">{perfil?.name ?? "Visitante"}</h1>
          <p className="text-base text-muted-foreground">
            {meus.length === 0
              ? "Nenhum conhecimento registrado ainda"
              : `${meus.length} conhecimento${meus.length > 1 ? "s" : ""} registrado${meus.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button asChild variant="outline" size="icon" className="size-12 rounded-2xl">
          <Link to="/configuracoes" aria-label="Abrir configurações">
            <Settings className="size-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <Button asChild size="lg" className="mt-6 h-14 w-full rounded-2xl text-lg font-bold">
        <Link to="/criar">
          <Plus className="size-5" aria-hidden="true" />
          Registrar novo conhecimento
        </Link>
      </Button>

      <h2 className="mt-10 text-2xl">Meus conhecimentos</h2>

      {meus.length === 0 ? (
        <div className="mt-4 rounded-3xl border-2 border-dashed border-border p-8 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-lg text-muted-foreground">
            Aquilo que você sabe ainda não está registrado. Que tal começar agora?
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {meus.map((a) => {
            const cat = getCategoria(a.category);
            return (
              <li key={a.id}>
                <Link
                  to="/guia/$id"
                  params={{ id: a.id }}
                  className="block rounded-3xl border border-border bg-card p-5 transition-colors hover:border-primary"
                >
                  <span className="text-sm font-bold tracking-widest text-primary">
                    {cat.rotulo}
                  </span>
                  <span className="mt-1 block text-xl font-bold">{a.title}</span>
                  <span className="mt-2 block text-base text-muted-foreground">{a.summary}</span>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    {a.is_public ? (
                      <>
                        <Globe className="size-4" aria-hidden="true" /> Público
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" aria-hidden="true" /> Privado
                      </>
                    )}
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
