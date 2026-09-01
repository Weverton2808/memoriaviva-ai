// Entrevistadora simulada do Memória Viva.
//
// Nesta versão do MVP as perguntas são geradas localmente, de forma dinâmica,
// a partir do que a pessoa escreve, seguindo as fases e regras do prompt mestre
// (ver prompt-entrevistadora.ts). A assinatura das funções foi desenhada para
// que a troca por uma IA real (Lovable AI Gateway) não exija mudanças na interface.

import type { CategoriaId, Message } from "@/types";

// Reexportado para o futuro backend (IA real) usar o mesmo prompt mestre.
export { montarSystemPrompt, montarPromptGuia } from "@/services/prompt-entrevistadora";

export const MIN_PERGUNTAS = 8;
export const MAX_PERGUNTAS = 15;

const ABERTURA: Record<CategoriaId, string[]> = {
  profissao: [
    "Como você começou nesse trabalho? Quem te ensinou as primeiras coisas?",
    "Qual é a parte do serviço que mais exige experiência de quem faz?",
    "Me conta um problema que você aprendeu a identificar rapidamente com o tempo.",
  ],
  habilidade: [
    "Como você aprendeu a fazer isso?",
    "O que é preciso ter em mãos para começar?",
    "Me explica o passo a passo, como se eu nunca tivesse feito.",
  ],
  experiencia: [
    "O que aconteceu que te ensinou isso?",
    "O que foi mais difícil nessa época?",
    "O que você faria diferente hoje?",
  ],
  historia: [
    "Onde e quando essa história começa?",
    "Quem são as pessoas mais importantes dessa história?",
    "Como era o dia a dia nesse tempo?",
  ],
  receita: [
    "Quem te ensinou essa receita?",
    "Quais são os ingredientes e as quantidades que você usa?",
    "Como é o preparo, do começo até ficar pronto?",
  ],
  conselho: [
    "Para quem esse conselho é mais importante?",
    "O que te fez aprender isso?",
    "O que costuma acontecer com quem não segue esse caminho?",
  ],
  outro: [
    "Me conta um pouco mais sobre como você aprendeu isso.",
    "O que é preciso saber antes de começar?",
    "Como é o passo a passo do seu jeito de fazer?",
  ],
};

const APROFUNDAMENTO = [
  "Você poderia dar um exemplo concreto de uma vez em que isso aconteceu?",
  "Qual é o erro mais comum de quem está começando?",
  "Como você percebe que está no ponto certo? Tem algum sinal?",
  "Qual foi a maior dificuldade e como você resolveu?",
  "Tem algum truque que só quem faz há muito tempo conhece?",
  "Existe algo nessa área que ninguém ensina e só se aprende na prática?",
  "Que cuidado é preciso ter para não estragar o trabalho ou se machucar?",
  "Se faltar algum material ou recurso, dá para substituir por outra coisa?",
  "Quanto tempo isso costuma levar? Dá para apressar?",
  "Que dica você gostaria de ter recebido quando começou?",
];

const FECHAMENTO = [
  "Estamos chegando ao fim. O que você não gostaria que as pessoas esquecessem sobre isso?",
  "Para encerrar: que conselho você deixaria para quem vai começar agora?",
];

const IGNORAR = new Set([
  "porque",
  "quando",
  "também",
  "sempre",
  "depois",
  "grande",
  "pessoa",
  "pessoas",
  "coisas",
  "aquilo",
  "conseguia",
  "trabalhando",
]);

function palavraChave(texto: string) {
  const palavras = texto
    .toLowerCase()
    .replace(/[.,;:!?"]/g, "")
    .split(/\s+/)
    .filter((p) => p.length > 5 && !IGNORAR.has(p));
  return palavras[Math.floor(palavras.length / 2)] ?? "";
}

/** Respostas já dadas pela pessoa, em ordem. */
export const respostasDe = (mensagens: Message[]) =>
  mensagens.filter((m) => m.role === "user").map((m) => m.content);

/** Quantidade de perguntas que a entrevista deve ter, conforme a riqueza das respostas. */
export function totalPerguntas(respostas: string[]) {
  if (respostas.length === 0) return MIN_PERGUNTAS;
  const palavras = respostas.join(" ").split(/\s+/).filter(Boolean).length;
  const media = palavras / respostas.length;
  if (media > 45) return MAX_PERGUNTAS;
  if (media > 22) return 12;
  return MIN_PERGUNTAS;
}

export interface ProximaPergunta {
  pergunta: string;
  /** Momento de oferecer a criação do guia. */
  oferecerGuia: boolean;
}

/**
 * Gera a próxima pergunta da entrevista.
 * Uma pergunta por vez, curta, adaptada ao que já foi dito e sem repetição.
 */
export function proximaPergunta(
  categoria: CategoriaId,
  descricao: string,
  mensagens: Message[],
): ProximaPergunta {
  const respostas = respostasDe(mensagens);
  const feitas = mensagens.filter((m) => m.role === "assistant").length;
  const total = totalPerguntas(respostas);
  const abertura = ABERTURA[categoria] ?? ABERTURA.outro;

  if (feitas === 0) {
    const tema = palavraChave(descricao);
    const eco = tema ? `Você falou sobre ${tema}. ` : "";
    return {
      pergunta: `Obrigada por compartilhar. ${eco}${abertura[0]}`,
      oferecerGuia: false,
    };
  }

  if (feitas >= total - FECHAMENTO.length) {
    const i = Math.min(FECHAMENTO.length - 1, feitas - (total - FECHAMENTO.length));
    return { pergunta: FECHAMENTO[i]!, oferecerGuia: respostas.length >= MIN_PERGUNTAS };
  }

  if (feitas < abertura.length) {
    return { pergunta: abertura[feitas]!, oferecerGuia: false };
  }

  const ultima = respostas[respostas.length - 1] ?? "";
  const curta = ultima.trim().split(/\s+/).filter(Boolean).length < 12;
  const base = APROFUNDAMENTO[(feitas - abertura.length) % APROFUNDAMENTO.length]!;
  const chave = palavraChave(ultima);

  const pergunta = curta
    ? `Entendi. Pode me contar um pouco mais? ${base}`
    : chave
      ? `Você mencionou "${chave}". ${base}`
      : base;

  return { pergunta, oferecerGuia: respostas.length >= MIN_PERGUNTAS };
}

/** Mensagens humanas de progresso — sem porcentagem, sem pressão. */
export function mensagemProgresso(respostas: number) {
  if (respostas <= 1) return "✨ Estamos começando a conhecer sua experiência.";
  if (respostas <= 3) return "✨ Estamos descobrindo detalhes importantes.";
  if (respostas <= 6) return "🧠 Sua experiência está ganhando forma.";
  if (respostas < MIN_PERGUNTAS) return "💡 Encontramos conhecimentos muito interessantes.";
  return "📘 Já temos material suficiente para criar seu guia.";
}
