import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Protegido } from "@/components/protegido";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { deleteMyAccount } from "@/lib/conta.functions";
import { mensagemDeErro } from "@/lib/erros";
import { atualizarPerfil, sair } from "@/services/authService";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Memória Viva" },
      { name: "description", content: "Ajuste seu nome, tamanho da letra e saia da sua conta." },
      { property: "og:title", content: "Configurações — Memória Viva" },
      { property: "og:description", content: "Preferências da sua conta no Memória Viva." },
    ],
  }),
  component: () => (
    <Protegido>
      <Configuracoes />
    </Protegido>
  ),
});

function Configuracoes() {
  const { user, profile, recarregarPerfil } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [letraGrande, setLetraGrande] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => setNome(profile?.name ?? ""), [profile?.name]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("mv-letra-grande", letraGrande);
  }, [letraGrande]);

  async function salvar() {
    if (!user) return;
    setSalvando(true);
    try {
      await atualizarPerfil(user.id, { name: nome.trim() || "Você" });
      await recarregarPerfil();
      toast.success("Nome atualizado.");
    } catch (e) {
      toast.error(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell>
      <h1 className="text-3xl">Configurações</h1>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl">Seus dados</h2>
        <label htmlFor="nome" className="mt-4 block text-lg font-semibold">
          Nome
        </label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-2 h-14 rounded-2xl text-lg"
        />
        <p className="mt-3 text-base text-muted-foreground">{user?.email}</p>
        <Button
          className="mt-4 h-14 w-full rounded-2xl text-lg font-bold"
          disabled={salvando}
          onClick={() => void salvar()}
        >
          {salvando ? "Salvando…" : "Salvar"}
        </Button>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl">Leitura</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Aumente o tamanho das letras se ficar mais confortável para você.
        </p>
        <Button
          variant="outline"
          className="mt-4 h-14 w-full rounded-2xl text-lg"
          aria-pressed={letraGrande}
          onClick={() => setLetraGrande((v) => !v)}
        >
          {letraGrande ? "Voltar ao tamanho normal" : "Aumentar tamanho da letra"}
        </Button>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl">Conta</h2>
        <Button
          variant="outline"
          className="mt-4 h-14 w-full rounded-2xl text-lg text-destructive"
          onClick={() => {
            void (async () => {
              try {
                await sair();
                toast.success("Você saiu da sua conta.");
                void navigate({ to: "/" });
              } catch (e) {
                toast.error(mensagemDeErro(e));
              }
            })();
          }}
        >
          <LogOut className="size-5" aria-hidden="true" />
          Sair da conta
        </Button>
      </section>
    </AppShell>
  );
}
