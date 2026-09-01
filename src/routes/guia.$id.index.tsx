import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/hooks/use-auth";
import { ERROS, mensagemDeErro } from "@/lib/erros";
import { registrarEvento } from "@/services/analytics";
import { ETAPAS_GERACAO, tempoLeitura } from "@/services/gerador";
import { atualizarArtigo, getArtigo } from "@/services/knowledgeService";

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
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [etapa, setEtapa] = useState(novo ? 0 : ETAPAS_GERACAO.length);
  const [privacidade, setPrivacidade] = useState(false);
  const [preservado, setPreservado] = useState(false);

  const consulta = useQuery({ queryKey: ["artigo", id], queryFn: () => getArtigo(id) });
  const artigo = consulta.data ?? null;

  useEffect(() => {
    if (consulta.isSuccess && !consulta.data) void navigate({ to: "/explorar" });
  }, [consulta.isSuccess, consulta.data, navigate]);

  useEffect(() => {
    if (!novo || etapa >= ETAPAS_GERACAO.length) return;
    const t = setTimeout(() => setEtapa((e) => e + 1), 700);
    return () => clearTimeout(t);
  }, [novo, etapa]);

  const publicar = useMutation({
    mutationFn: (publico: boolean) => atualizarArtigo(id, { is_public: publico }),
    onSuccess: async (_d, publico) => {
      await queryClient.invalidateQueries({ queryKey: ["artigo", id] });
      await queryClient.invalidateQueries({ queryKey: ["meus-artigos"] });
      setPrivacidade(false);
      setPreservado(true);
      registrarEvento(publico ? "guide_published" : "guide_kept_private");
      toast.success(
        publico
          ? "Conhecimento publicado para outras pessoas."
          : "Conhecimento guardado como privado.",
      );
    },
    onError: (e) => toast.error(mensagemDeErro(e, ERROS.salvar)),
  });

  if (consulta.isLoading || !artigo) {
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
  const meu = Boolean(user && artigo.user_id === user.id);
  const minutos = tempoLeitura(artigo);

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
      {novo && (
        <section className="mv-entrada mb-8 rounded-3xl border-2 border-primary bg-primary-soft p-6 text-center">
          <h2 className="text-2xl">Você transformou sua experiência em conhecimento.</h2>
          <p className="mt-2 text-base text-accent-foreground">
            Agora isso pode continuar ajudando pessoas no futuro. Seu conhecimento começa privado —
            só você o vê até decidir o contrário.
          </p>
        </section>
      )}

      <article className="mv-entrada">
        <p className="text-sm font-bold tracking-widest text-primary">{cat.rotulo}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{artigo.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Baseado na experiência de {artigo.author_name} · {minutos} minuto
          {minutos > 1 ? "s" : ""} de leitura
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
        {meu && !preservado && (
          <Button
            size="lg"
            className="h-14 rounded-2xl text-lg font-bold"
            onClick={() => {
              registrarEvento("guide_saved");
              setPreservado(true);
              toast.success("Conhecimento preservado no seu perfil.");
            }}
          >
            <Save className="size-5" aria-hidden="true" />
            Salvar meu conhecimento
          </Button>
        )}

        {meu && preservado && (
          <section className="mv-entrada rounded-3xl border-2 border-primary bg-card p-6">
            <h2 className="text-2xl">Seu conhecimento foi preservado.</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Ele fica guardado no seu perfil e você pode alterar ou editar quando quiser.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Button asChild size="lg" className="h-14 rounded-2xl text-base font-bold">
                <Link to="/perfil">Ver meus conhecimentos</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl text-base">
                <Link to="/criar">Criar outro</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl text-base">
                <Link to="/explorar">Explorar conhecimentos</Link>
              </Button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {meu && (
            <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl text-base">
              <Link to="/guia/$id/editar" params={{ id: artigo.id }}>
                <Pencil className="size-5" aria-hidden="true" />
                Editar
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="h-14 rounded-2xl text-base"
            onClick={() => void compartilhar()}
          >
            <Share2 className="size-5" aria-hidden="true" />
            Compartilhar
          </Button>
          {meu && (
            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-2xl text-base"
              onClick={() => setPrivacidade(true)}
            >
              <Globe className="size-5" aria-hidden="true" />
              Privacidade
            </Button>
          )}
        </div>
      </div>

      <Dialog open={privacidade} onOpenChange={setPrivacidade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Como você deseja guardar este conhecimento?
            </DialogTitle>
            <DialogDescription className="text-base">
              Seu conhecimento começa privado. Você pode mudar essa escolha quando quiser.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => publicar.mutate(false)}
              className="rounded-2xl border-2 border-border p-5 text-left hover:border-primary"
            >
              <span className="block text-xl font-bold">🔒 Somente para mim</span>
              <span className="block text-base text-muted-foreground">
                Apenas você poderá acessar.
              </span>
            </button>
            <button
              type="button"
              onClick={() => publicar.mutate(true)}
              className="rounded-2xl border-2 border-border p-5 text-left hover:border-primary"
            >
              <span className="block text-xl font-bold">🌎 Compartilhar com outras pessoas</span>
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
