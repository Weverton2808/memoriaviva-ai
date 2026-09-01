import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { getPerfil } from "@/services/authService";
import type { Profile } from "@/types";

interface AuthContexto {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  carregando: boolean;
  recarregarPerfil: () => Promise<void>;
}

const Contexto = createContext<AuthContexto>({
  user: null,
  session: null,
  profile: null,
  carregando: true,
  recarregarPerfil: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nova) => {
      if (!ativo) return;
      setSession(nova);
      setCarregando(false);
      if (!nova) setProfile(null);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSession(data.session);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    void getPerfil(userId)
      .then((p) => {
        if (ativo) setProfile(p);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [userId]);

  async function recarregarPerfil() {
    if (!userId) return;
    setProfile(await getPerfil(userId));
  }

  return (
    <Contexto.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        carregando,
        recarregarPerfil,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAuth() {
  return useContext(Contexto);
}
