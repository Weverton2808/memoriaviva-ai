import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { loadStore, saveStore } from "@/lib/memoria";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Memória Viva" },
      {
        name: "description",
        content:
          "Acesse sua conta na Memória Viva para guardar suas conversas e publicar os conhecimentos que você compartilhou.",
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
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
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
    //   ? supabase.auth.signUp({ email, password: senha,
    //       options: { data: { full_name: nome }, emailRedirectTo: window.location.origin } })
    //   : supabase.auth.signInWithPassword({ email, password: senha })
    const perfil = { name: nome || loadStore().profile?.name || "Você", email };
    saveStore({ profile: perfil });
    navigate({ to: "/nova" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="paper flex-1">
        <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <h1 className="text-3xl font-semibold sm:text-4xl">
              {modo === "entrar" ? "Bem-vindo de volta" : "Criar sua conta"}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              É rápido. Precisamos apenas do seu e-mail e de uma senha.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-2">
              {(["entrar", "cadastrar"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModo(m)}
                  className={`rounded-xl px-4 py-3 text-lg font-bold transition-colors ${
                    modo === m
                      ? "bg-primary text-primary-foreground"
                      : "text-secondary-foreground hover:bg-background/60"
                  }`}
                >
                  {m === "entrar" ? "Já tenho conta" : "Sou novo aqui"}
                </button>
              ))}
            </div>

            <form onSubmit={enviar} className="mt-8 space-y-6">
              {modo === "cadastrar" && (
                <Campo
                  id="nome"
                  label="Como podemos te chamar?"
                  value={nome}
                  onChange={setNome}
                  placeholder="Dona Aparecida"
                />
              )}
              <Campo
                id="email"
                type="email"
                label="Seu e-mail"
                value={email}
                onChange={setEmail}
                placeholder="voce@email.com"
              />
              <Campo
                id="senha"
                type="password"
                label="Sua senha"
                value={senha}
                onChange={setSenha}
                placeholder="pelo menos 6 caracteres"
              />

              {erro && (
                <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-lg text-destructive">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-8 py-5 text-xl font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01]"
              >
                {modo === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <p className="mt-6 text-base text-muted-foreground">
              Autenticação preparada para o Lovable Cloud: ao ativar o backend, este formulário passa
              a usar contas reais, com recuperação de senha por e-mail.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border-2 border-input bg-background px-5 py-4 text-xl text-foreground placeholder:text-muted-foreground/70"
      />
    </div>
  );
}
