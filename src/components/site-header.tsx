import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadStore } from "@/lib/memoria";

const links = [
  { to: "/", label: "Início" },
  { to: "/nova", label: "Contar" },
  { to: "/explorar", label: "Explorar" },
] as const;

export function SiteHeader() {
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    setNome(loadStore().profile?.name ?? null);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-xl text-primary-foreground">
            ✦
          </span>
          <span className="truncate font-display text-xl font-semibold sm:text-2xl">
            Memória Viva
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="rounded-xl px-3 py-2 text-base font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:px-4 sm:text-lg"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/entrar"
            className="ml-1 rounded-xl bg-primary px-3 py-2 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4 sm:text-lg"
          >
            {nome ? nome.split(" ")[0] : "Entrar"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-10 text-base text-muted-foreground sm:px-6">
        <p className="font-display text-xl text-foreground">Memória Viva</p>
        <p className="mt-2 max-w-2xl">
          Um lugar para guardar o que só existe na lembrança de quem viveu. Conversas em texto hoje;
          em breve, também por voz.
        </p>
      </div>
    </footer>
  );
}
