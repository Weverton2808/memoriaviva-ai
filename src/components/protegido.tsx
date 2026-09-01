import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";

/**
 * Envolve as telas que só fazem sentido com uma conta.
 * Enquanto verificamos a sessão, mostramos uma mensagem calma —
 * nunca uma tela em branco.
 */
export function Protegido({ children }: { children: ReactNode }) {
  const { user, carregando } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!carregando && !user) void navigate({ to: "/entrar" });
  }, [carregando, user, navigate]);

  if (carregando || !user) {
    return (
      <p className="py-24 text-center text-lg text-muted-foreground">Um instante…</p>
    );
  }

  return <>{children}</>;
}
