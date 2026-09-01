import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHidratado } from "@/hooks/use-db";
import { atualizarArtigo, getArtigo, uid } from "@/services/db";
import type { KnowledgeArticle, Secao } from "@/types";

export const Route = createFileRoute("/guia/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar guia — Memória Viva" },
      { name: "description", content: "Ajuste o texto do seu guia com suas próprias palavras." },
      { property: "og:title", content: "Editar guia — Memória Viva" },
      { property: "og:description", content: "Ajuste títulos, seções e observações do seu guia." },
    ],
  }),
  component: Editar,
});

function Editar() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const hidratado = useHidratado();
  const [artigo, setArtigo] = useState<KnowledgeArticle | null>(null);
  const [titulo, setTitulo] = useState("");
  const [secoes, setSecoes] = useState<Secao[]>([]);

  useEffect(() => {
    if (!hidratado) return;
    const a = getArtigo(id);
    if (!a) {
      void navigate({ to: "/perfil" });
      return;
    }
    setArtigo(a);
    setTitulo(a.title);
    setSecoes(a.content);
  }, [hidratado, id, navigate]);

  if (!artigo) {
    return (
      <AppShell>
        <p className="py-16 text-center text-lg text-muted-foreground">Carregando…</p>
      </AppShell>
    );
  }

  function salvar() {
    atualizarArtigo(id, { title: titulo.trim() || "Meu conhecimento", content: secoes });
    toast.success("Alterações salvas.");
    void navigate({ to: "/guia/$id", params: { id } });
  }

  return (
    <AppShell semNavegacao>
      <h1 className="text-3xl">Editar guia</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Ajuste o texto do jeito que ficar melhor para você.
      </p>

      <label htmlFor="titulo" className="mt-6 block text-lg font-semibold">
        Título
      </label>
      <Input
        id="titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="mt-2 h-14 rounded-2xl text-lg"
      />

      <div className="mt-8 space-y-6 pb-28">
        {secoes.map((s, i) => (
          <section key={s.id} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Input
                aria-label={`Título da seção ${i + 1}`}
                value={s.titulo}
                onChange={(e) =>
                  setSecoes(secoes.map((x) => (x.id === s.id ? { ...x, titulo: e.target.value } : x)))
                }
                className="h-12 rounded-xl text-lg font-bold"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 text-destructive"
                aria-label={`Excluir seção ${s.titulo}`}
                onClick={() => setSecoes(secoes.filter((x) => x.id !== s.id))}
              >
                <Trash2 className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <Textarea
              aria-label={`Texto da seção ${s.titulo}`}
              value={s.texto}
              onChange={(e) =>
                setSecoes(secoes.map((x) => (x.id === s.id ? { ...x, texto: e.target.value } : x)))
              }
              className="mt-3 min-h-36 rounded-2xl text-lg"
            />
          </section>
        ))}

        <Button
          variant="outline"
          size="lg"
          className="h-14 w-full rounded-2xl text-lg"
          onClick={() =>
            setSecoes([...secoes, { id: uid(), titulo: "Observação", texto: "" }])
          }
        >
          Adicionar uma observação
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          <Button onClick={salvar} size="lg" className="h-14 w-full rounded-2xl text-lg font-bold">
            Salvar alterações
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
