// Organização do conhecimento: transforma a conversa em um guia estruturado.
// Simulação funcional; a mesma assinatura será usada pela IA real.

import { getCategoria } from "@/data/categorias";
import type { KnowledgeArticle, KnowledgeSession, Message, Secao } from "@/types";
import { uid } from "@/services/db";

export const ETAPAS_GERACAO = [
  "Organizando suas ideias",
  "Identificando conhecimentos importantes",
  "Criando o guia passo a passo",
  "Reunindo dicas e experiências",
  "Identificando erros comuns",
];

const TITULOS = [
  "Resumo",
  "Introdução",
  "O que aprendi",
  "Conhecimentos principais",
  "Guia passo a passo",
  "Erros mais comuns",
  "Exemplos reais",
  "Dicas importantes",
  "Conselhos para iniciantes",
  "Conclusão",
];

function frases(texto: string) {
  return texto
    .split(/(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

function tituloGuia(sessao: KnowledgeSession, respostas: string[]) {
  const base = sessao.topic.replace(/\s+/g, " ").trim();
  const curto = base.length > 70 ? `${base.slice(0, 67)}…` : base;
  const primeira = frases(respostas[0] ?? "")[0];
  if (sessao.category === "receita") return `Como fazer: ${curto}`;
  if (sessao.category === "historia") return curto;
  if (sessao.category === "experiencia") return `O que aprendi: ${curto}`;
  return primeira && primeira.length < 60 ? `${curto}` : `Como ${curto.toLowerCase()}`;
}

/** Gera o guia final a partir da sessão e das mensagens da conversa. */
export function gerarGuia(
  sessao: KnowledgeSession,
  mensagens: Message[],
  autor: string,
  userId: string | null,
): KnowledgeArticle {
  const respostas = mensagens.filter((m) => m.role === "user").map((m) => m.content.trim());
  const cat = getCategoria(sessao.category);
  const n = respostas.length;
  const fatia = (a: number, b: number) => respostas.slice(a, b).filter(Boolean).join("\n\n");

  const blocos: string[] = [
    // Resumo
    `${autor} compartilhou sua experiência sobre ${sessao.topic.toLowerCase()}. Este guia reúne, em ${cat.nome.toLowerCase()}, o que foi contado ao longo de ${n} respostas: o começo, o passo a passo, os erros mais comuns e os conselhos para quem está começando.`,
    // Introdução
    sessao.topic,
    // O que aprendi
    fatia(0, 1),
    // Conhecimentos principais
    fatia(1, 2),
    // Guia passo a passo
    fatia(2, Math.max(4, Math.floor(n * 0.5))),
    // Erros mais comuns
    fatia(Math.max(4, Math.floor(n * 0.5)), Math.max(5, Math.floor(n * 0.65))),
    // Exemplos reais
    fatia(Math.max(5, Math.floor(n * 0.65)), Math.max(6, Math.floor(n * 0.8))),
    // Dicas importantes
    fatia(Math.max(6, Math.floor(n * 0.8)), n - 1),
    // Conselhos para iniciantes
    respostas[n - 1] ?? "",
    // Conclusão
    `Esta experiência foi preservada por ${autor} no Memória Viva. O que uma pessoa aprende ao longo da vida pode continuar ajudando outras pessoas no futuro.`,
  ];

  const content: Secao[] = TITULOS.map((titulo, i) => ({
    id: uid(),
    titulo,
    texto: (blocos[i] ?? "").trim(),
  })).filter((s) => s.texto.length > 0);

  const agora = new Date().toISOString();

  return {
    id: uid(),
    user_id: userId,
    session_id: sessao.id,
    title: tituloGuia(sessao, respostas),
    summary:
      frases(respostas[0] ?? "")[0]?.slice(0, 180) ||
      `Experiência sobre ${sessao.topic.toLowerCase()}, contada por ${autor}.`,
    content,
    category: sessao.category,
    is_public: false,
    created_at: agora,
    updated_at: agora,
    author_name: autor,
  };
}

/** Tempo aproximado de leitura, em minutos. */
export function tempoLeitura(artigo: KnowledgeArticle) {
  const palavras = artigo.content
    .map((s) => s.texto)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 180));
}
