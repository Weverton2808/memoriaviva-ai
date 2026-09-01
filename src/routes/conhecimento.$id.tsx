import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ARTIGOS_EXEMPLO, CATEGORIAS, loadStore, type KnowledgeArticle } from "@/lib/memoria";

export const Route = createFileRoute("/conhecimento/$id")({
  head: () => ({
    meta: [
      { title: "Conhecimento registrado — Memória Viva" },
      {
        name: "description",
        content:
          "Um saber real, organizado em seções, contado por quem aprendeu na prática e viveu a experiência.",
      },
      { property: "og:title", content: "Conhecimento registrado — Memória Viva" },
      { property: "og:description", content: "Um saber real, organizado e pronto para partilhar." },
    ],
  }),
  component: Conhecimento,
});

function Conhecimento() {
  const { id } = Route.useParams();
  const [artigo, setArtigo] = useState<KnowledgeArticle | null | undefined>(undefined);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const local = loadStore().articles.find((a) => a.id === id);
    setArtigo(local ?? ARTIGOS_EXEMPLO.find((a) => a.id === id) ?? null);
  }, [id]);

  async function copiar() {
    if (!artigo) return;
    const texto = [
      artigo.title,
      artigo.summary,
      ...artigo.sections.map((s) => `\n${s.heading}\n${s.body}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(texto);
      setAviso("Texto copiado!");
    } catch {
      setAviso("Não foi possível copiar neste navegador.");
    }
  }

  async function compartilhar() {
    if (!artigo) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: artigo.title, text: artigo.summary, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setAviso("Link copiado!");
    }
  }

  if (artigo === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold">Conhecimento não encontrado</h1>
          <Link
            to="/explorar"
            className="mt-6 inline-block rounded-2xl bg-primary px-8 py-4 text-xl font-bold text-primary-foreground"
          >
            Explorar conhecimentos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="paper border-b border-border/70">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            {artigo ? (
              <>
                <p className="text-base font-bold uppercase tracking-widest text-primary">
                  {CATEGORIAS.find((c) => c.id === artigo.category)?.nome} · {artigo.topic}
                </p>
                <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{artigo.title}</h1>
                <p className="mt-4 text-xl text-muted-foreground">{artigo.summary}</p>
                <p className="mt-4 text-lg font-semibold">Contado por {artigo.author_name}</p>
              </>
            ) : (
              <p className="text-xl text-muted-foreground">Carregando...</p>
            )}
          </div>
        </div>

        {artigo && (
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <article className="space-y-10">
              {artigo.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="text-2xl font-semibold sm:text-3xl">{s.heading}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-xl leading-relaxed">{s.body}</p>
                </section>
              ))}
            </article>

            <div className="mt-10 flex flex-wrap gap-2">
              {artigo.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-4 py-2 text-base font-semibold text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-10 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2">
              <button
                type="button"
                onClick={compartilhar}
                className="rounded-2xl bg-primary px-6 py-5 text-xl font-bold text-primary-foreground"
              >
                Compartilhar
              </button>
              <button
                type="button"
                onClick={copiar}
                className="rounded-2xl border-2 border-primary/40 px-6 py-5 text-xl font-bold"
              >
                Copiar texto
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-2xl border-2 border-border px-6 py-5 text-xl font-bold"
              >
                Imprimir / salvar PDF
              </button>
              <Link
                to="/nova"
                search={{}}
                className="rounded-2xl border-2 border-border px-6 py-5 text-center text-xl font-bold"
              >
                Contar outra história
              </Link>
              {aviso && (
                <p role="status" className="text-lg font-semibold text-primary sm:col-span-2">
                  {aviso}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
