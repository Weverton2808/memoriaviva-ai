// Tipos do Memória Viva.
// Espelham exatamente as tabelas preparadas no Supabase (supabase/schema.sql):
// profiles, knowledge_sessions, messages, knowledge_articles.

export type CategoriaId =
  | "profissao"
  | "habilidade"
  | "experiencia"
  | "historia"
  | "receita"
  | "conselho"
  | "outro";

export type SessionStatus = "active" | "completed" | "archived";
export type MessageRole = "user" | "assistant";

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface KnowledgeSession {
  id: string;
  user_id: string | null;
  category: CategoriaId;
  topic: string;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  // Preparado para expansão futura (voz, imagens, anexos):
  attachment_url?: string | null;
  attachment_type?: "audio" | "image" | "file" | null;
}

/** Uma seção do guia final. No banco vive dentro de `content` (JSON). */
export interface Secao {
  id: string;
  titulo: string;
  texto: string;
}

export interface KnowledgeArticle {
  id: string;
  user_id: string | null;
  session_id: string | null;
  title: string;
  summary: string;
  /** No banco: coluna `content` (texto JSON com as seções). */
  content: Secao[];
  category: CategoriaId;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  /** Derivado do perfil do autor; exibido nos cards e no guia. */
  author_name: string;
}
