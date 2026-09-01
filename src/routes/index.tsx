import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, MessageCircle, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { LogoIcone } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { jaViuOnboarding } from "@/routes/boas-vindas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Memória Viva — o que você sabe pode ajudar alguém" },
      {
        name: "description",
        content:
          "Compartilhe sua experiência e transforme aquilo que você sabe em um guia organizado, preservado para o futuro.",
      },
      { property: "og:title", content: "Memória Viva — preservando experiências para o futuro" },
      {
        property: "og:description",
        content: "Conte o que você sabe. Nós ajudamos a organizar e preservar esse conhecimento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ETAPAS = [
  {
    icone: MessageCircle,
    titulo: "Conte",
    texto: "Compartilhe algo que você aprendeu ou viveu.",
  },
  {
    icone: Sparkles,
    titulo: "Converse",
    texto: "Respondemos com perguntas para conhecer melhor sua experiência.",
  },
  {
    icone: BookOpen,
    titulo: "Preserve",
    texto: "Transformamos sua experiência em conhecimento organizado.",
  },
];

function Home() {
  const navigate = useNavigate();

  // Quem chega pela primeira vez vê a apresentação curta; quem já conhece vai direto.
  function comecar() {
    void navigate({ to: jaViuOnboarding() ? "/criar" : "/boas-vindas" });
  }

  return (
    <AppShell>
      <section className="mv-entrada py-6 text-center sm:py-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-foreground">
          <LogoIcone size={20} className="text-primary" />
          Versão beta — preservando experiências para o futuro
        </span>

        <h1 className="mt-6 text-4xl leading-tight text-foreground sm:text-5xl">
          O que você sabe pode ajudar alguém.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Compartilhe sua experiência. Nós ajudamos a transformá-la em conhecimento organizado.
        </p>

        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
          Você não precisa saber escrever, nem entender de tecnologia. É só contar.
        </p>

        <p className="mx-auto mt-3 max-w-md text-base font-semibold text-foreground">
          Em 5 a 10 minutos de conversa, seu guia fica pronto.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            onClick={comecar}
            size="lg"
            className="h-14 w-full max-w-md rounded-2xl text-lg font-bold shadow-lg shadow-primary/25"
          >
            Começar agora
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 w-full max-w-md rounded-2xl text-lg font-semibold"
          >
            <Link to="/explorar">Explorar conhecimentos</Link>
          </Button>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Estamos construindo uma nova forma de preservar experiências humanas. Esta é a versão
            beta — seus comentários ajudam a melhorar.
          </p>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="mt-10">
        <h2 id="como-funciona" className="text-center text-2xl">
          Como funciona
        </h2>

        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {ETAPAS.map((e, i) => (
            <li
              key={e.titulo}
              className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <e.icone className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-bold tracking-wide text-accent-foreground">
                PASSO {i + 1}
              </p>
              <h3 className="mt-1 text-xl">{e.titulo}</h3>
              <p className="mt-2 text-base text-muted-foreground">{e.texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
