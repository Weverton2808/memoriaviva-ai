// Autenticação (Lovable Cloud / Supabase Auth).
// Toda a comunicação usa o cliente do navegador; nenhuma chave secreta aqui.

import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types";

export async function cadastrar(email: string, senha: string, nome: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { name: nome },
      emailRedirectTo: `${window.location.origin}/entrar`,
    },
  });
  if (error) throw error;
  return data;
}

export async function entrar(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

/** Login com Google (gerenciado pelo Lovable Cloud). */
export async function entrarComGoogle() {
  const resultado = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });
  if (resultado.error) throw new Error(resultado.error.message ?? "Falha no login com Google.");
  return resultado;
}

export async function sair() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function recuperarSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/entrar`,
  });
  if (error) throw error;
}

export async function getPerfil(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function atualizarPerfil(
  userId: string,
  patch: { name?: string; avatar_url?: string | null },
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id, name, avatar_url, created_at, updated_at")
    .single();
  if (error) throw error;
  return data as Profile;
}
