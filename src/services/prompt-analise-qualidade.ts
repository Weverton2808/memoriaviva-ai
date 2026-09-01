// Camada interna de análise de qualidade do Memória Viva.
//
// Ela roda ANTES de gerar ou publicar um conhecimento e serve para organizar,
// verificar consistência, achar lacunas, preservar a fidelidade da experiência
// e sinalizar riscos. O resultado é interno: nunca é mostrado como nota ao usuário.

import type { CategoriaId } from "@/types";

export type NivelQualidade =
  | "inicial"
  | "parcial"
  | "bom"
  | "rico"
  | "excepcional";

export type NivelRisco = "baixo" | "medio" | "alto";

export interface AnaliseConhecimento {
  knowledge_quality: NivelQualidade;
  main_topics: string[];
  important_information: string[];
  experience_based_claims: string[];
  uncertainties: string[];
  possible_contradictions: string[];
  missing_information: string[];
  risk_level: NivelRisco;
  privacy_issues: string[];
  ready_for_guide: boolean;
}

export const ANALISE_PADRAO: AnaliseConhecimento = {
  knowledge_quality: "parcial",
  main_topics: [],
  important_information: [],
  experience_based_claims: [],
  uncertainties: [],
  possible_contradictions: [],
  missing_information: [],
  risk_level: "baixo",
  privacy_issues: [],
  ready_for_guide: true,
};

export const AVISO_CONTEXTO =
  "Este conteúdo foi criado a partir da experiência pessoal compartilhada pelo autor. Diferentes situações podem exigir abordagens diferentes.";

export const AVISO_RISCO =
  "Esta é uma experiência compartilhada pelo autor e pode não ser adequada para todas as situações. Em caso de dúvida, considere procurar um profissional qualificado.";

/** Prompt mestre da camada de análise de qualidade. */
export const PROMPT_ANALISE_QUALIDADE = `
# IDENTIDADE
Você é o sistema interno de análise de qualidade do MEMÓRIA VIVA. Você analisa o conhecimento compartilhado por uma pessoa antes de ele virar um guia final ou ser publicado.

Você é uma camada de: organização, verificação de consistência, identificação de lacunas, preservação da fidelidade da experiência, classificação de incertezas e prevenção de informações potencialmente perigosas.

Você NÃO substitui a experiência da pessoa. Você NÃO reescreve a história para ficar mais bonita. Você NÃO inventa informação.

# PRINCÍPIO FUNDAMENTAL
EXPERIÊNCIA PESSOAL NÃO É NECESSARIAMENTE UM FATO UNIVERSAL.
"Na minha experiência isso sempre funcionou" nunca vira "isso sempre funciona".
Use formulações como "Segundo a experiência compartilhada...", "Na situação descrita pelo autor...", "Uma abordagem utilizada pelo autor foi...".

# ETAPA 1 — TIPO DE CONHECIMENTO
Classifique internamente cada informação importante: experiência pessoal, opinião, procedimento prático, observação, fato declarado, conselho, exemplo real.

# ETAPA 2 — INCERTEZA
Identifique marcas de incerteza (talvez, geralmente, normalmente, acredito, pode ser, na minha experiência, provavelmente, não tenho certeza). NÃO remova essas incertezas: elas preservam a honestidade da experiência.

# ETAPA 3 — CONTRADIÇÕES
Compare as informações da conversa e marque possíveis contradições. Nunca acuse a pessoa; a contradição serve para gerar uma pergunta de esclarecimento gentil.

# ETAPA 4 — LACUNAS
Aponte apenas lacunas que impedem o entendimento (peça não identificada, teste não explicado, etapa faltando). Ignore detalhes irrelevantes.

# ETAPA 5 — QUALIDADE (interna, nunca mostrada como nota)
inicial | parcial | bom | rico | excepcional.

# ETAPA 6 — INFORMAÇÕES SENSÍVEIS
Sinalize dados pessoais desnecessários (nomes completos, endereços, números, dados de terceiros) para anonimizar.

# ETAPA 7 — ALTO RISCO
Saúde, medicamentos, eletricidade, produtos químicos, máquinas perigosas, veículos, construção estrutural, segurança. Nesses casos o risco é médio ou alto e o guia precisa de contexto — sem alarmismo excessivo.

# ETAPA 8 — FIDELIDADE
Preserve o que a pessoa disse. Não invente autoridade científica.

# ETAPA 10 — PRONTO PARA O GUIA
ready_for_guide = true quando: o assunto principal está claro, há informação suficiente, não há contradição importante em aberto e não faltam etapas essenciais.

# SAÍDA
Responda SOMENTE com JSON válido, sem comentários e sem texto fora do JSON:
{"knowledge_quality":"inicial|parcial|bom|rico|excepcional","main_topics":[],"important_information":[],"experience_based_claims":[],"uncertainties":[],"possible_contradictions":[],"missing_information":[],"risk_level":"baixo|medio|alto","privacy_issues":[],"ready_for_guide":true}
`.trim();

/** Prompt para analisar a transcrição de uma entrevista. */
export function montarPromptAnalise(
  categoria: CategoriaId,
  topico: string,
  transcricao: string,
): string {
  return `${PROMPT_ANALISE_QUALIDADE}

# CONVERSA A ANALISAR
- Categoria: ${categoria}
- Tema: "${topico}"

${transcricao}`;
}

/** Regras de escrita derivadas da análise, injetadas no prompt do guia. */
export function instrucoesDoGuia(analise: AnaliseConhecimento): string {
  const lista = (titulo: string, itens: string[]) =>
    itens.length > 0 ? `\n${titulo}:\n${itens.map((i) => `- ${i}`).join("\n")}` : "";

  return `# ANÁLISE INTERNA DE QUALIDADE (não mencione esta análise no guia)
- Qualidade do conhecimento: ${analise.knowledge_quality}
- Nível de risco: ${analise.risk_level}${lista("Afirmações baseadas em experiência (contextualize)", analise.experience_based_claims)}${lista("Incertezas a preservar", analise.uncertainties)}${lista("Possíveis contradições (não afirme como certeza)", analise.possible_contradictions)}${lista("Informações que faltam (não invente)", analise.missing_information)}${lista("Dados pessoais a anonimizar", analise.privacy_issues)}

# REGRAS DE ESCRITA
- Use SOMENTE o que a pessoa disse. Se faltar conteúdo para uma seção, deixe-a vazia. Prefira um guia menor e verdadeiro a um guia grande e inventado.
- Preserve as incertezas ("segundo a percepção do autor...", "o autor observou que...").
- Preserve opiniões como opiniões ("na experiência do autor...").
- Evite "você deve sempre", "a única maneira correta é", "isso sempre funciona".
- Anonimize dados pessoais desnecessários ("um cliente...", "uma vizinha...").`;
}

/** Aviso a acrescentar no fim do guia, quando fizer sentido. */
export function avisoParaGuia(analise: AnaliseConhecimento): string | null {
  if (analise.risk_level === "alto" || analise.risk_level === "medio") return AVISO_RISCO;
  if (analise.experience_based_claims.length > 0 || analise.uncertainties.length > 0) {
    return AVISO_CONTEXTO;
  }
  return null;
}

/** Verificações antes de publicar um conhecimento. */
export function bloqueiosParaPublicar(analise: AnaliseConhecimento): string[] {
  const motivos: string[] = [];
  if (analise.privacy_issues.length > 0) {
    motivos.push(
      "Há dados pessoais que podem ser desnecessários. Revise antes de deixar público.",
    );
  }
  if (analise.possible_contradictions.length > 0) {
    motivos.push("Há pontos que parecem se contradizer. Vale esclarecer antes de publicar.");
  }
  return motivos;
}
