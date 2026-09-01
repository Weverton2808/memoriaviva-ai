import type { CategoriaId } from "@/types";

export interface Categoria {
  id: CategoriaId;
  emoji: string;
  nome: string;
  descricao: string;
  /** Rótulo curto usado no topo do guia. */
  rotulo: string;
}

export const CATEGORIAS: Categoria[] = [
  {
    id: "profissao",
    emoji: "🔧",
    nome: "Profissão",
    descricao: "Algo que aprendi trabalhando.",
    rotulo: "PROFISSÃO",
  },
  {
    id: "habilidade",
    emoji: "🛠️",
    nome: "Habilidade",
    descricao: "Algo que sei fazer.",
    rotulo: "HABILIDADE",
  },
  {
    id: "experiencia",
    emoji: "❤️",
    nome: "Experiência de vida",
    descricao: "Algo que aprendi vivendo.",
    rotulo: "EXPERIÊNCIA DE VIDA",
  },
  {
    id: "historia",
    emoji: "📖",
    nome: "História",
    descricao: "Uma história que merece ser preservada.",
    rotulo: "HISTÓRIA",
  },
  {
    id: "receita",
    emoji: "🍳",
    nome: "Receita",
    descricao: "Uma receita ou tradição.",
    rotulo: "RECEITA",
  },
  {
    id: "conselho",
    emoji: "💬",
    nome: "Conselho",
    descricao: "Algo que pode ajudar outras pessoas.",
    rotulo: "CONSELHO",
  },
  {
    id: "outro",
    emoji: "✨",
    nome: "Outro",
    descricao: "Escreva com suas palavras o que deseja compartilhar.",
    rotulo: "CONHECIMENTO",
  },
];

export const getCategoria = (id: CategoriaId | string): Categoria =>
  CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1]!;

/** Filtros temáticos usados na tela Explorar. */
export const TEMAS_EXPLORAR = [
  "Tecnologia",
  "Mecânica",
  "Construção",
  "Culinária",
  "Agricultura",
  "Profissões",
  "Experiências de vida",
  "Histórias",
  "Outros",
] as const;
