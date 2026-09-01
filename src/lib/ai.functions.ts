// Serviço de IA (servidor). A chave nunca sai daqui.
//
// Dois modos, controlados pela variável de ambiente MODO_IA:
//   - "ai"   (padrão): usa a IA do Lovable AI Gateway.
//   - "demo": usa a entrevistadora simulada, sem custo e sem chave.
// Se a chave não existir ou a IA falhar, caímos automaticamente no modo demonstração,
// para que a pessoa nunca perca a conversa.

import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { uid } from "@/lib/uid";
import { montarPromptGuia, montarSystemPrompt } from "@/services/prompt-entrevistadora";
import {
  ANALISE_PADRAO,
  avisoParaGuia,
  bloqueiosParaPublicar,
  instrucoesDoGuia,
  montarPromptAnalise,
  type AnaliseConhecimento,
} from "@/services/prompt-analise-qualidade";
import { proximaPergunta } from "@/services/entrevista";
import { gerarGuia } from "@/services/gerador";
import type { CategoriaId, GuiaEstruturado, KnowledgeSession, Message, Secao } from "@/types";

type Cliente = SupabaseClient<Database>;

const MODELO = "google/gemini-3.7-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const TITULOS_GUIA: Array<[keyof GuiaEstruturado, string]> = [
  ["introduction", "Introdução"],
  ["lessons_learned", "O que aprendi"],
  ["main_knowledge", "Conhecimentos principais"],
  ["step_by_step", "Guia passo a passo"],
  ["common_mistakes", "Erros mais comuns"],
  ["real_examples", "Exemplos reais"],
  ["important_tips", "Dicas importantes"],
  ["beginner_advice", "Conselhos para iniciantes"],
  ["conclusion", "Conclusão"],
];

function modoDemo() {
  return (process.env["MODO_IA"] ?? "ai").toLowerCase() === "demo";
}

/**
 * A chave é obrigatória fora do modo demonstração explícito.
 * Nunca devolvemos a chave, a URL do gateway nem o erro bruto para a pessoa:
 * o diagnóstico fica no log do servidor e o cliente recebe apenas um código.
 */
function chaveObrigatoria(): string {
  const chave = process.env["LOVABLE_API_KEY"];
  if (!chave) {
    console.error("[IA] Configuração ausente: LOVABLE_API_KEY não está definida no servidor.");
    throw new Error("IA_NAO_CONFIGURADA");
  }
  return chave;
}

/** Loga o motivo real (sem conteúdo da conversa) e devolve um erro controlado. */
function erroControlado(etapa: string, erro: unknown): Error {
  const detalhe = erro instanceof Error ? erro.message : String(erro ?? "desconhecido");
  console.error(`[IA] Falha em ${etapa}: ${detalhe.slice(0, 300)}`);
  return new Error("IA_INDISPONIVEL");
}

interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Chamada única ao gateway de IA. */
async function chamarIA(mensagens: ChatMsg[], chave: string): Promise<string> {
  const resposta = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${chave}` },
    body: JSON.stringify({ model: MODELO, messages: mensagens }),
  });

  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => "");
    throw new Error(`IA_ERRO ${resposta.status} ${texto.slice(0, 200)}`);
  }

  const dados = (await resposta.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const conteudo = dados.choices?.[0]?.message?.content?.trim();
  if (!conteudo) throw new Error("IA_VAZIO");
  return conteudo;
}

/**
 * A IA recebe o histórico da conversa, não apenas a última mensagem.
 * Quando a conversa fica muito longa, as respostas antigas viram um resumo —
 * ponto único de ajuste para reduzir custo no futuro.
 */
const LIMITE_MENSAGENS_COMPLETAS = 40;

function historicoParaIA(mensagens: Message[]): ChatMsg[] {
  const uteis = mensagens.filter((m) => m.role !== "system");
  const comoChat = (m: Message): ChatMsg => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  });

  if (uteis.length <= LIMITE_MENSAGENS_COMPLETAS) return uteis.map(comoChat);

  const antigas = uteis.slice(0, uteis.length - LIMITE_MENSAGENS_COMPLETAS);
  const recentes = uteis.slice(-LIMITE_MENSAGENS_COMPLETAS);
  return [
    {
      role: "system",
      content:
        "Resumo do início da conversa (respostas anteriores da pessoa):\n" +
        antigas
          .filter((m) => m.role === "user")
          .map((m) => `- ${m.content}`)
          .join("\n"),
    },
    ...recentes.map(comoChat),
  ];
}

async function carregarContexto(supabase: Cliente, sessionId: string) {
  const { data: sessao, error: erroSessao } = await supabase
    .from("knowledge_sessions")
    .select("id, user_id, category, topic, status, created_at, updated_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (erroSessao || !sessao) throw new Error("Sessão não encontrada.");

  const { data: mensagens, error: erroMsg } = await supabase
    .from("messages")
    .select("id, session_id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (erroMsg) throw new Error("Não conseguimos carregar a conversa.");

  return {
    sessao: sessao as unknown as KnowledgeSession,
    mensagens: (mensagens ?? []) as unknown as Message[],
  };
}

function transcrever(mensagens: Message[]): string {
  return mensagens
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "PESSOA" : "ENTREVISTADORA"}: ${m.content}`)
    .join("\n\n");
}

function extrairObjeto<T>(texto: string): T | null {
  const inicio = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");
  if (inicio < 0 || fim <= inicio) return null;
  try {
    return JSON.parse(texto.slice(inicio, fim + 1)) as T;
  } catch {
    return null;
  }
}

/**
 * Camada interna de qualidade: organiza, procura lacunas e contradições,
 * separa experiência pessoal de fato e sinaliza risco/privacidade.
 * O resultado nunca é mostrado à pessoa como nota.
 */
async function analisarConversa(
  sessao: KnowledgeSession,
  mensagens: Message[],
  chave: string,
): Promise<AnaliseConhecimento | null> {
  try {
    const bruto = await chamarIA(
      [
        {
          role: "system",
          content: montarPromptAnalise(
            sessao.category as CategoriaId,
            sessao.topic,
            transcrever(mensagens),
          ),
        },
        { role: "user", content: "Analise a conversa e responda somente com o JSON." },
      ],
      chave,
    );
    const analise = extrairObjeto<Partial<AnaliseConhecimento>>(bruto);
    return analise ? { ...ANALISE_PADRAO, ...analise } : null;
  } catch (erro) {
    console.error("Falha na análise de qualidade:", erro);
    return null;
  }
}

/* ------------------------- generateNextQuestion -------------------------- */

export const generateNextQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => {
    if (!input?.sessionId) throw new Error("Sessão inválida.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Cliente;
    const { sessao, mensagens } = await carregarContexto(supabase, data.sessionId);

    // O modo demonstração só existe quando MODO_IA=demo é definido de propósito.
    // Fora dele, a ausência da chave é erro de configuração, não fallback.
    const demo = modoDemo();
    const chave = demo ? "" : chaveObrigatoria();
    let pergunta = "";
    const respostas = mensagens.filter((m) => m.role === "user").length;

    // A partir do mínimo de respostas, a camada de qualidade decide se já dá
    // para gerar o guia e aponta o que ainda falta perguntar.
    let analise: AnaliseConhecimento | null = null;
    if (!demo && respostas >= 8) {
      analise = await analisarConversa(sessao, mensagens, chave);
    }

    if (!demo) {
      try {
        const system = montarSystemPrompt(
          sessao.category as CategoriaId,
          sessao.topic,
          mensagens.find((m) => m.role === "user")?.content ?? sessao.topic,
        );
        pergunta = await chamarIA(
          [
            { role: "system", content: system },
            ...historicoParaIA(mensagens),
            {
              role: "system",
              content:
                "Faça APENAS a próxima pergunta da entrevista: uma única pergunta, curta e natural, sem numerar e sem comentários extras." +
                (analise && analise.missing_information.length > 0
                  ? `\nAinda falta esclarecer (escolha o ponto mais importante): ${analise.missing_information.join("; ")}.`
                  : "") +
                (analise && analise.possible_contradictions.length > 0
                  ? `\nHá pontos que parecem diferentes entre si. Peça esclarecimento com gentileza, sem acusar: ${analise.possible_contradictions.join("; ")}.`
                  : ""),
            },
          ],
          chave,
        );
      } catch (erro) {
        // Erro controlado: a conversa continua salva e a pessoa pode tentar de novo.
        throw erroControlado("generateNextQuestion", erro);
      }
    }

    if (!pergunta) {
      if (!demo) throw erroControlado("generateNextQuestion", "resposta vazia da IA");
      pergunta = proximaPergunta(sessao.category as CategoriaId, sessao.topic, mensagens).pergunta;
    }

    const { data: inserida, error } = await supabase
      .from("messages")
      .insert({ session_id: data.sessionId, role: "assistant", content: pergunta })
      .select("id, session_id, role, content, created_at")
      .single();
    if (error || !inserida) throw new Error("Não conseguimos salvar a próxima pergunta.");

    return {
      message: inserida as unknown as Message,
      oferecerGuia: respostas >= 8 && (analise ? analise.ready_for_guide : true),
    };
  });

/* ------------------------ generateKnowledgeGuide ------------------------- */

function guiaParaSecoes(guia: GuiaEstruturado): Secao[] {
  const secoes: Secao[] = [];
  for (const [campo, titulo] of TITULOS_GUIA) {
    const valor = guia[campo];
    const texto = Array.isArray(valor)
      ? valor
          .filter(Boolean)
          .map((i) => `• ${i}`)
          .join("\n")
      : String(valor ?? "").trim();
    if (texto) secoes.push({ id: uid(), titulo, texto });
  }
  return secoes;
}

function extrairJson(texto: string): GuiaEstruturado | null {
  const inicio = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");
  if (inicio < 0 || fim <= inicio) return null;
  try {
    return JSON.parse(texto.slice(inicio, fim + 1)) as GuiaEstruturado;
  } catch {
    return null;
  }
}

export const generateKnowledgeGuide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => {
    if (!input?.sessionId) throw new Error("Sessão inválida.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as Cliente;
    const userId = context.userId;
    const { sessao, mensagens } = await carregarContexto(supabase, data.sessionId);

    const { data: perfil } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .maybeSingle();
    const autor = (perfil as { name?: string } | null)?.name ?? "Você";

    const chave = process.env["LOVABLE_API_KEY"];
    let title = "";
    let summary = "";
    let content: Secao[] = [];
    let analise: AnaliseConhecimento | null = null;

    if (!modoDemo() && chave) {
      try {
        const transcricao = transcrever(mensagens);
        analise = await analisarConversa(sessao, mensagens, chave);

        const bruto = await chamarIA(
          [
            {
              role: "system",
              content:
                montarPromptGuia(sessao.category as CategoriaId, sessao.topic, transcricao) +
                (analise ? `\n\n${instrucoesDoGuia(analise)}` : ""),
            },
            {
              role: "user",
              content:
                'Gere agora o guia. Responda SOMENTE com JSON válido no formato: {"title":"","summary":"","introduction":"","lessons_learned":[],"main_knowledge":[],"step_by_step":[],"common_mistakes":[],"real_examples":[],"important_tips":[],"beginner_advice":[],"conclusion":""}. Use apenas informações presentes na conversa. Se faltar informação para uma seção, deixe a lista vazia ou o texto vazio. Não invente nada.',
            },
          ],
          chave,
        );

        const guia = extrairJson(bruto);
        if (guia) {
          title = (guia.title ?? "").trim();
          summary = (guia.summary ?? "").trim();
          content = guiaParaSecoes(guia);
        }
      } catch (erro) {
        console.error("Falha na IA ao gerar o guia, usando modo demonstração:", erro);
      }
    }

    if (content.length === 0) {
      const simulado = gerarGuia(sessao, mensagens, autor, userId);
      title = title || simulado.title;
      summary = summary || simulado.summary;
      content = simulado.content;
    }

    // Aviso discreto de contexto: só quando a análise indica risco ou
    // afirmações baseadas em experiência pessoal.
    const aviso = analise ? avisoParaGuia(analise) : null;
    if (aviso) content = [...content, { id: uid(), titulo: "Observação", texto: aviso }];

    const { data: inserido, error } = await supabase
      .from("knowledge_articles")
      .insert({
        user_id: userId,
        session_id: sessao.id,
        title: title || sessao.topic.slice(0, 80),
        summary: summary || sessao.topic.slice(0, 180),
        content: content as unknown as never,
        category: sessao.category,
        is_public: false,
      })
      .select("id")
      .single();
    if (error || !inserido) throw new Error("Não conseguimos salvar o seu guia.");

    await supabase
      .from("knowledge_sessions")
      .update({ status: "completed" })
      .eq("id", sessao.id);

    return {
      articleId: (inserido as { id: string }).id,
      avisos: analise ? bloqueiosParaPublicar(analise) : [],
    };
  });
