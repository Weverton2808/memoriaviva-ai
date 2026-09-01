import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePerfil } from "@/hooks/use-db";
import { sair, salvarPerfil } from "@/services/db";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Memória Viva" },
      { name: "description", content: "Ajuste seu nome, tamanho da letra e saia da sua conta." },
      { property: "og:title", content: "Configurações — Memória Viva" },
      { property: "og:description", content: "Preferências da sua conta no Memória Viva." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const perfil = usePerfil();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [letraGrande, setLetraGrande] = useState(false);

  useEffect(() => setNome(perfil?.name ?? ""), [perfil?.name]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("mv-letra-grande", letraGrande);
  }, [letraGrande]);

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
        <Button
          className="mt-4 h-14 w-full rounded-2xl text-lg font-bold"
          onClick={() => {
            salvarPerfil(nome.trim() || "Você", perfil?.avatar_url ?? null);
            toast.success("Nome atualizado.");
          }}
        >
          Salvar
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
            sair();
            toast.success("Você saiu da sua conta.");
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-5" aria-hidden="true" />
          Sair da conta
        </Button>
      </section>
    </AppShell>
  );
}
