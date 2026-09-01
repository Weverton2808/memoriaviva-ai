import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { LogoIcone } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { registrarEvento } from "@/services/analytics";

const CHAVE_VISTO = "mv:onboarding";

/** Marca que a pessoa já viu a apresentação, para não repetir. */
export function marcarOnboardingVisto(): void {
  try {
    localStorage.setItem(CHAVE_VISTO, "1");
  } catch {
    /* sem armazenamento: mostramos de novo, sem prejuízo */
  }
}

export function jaViuOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(CHAVE_VISTO) === "1";
  } catch {
    return true;
  }
}

const TELAS = [
  {
    icone: Sparkles,
    titulo: "Todos sabem algo.",
    texto: "Aquilo que você aprendeu vivendo pode ajudar outra pessoa.",
  },
  {
    icone: MessageCircle,
    titulo: "Conte sua experiência.",
    texto: "Fazemos perguntas simples. Você só responde com suas palavras.",
  },
  {
    icone: BookOpen,
    titulo: "Preserve para o futuro.",
    texto: "Organizamos tudo em um guia que fica guardado do seu jeito.",
  },
];

export const Route = createFileRoute("/boas-vindas")({
  head: () => ({
    meta: [
      { title: "Como funciona o Memória Viva" },
      {
        name: "description",
        content:
          "Em três passos: conte o que você sabe, responda perguntas simples e preserve sua experiência.",
      },
      { property: "og:title", content: "Como funciona o Memória Viva" },
      {
        property: "og:description",
        content: "Conte, converse e preserve o que você sabe em um guia organizado.",
      },
    ],
  }),
  component: BoasVindas,
});

function BoasVindas() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const tela = TELAS[passo]!;

  useEffect(() => {
    registrarEvento("onboarding_started");
  }, []);

  function seguir() {
    if (passo < TELAS.length - 1) {
      setPasso(passo + 1);
      return;
    }
    marcarOnboardingVisto();
    registrarEvento("onboarding_finished");
    void navigate({ to: "/criar" });
  }

  function pular() {
    marcarOnboardingVisto();
    void navigate({ to: "/criar" });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-between px-6 py-8">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={pular} className="min-h-11 text-base">
          Pular
        </Button>
      </div>

      <section key={passo} className="mv-entrada text-center">
        <span className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-primary-soft text-primary">
          <tela.icone className="size-12" aria-hidden="true" />
        </span>
        <h1 className="mt-8 text-3xl sm:text-4xl">{tela.titulo}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{tela.texto}</p>
      </section>

      <div>
        <div className="flex justify-center gap-2" role="presentation">
          {TELAS.map((t, i) => (
            <span
              key={t.titulo}
              className={`h-2 rounded-full transition-all ${
                i === passo ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={seguir}
          size="lg"
          className="mt-6 h-14 w-full rounded-2xl text-lg font-bold"
        >
          {passo < TELAS.length - 1 ? "Continuar" : "Começar"}
        </Button>

        <p className="mt-4 flex items-center justify-center gap-2 text-center text-base text-muted-foreground">
          <LogoIcone size={18} className="text-primary" />
          Você não precisa saber escrever bem. Só contar o que sabe.
        </p>
      </div>
    </main>
  );
}
