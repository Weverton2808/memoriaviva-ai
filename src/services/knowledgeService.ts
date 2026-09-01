// Sessões de conhecimento e guias (knowledge_sessions / knowledge_articles).
// Todas as leituras e escritas passam pelas regras de segurança do banco (RLS).

import { supabase } from "@/integrations/supabase/client";
import type {
  CategoriaId,
  KnowledgeArticle,
  KnowledgeSession,
  Secao,
  SessionStatus,
} from "@/types";

/* ------------------------------- Sessões -------------------------------- */

const CAMPOS_SESSAO = "id, user_id, category, topic, status, created_at, updated_at";

export async function criarSessao(
  userId: string,
  category: CategoriaId,
  topic = "",
): Promise<KnowledgeSession> {
  const { data, error } = await supabase
    .from("knowledge_sessions")
    .insert({ user_id: userId, category, topic, status: "draft" })
    .select(CAMPOS_SESSAO)
    .single();
  if (error) throw error;
  return data as KnowledgeSession;
}

export async function atualizarSessao(
  id: string,
  patch: { category?: CategoriaId; topic?: string; status?: SessionStatus },
): Promise<KnowledgeSession> {
  const { data, error } = await supabase
    .from("knowledge_sessions")
    .update(patch)
    .eq("id", id)
    .select(CAMPOS_SESSAO)
    .single();
  if (error) throw error;
  return data as KnowledgeSession;
}

export async function getSessao(id: string): Promise<KnowledgeSession | null> {
  const { data, error } = await supabase
    .from("knowledge_sessions")
    .select(CAMPOS_SESSAO)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as KnowledgeSession | null) ?? null;
}

/* -------------------------------- Guias --------------------------------- */

const CAMPOS_ARTIGO =
  "id, user_id, session_id, title, summary, content, category, is_public, created_at, updated_at, profiles(name)";

interface LinhaArtigo extends Omit<KnowledgeArticle, "content" | "author_name"> {
  content: unknown;
  profiles?: { name: string } | null;
}

function paraArtigo(linha: LinhaArtigo): KnowledgeArticle {
  return {
    ...linha,
    content: Array.isArray(linha.content) ? (linha.content as Secao[]) : [],
    author_name: linha.profiles?.name ?? "Alguém",
  };
}

export async function getArtigo(id: string): Promise<KnowledgeArticle | null> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(CAMPOS_ARTIGO)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? paraArtigo(data as unknown as LinhaArtigo) : null;
}

export async function getArtigoDaSessao(sessionId: string): Promise<KnowledgeArticle | null> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(CAMPOS_ARTIGO)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? paraArtigo(data as unknown as LinhaArtigo) : null;
}

export async function listarMeusArtigos(userId: string): Promise<KnowledgeArticle[]> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(CAMPOS_ARTIGO)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as LinhaArtigo[]).map(paraArtigo);
}

/** Explorar: apenas guias públicos, com busca simples por título e resumo. */
export async function listarPublicos(filtros?: {
  categoria?: CategoriaId | "todas";
  busca?: string;
}): Promise<KnowledgeArticle[]> {
  let consulta = supabase
    .from("knowledge_articles")
    .select(CAMPOS_ARTIGO)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (filtros?.categoria && filtros.categoria !== "todas") {
    consulta = consulta.eq("category", filtros.categoria);
  }
  const busca = filtros?.busca?.trim();
  if (busca) {
    const t = busca.replace(/[%,()]/g, " ");
    consulta = consulta.or(`title.ilike.%${t}%,summary.ilike.%${t}%`);
  }

  const { data, error } = await consulta;
  if (error) throw error;
  return ((data ?? []) as unknown as LinhaArtigo[]).map(paraArtigo);
}

export async function atualizarArtigo(
  id: string,
  patch: { title?: string; summary?: string; content?: Secao[]; is_public?: boolean },
): Promise<KnowledgeArticle> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .update(patch as never)
    .eq("id", id)
    .select(CAMPOS_ARTIGO)
    .single();
  if (error) throw error;
  return paraArtigo(data as unknown as LinhaArtigo);
}

export async function excluirArtigo(id: string) {
  const { error } = await supabase.from("knowledge_articles").delete().eq("id", id);
  if (error) throw error;
}
