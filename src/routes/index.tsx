import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ARTIGOS_EXEMPLO, CATEGORIAS } from "@/lib/memoria";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Memória Viva — guarde o saber de quem viveu" },
      {
        name: "description",
        content:
          "Converse com uma entrevistadora inteligente e transforme suas memórias, receitas e ofícios em conhecimento organizado para as próximas gerações.",
      },
      { property: "og:title", content: "Memória Viva — guarde o saber de quem viveu" },
      {
        property: "og:description",
        content:
          "Uma conversa simples, em letras grandes, que transforma lembranças em conhecimento organizado.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="paper border-b border-border/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
            <div>
              <p className="text-lg font-semibold uppercase tracking-widest text-primary">
                Sua história importa
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                O que você sabe não pode se perder.
              </h1>
              <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted-foreground">
                Converse com a nossa entrevistadora. Ela faz perguntas simples, uma de cada vez, e
                no fim transforma tudo em um texto organizado para a sua família e para o mundo.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/nova"
                  className="rounded-2xl bg-primary px-8 py-5 text-center text-xl font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Começar a contar
                </Link>
                <Link
                  to="/explorar"
                  className="rounded-2xl border-2 border-primary/40 bg-card px-8 py-5 text-center text-xl font-bold text-foreground transition-colors hover:bg-secondary"
                >
                  Ver conhecimentos
                </Link>
              </div>
              <p className="mt-5 text-base text-muted-foreground">
                Leva de 10 a 20 minutos. Você pode parar e voltar quando quiser.
              </p>
            </div>

            <ul className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              {[
                ["1", "Escolha um assunto", "Receita, ofício, história de vida ou cuidados."],
                ["2", "Responda com calma", "De 8 a 15 perguntas, escritas do seu jeito."],
                ["3", "Receba o conhecimento", "Um texto organizado, pronto para compartilhar."],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-xl font-bold text-accent-foreground">
                    {n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-semibold">{t}</p>
                    <p className="text-lg text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">Sobre o que você quer falar?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIAS.map((c) => (
              <Link
                key={c.id}
                to="/nova"
                search={{ categoria: c.id }}
                className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <span className="text-4xl" aria-hidden>
                  {c.emoji}
                </span>
                <h3 className="mt-3 text-2xl font-semibold">{c.nome}</h3>
                <p className="mt-2 text-lg text-muted-foreground">{c.descricao}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-sand py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <h2 className="min-w-0 text-3xl font-semibold sm:text-4xl">Conhecimentos recentes</h2>
              <Link to="/explorar" className="shrink-0 text-lg font-bold text-primary underline">
                Ver todos
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {ARTIGOS_EXEMPLO.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  to="/conhecimento/$id"
                  params={{ id: a.id }}
                  className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-base font-semibold uppercase tracking-wide text-primary">
                    {a.topic}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{a.title}</h3>
                  <p className="mt-2 text-lg text-muted-foreground">{a.summary}</p>
                  <p className="mt-4 text-base font-semibold">{a.author_name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
