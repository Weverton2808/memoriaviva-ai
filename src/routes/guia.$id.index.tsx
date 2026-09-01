import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Globe, Lock, Pencil, Save, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getCategoria } from "@/data/categorias";
import { useHidratado } from "@/hooks/use-db";
import { atualizarArtigo, getArtigo } from "@/services/db";
import { ETAPAS_GERACAO, tempoLeitura } from "@/services/gerador";
import type { KnowledgeArticle } from "@/types";

export const Route = createFileRoute("/guia/$id/")({
  validateSearch: (search: Record<string, unknown>): { novo?: boolean } =>
    search["novo"] === true || search["novo"] === "true" ? { novo: true } : {},
  head: () => ({
    meta: [
      { title: "Guia de conhecimento — Memória Viva" },
      {
        name: "description",
        content: "Uma experiência real transformada em guia organizado e preservado.",
      },
      { property: "og:title", content: "Guia de conhecimento — Memória Viva" },
      { property: "og:description", content: "Experiência preservada no Memória Viva." },
    ],
  }),
  component: Guia,
});

function Guia() {
  const { id } = Route.useParams();
  const { novo } = Route.useSearch();
  const navigate = useNavigate();
  const hidratado = useHidratado();
  const [artigo, setArtigo] = useState<KnowledgeArticle | null>(null);
  const [etapa, setEtapa] = useState(novo ? 0 : ETAPAS_GERACAO.length);
  const [privacidade, setPrivacidade] = useState(false);

  useEffect(() => {
    if (!hidratado) return;
    const a = getArtigo(id);
    if (!a) {
      void navigate({ to: "/explorar" });
      return;
    }
    setArtigo(a);
  }, [hidratado, id, navigate]);

  useEffect(() => {
    if (!novo || etapa >= ETAPAS_GERACAO.length) return;
    const t = setTimeout(() => setEtapa((e) => e + 1), 700);
    return () => clearTimeout(t);
  }, [novo, etapa]);

  if (!artigo) {
    return (
      <AppShell>
        <p className="py-16 text-center text-lg text-muted-foreground">Carregando…</p>
      </AppShell>
    );
  }

  if (novo && etapa < ETAPAS_GERACAO.length) {
    return (
      <AppShell semNavegacao>
        <div className="py-10">
          <h1 className="text-3xl">Transformando sua experiência em conhecimento.</h1>
          <ul className="mt-8 space-y-4" aria-live="polite">
            {ETAPAS_GERACAO.map((e, i) => (
              <li key={e} className="flex items-center gap-3 text-lg">
                <span
                  className={`flex size-8 items-center justify-center rounded-full ${
                    i < etapa
                      ? "bg-primary text-primary-foreground"
                      : i === etapa
                        ? "mv-pulso bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {i < etapa ? <Check className="size-4" /> : "•"}
                </span>
                <span className={i <= etapa ? "text-foreground" : "text-muted-foreground"}>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </AppShell>
    );
  }

  const cat = getCategoria(artigo.category);

  function definirPrivacidade(publico: boolean) {
    atualizarArtigo(artigo!.id, { is_public: publico });
    setArtigo({ ...artigo!, is_public: publico });
    setPrivacidade(false);
    toast.success(
      publico ? "Conhecimento publicado para outras pessoas." : "Conhecimento guardado como privado.",
    );
  }

  async function compartilhar() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      const nav: Navigator | undefined = typeof navigator === "undefined" ? undefined : navigator;
      if (nav && typeof nav.share === "function") {
        await nav.share({ title: artigo!.title, url });
      } else if (nav?.clipboard) {
        await nav.clipboard.writeText(url);
        toast.success("Link copiado.");
      }
    } catch {
      /* compartilhamento cancelado */
    }
  }

  return (
    <AppShell>
      <article className="mv-entrada">
        <p className="text-sm font-bold tracking-widest text-primary">{cat.rotulo}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{artigo.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Baseado na experiência de {artigo.author_name} · {tempoLeitura(artigo)} minutos de leitura
        </p>
        <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
          {artigo.is_public ? (
            <>
              <Globe className="size-4" aria-hidden="true" /> Público
            </>
          ) : (
            <>
              <Lock className="size-4" aria-hidden="true" /> Privado
            </>
          )}
        </p>

        <div className="mt-8 space-y-8">
          {artigo.content.map((s) => (
            <section key={s.id}>
              <h2 className="text-xl uppercase tracking-wide text-primary">{s.titulo}</h2>
              <p className="mt-2 whitespace-pre-line text-lg leading-relaxed text-foreground">
                {s.texto}
              </p>
            </section>
          ))}
        </div>
      </article>

      <div className="mt-10 grid gap-3">
        <Button
          size="lg"
          className="h-14 rounded-2xl text-lg font-bold"
          onClick={() => {
            atualizarArtigo(artigo.id, {});
            toast.success("Conhecimento salvo no seu perfil.");
            void navigate({ to: "/perfil" });
          }}
        >
          <Save className="size-5" aria-hidden="true" />
          Salvar meu conhecimento
        </Button>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl text-base">
            <Link to="/guia/$id/editar" params={{ id: artigo.id }}>
              <Pencil className="size-5" aria-hidden="true" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 rounded-2xl text-base"
            onClick={compartilhar}
          >
            <Share2 className="size-5" aria-hidden="true" />
            Compartilhar
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 rounded-2xl text-base"
            onClick={() => setPrivacidade(true)}
          >
            <Globe className="size-5" aria-hidden="true" />
            Publicar
          </Button>
        </div>
      </div>

      <Dialog open={privacidade} onOpenChange={setPrivacidade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Como você deseja guardar este conhecimento?
            </DialogTitle>
            <DialogDescription className="text-base">
              Você pode mudar essa escolha quando quiser.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => definirPrivacidade(false)}
              className="rounded-2xl border-2 border-border p-5 text-left hover:border-primary"
            >
              <span className="block text-xl font-bold">🔒 Privado</span>
              <span className="block text-base text-muted-foreground">
                Apenas você poderá acessar.
              </span>
            </button>
            <button
              type="button"
              onClick={() => definirPrivacidade(true)}
              className="rounded-2xl border-2 border-border p-5 text-left hover:border-primary"
            >
              <span className="block text-xl font-bold">🌎 Público</span>
              <span className="block text-base text-muted-foreground">
                Outras pessoas poderão encontrar e aprender com sua experiência.
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
