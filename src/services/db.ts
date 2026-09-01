// Camada de dados local do MVP.
//
// Guarda tudo em localStorage usando exatamente o formato das tabelas do Supabase.
// Quando o backend real for ligado, cada função abaixo vira uma chamada de server
// function; a interface do aplicativo não precisa mudar.

import { ARTIGOS_DEMO } from "@/data/demo";
import type {
  KnowledgeArticle,
  KnowledgeSession,
  Message,
  Profile,
  Secao,
  SessionStatus,
} from "@/types";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const CHAVE = "memoria-viva:v2";

interface Banco {
  profile: Profile | null;
  knowledge_sessions: KnowledgeSession[];
  messages: Message[];
  knowledge_articles: KnowledgeArticle[];
}

const VAZIO: Banco = {
  profile: null,
  knowledge_sessions: [],
  messages: [],
  knowledge_articles: [],
};

const ouvintes = new Set<() => void>();

function ler(): Banco {
  if (typeof window === "undefined") return VAZIO;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    return { ...VAZIO, ...(JSON.parse(bruto) as Banco) };
  } catch {
    return VAZIO;
  }
}

function escrever(patch: Partial<Banco>) {
  if (typeof window === "undefined") return;
  const atual = ler();
  window.localStorage.setItem(CHAVE, JSON.stringify({ ...atual, ...patch }));
  ouvintes.forEach((f) => f());
}

export function inscrever(f: () => void) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

/* --------------------------------- Perfil --------------------------------- */

export const getPerfil = () => ler().profile;

export function salvarPerfil(name: string, avatar_url: string | null = null): Profile {
  const atual = ler().profile;
  const profile: Profile = atual
    ? { ...atual, name, avatar_url }
    : { id: uid(), name, avatar_url, created_at: new Date().toISOString() };
  escrever({ profile });
  return profile;
}

export function sair() {
  escrever({ profile: null });
}

/* -------------------------------- Sessões -------------------------------- */

export function criarSessao(
  category: KnowledgeSession["category"],
  topic: string,
): KnowledgeSession {
  const agora = new Date().toISOString();
  const sessao: KnowledgeSession = {
    id: uid(),
    user_id: ler().profile?.id ?? null,
    category,
    topic,
    status: "active",
    created_at: agora,
    updated_at: agora,
  };
  escrever({ knowledge_sessions: [sessao, ...ler().knowledge_sessions] });
  return sessao;
}

export const getSessao = (id: string) =>
  ler().knowledge_sessions.find((s) => s.id === id) ?? null;

export function atualizarStatusSessao(id: string, status: SessionStatus) {
  escrever({
    knowledge_sessions: ler().knowledge_sessions.map((s) =>
      s.id === id ? { ...s, status, updated_at: new Date().toISOString() } : s,
    ),
  });
}

/* ------------------------------- Mensagens ------------------------------- */

export const listarMensagens = (session_id: string) =>
  ler().messages.filter((m) => m.session_id === session_id);

export function adicionarMensagem(
  session_id: string,
  role: Message["role"],
  content: string,
): Message {
  const mensagem: Message = {
    id: uid(),
    session_id,
    role,
    content,
    created_at: new Date().toISOString(),
  };
  escrever({ messages: [...ler().messages, mensagem] });
  return mensagem;
}

/* -------------------------------- Guias ---------------------------------- */

export function salvarArtigo(artigo: KnowledgeArticle) {
  const existentes = ler().knowledge_articles;
  const jaExiste = existentes.some((a) => a.id === artigo.id);
  escrever({
    knowledge_articles: jaExiste
      ? existentes.map((a) => (a.id === artigo.id ? artigo : a))
      : [artigo, ...existentes],
  });
  return artigo;
}

export function atualizarArtigo(
  id: string,
  patch: Partial<Pick<KnowledgeArticle, "title" | "summary" | "is_public">> & {
    content?: Secao[];
  },
) {
  escrever({
    knowledge_articles: ler().knowledge_articles.map((a) =>
      a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a,
    ),
  });
}

export function excluirArtigo(id: string) {
  escrever({ knowledge_articles: ler().knowledge_articles.filter((a) => a.id !== id) });
}

export const listarMeusArtigos = () => ler().knowledge_articles;

export const getArtigo = (id: string): KnowledgeArticle | null =>
  ler().knowledge_articles.find((a) => a.id === id) ??
  ARTIGOS_DEMO.find((a) => a.id === id) ??
  null;

/** Conhecimentos públicos: exemplos fictícios + os que a pessoa publicou. */
export const listarPublicos = (): KnowledgeArticle[] => [
  ...ler().knowledge_articles.filter((a) => a.is_public),
  ...ARTIGOS_DEMO,
];
