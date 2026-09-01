// Mensagens da conversa. Cada mensagem pertence a uma sessão (RLS garante o dono).

import { supabase } from "@/integrations/supabase/client";
import type { Message, MessageRole } from "@/types";

export async function listarMensagens(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, session_id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

/** Salva a mensagem ANTES de pedir qualquer coisa para a IA. */
export async function adicionarMensagem(
  sessionId: string,
  role: MessageRole,
  content: string,
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ session_id: sessionId, role, content })
    .select("id, session_id, role, content, created_at")
    .single();
  if (error) throw error;
  return data as Message;
}
