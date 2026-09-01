import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { salvarPerfil } from "@/services/db";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Memória Viva" },
      {
        name: "description",
        content:
          "Acesse sua conta na Memória Viva para guardar suas conversas e os conhecimentos que você registrou.",
      },
      { property: "og:title", content: "Entrar ou criar conta — Memória Viva" },
      {
        property: "og:description",
        content: "Acesse sua conta para guardar conversas e conhecimentos.",
      },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("cadastrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || senha.length < 6) {
      setErro("Confira o e-mail e use uma senha com pelo menos 6 letras ou números.");
      return;
    }
    // Preparado para Supabase Auth:
    // modo === "cadastrar"
    //   ? supabase.auth.signUp({ email, password: senha, options: { data: { name: nome } } })
    //   : supabase.auth.signInWithPassword({ email, password: senha })
    salvarPerfil(nome.trim() || "Você");
    void navigate({ to: "/criar" });
  }

  return (
    <AppShell semNavegacao>
      <div className="mx-auto max-w-md py-6">
        <h1 className="text-3xl sm:text-4xl">
          {modo === "entrar" ? "Bem-vindo de volta" : "Criar sua conta"}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          É simples: precisamos apenas do seu nome, e-mail e uma senha.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-2">
          {(["entrar", "cadastrar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              aria-pressed={modo === m}
              className={`min-h-12 rounded-xl px-4 py-3 text-lg font-bold transition-colors ${
                modo === m ? "bg-primary text-primary-foreground" : "hover:bg-background/70"
              }`}
            >
              {m === "entrar" ? "Já tenho conta" : "Sou novo aqui"}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="mt-8 space-y-5">
          {modo === "cadastrar" && (
            <div>
              <label htmlFor="nome" className="block text-lg font-semibold">
                Como podemos te chamar?
              </label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Dona Aparecida"
                className="mt-2 h-14 rounded-2xl text-lg"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-lg font-semibold">
              Seu e-mail
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="mt-2 h-14 rounded-2xl text-lg"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-lg font-semibold">
              Sua senha
            </label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="pelo menos 6 caracteres"
              className="mt-2 h-14 rounded-2xl text-lg"
            />
          </div>

          {erro && (
            <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-lg text-destructive">
              {erro}
            </p>
          )}

          <Button type="submit" size="lg" className="h-14 w-full rounded-2xl text-lg font-bold">
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-base text-muted-foreground">
          Estrutura pronta para contas reais: ao ligar o backend, este formulário passa a usar login
          com e-mail, senha e recuperação por e-mail.
        </p>
      </div>
    </AppShell>
  );
}
