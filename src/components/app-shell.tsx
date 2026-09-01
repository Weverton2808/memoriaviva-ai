import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Home, Plus, User } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";

interface Props {
  children: ReactNode;
  /** Esconde a navegação inferior (telas de conversa e fluxo de criação). */
  semNavegacao?: boolean;
  /** Largura máxima confortável no desktop. */
  largura?: "estreita" | "larga";
}

/** Estrutura padrão: topo com marca, conteúdo centralizado e navegação inferior. */
export function AppShell({ children, semNavegacao, largura = "estreita" }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <Link to="/" aria-label="Ir para o início">
            <Logo />
          </Link>
          <Link
            to="/perfil"
            aria-label="Abrir meu perfil"
            className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors hover:bg-primary/15"
          >
            <User className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main
        className={`mx-auto w-full flex-1 px-4 pt-6 ${
          semNavegacao ? "pb-8" : "pb-28"
        } ${largura === "larga" ? "max-w-5xl" : "max-w-3xl"}`}
      >
        {children}
      </main>

      {!semNavegacao && <BottomNav />}
    </div>
  );
}

const ITENS = [
  { to: "/", label: "Início", icon: Home },
  { to: "/explorar", label: "Explorar", icon: Compass },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/98 backdrop-blur"
    >
      <div className="mx-auto grid w-full max-w-3xl grid-cols-4 items-end gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <NavItem {...ITENS[0]} ativo={pathname === "/"} />

        <Link
          to="/criar"
          className="flex flex-col items-center gap-1 rounded-2xl px-1 py-1 text-primary"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Plus className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold">Criar</span>
        </Link>

        <NavItem {...ITENS[1]} ativo={pathname.startsWith("/explorar")} />
        <NavItem {...ITENS[2]} ativo={pathname.startsWith("/perfil")} />
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  ativo,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  ativo: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex min-h-12 flex-col items-center justify-end gap-1 rounded-2xl px-1 py-2 text-xs font-semibold transition-colors ${
        ativo ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
      aria-current={ativo ? "page" : undefined}
    >
      <Icon className="size-6" aria-hidden="true" />
      {label}
    </Link>
  );
}
