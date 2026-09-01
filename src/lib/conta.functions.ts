// Exclusão de conta (servidor).
//
// A remoção do usuário em auth.users é uma operação privilegiada: ela acontece
// somente aqui, no servidor, com a credencial de serviço carregada dentro do
// handler. Nada disso chega ao navegador.
//
// As tabelas do aplicativo referenciam auth.users com ON DELETE CASCADE, então
// apagar o usuário remove perfil, sessões, mensagens e guias. Mesmo assim
// apagamos explicitamente os dados do aplicativo antes, para não depender
// apenas do cascade e para nunca deixar conteúdo pessoal órfão.

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { confirmacao: string }) => {
    if (input?.confirmacao !== "EXCLUIR") throw new Error("CONFIRMACAO_INVALIDA");
    return input;
  })
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    // 1) Conteúdo do aplicativo, com o próprio usuário (RLS ativa).
    const guias = await supabase.from("knowledge_articles").delete().eq("user_id", userId);
    if (guias.error) {
      console.error("[conta] falha ao apagar guias", guias.error.message);
      throw new Error("EXCLUSAO_FALHOU");
    }

    // As mensagens saem por cascade da sessão.
    const sessoes = await supabase.from("knowledge_sessions").delete().eq("user_id", userId);
    if (sessoes.error) {
      console.error("[conta] falha ao apagar sessões", sessoes.error.message);
      throw new Error("EXCLUSAO_FALHOU");
    }

    // 2) Perfil e usuário de autenticação (privilegiado, só no servidor).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const perfil = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (perfil.error) {
      console.error("[conta] falha ao apagar perfil", perfil.error.message);
      throw new Error("EXCLUSAO_FALHOU");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("[conta] falha ao apagar usuário de autenticação", error.message);
      throw new Error("EXCLUSAO_FALHOU");
    }

    return { ok: true as const };
  });
