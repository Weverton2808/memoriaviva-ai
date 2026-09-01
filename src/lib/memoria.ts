// Núcleo de dados da Memória Viva.
// Persistência local hoje; estruturas espelham as tabelas Supabase
// (users, knowledge_sessions, messages, knowledge_articles) para migração direta.

export type CategoryId =
  | "oficios"
  | "receitas"
  | "cuidados"
  | "historias"
  | "artesanato"
  | "campo";

export interface Category {
  id: CategoryId;
  nome: string;
  descricao: string;
  emoji: string;
  temas: string[];
}

export const CATEGORIAS: Category[] = [
  {
    id: "oficios",
    nome: "Ofícios e profissões",
    descricao: "Técnicas de trabalho aprendidas na prática, ao longo de uma vida.",
    emoji: "🔨",
    temas: ["Marcenaria", "Costura", "Construção", "Mecânica", "Comércio"],
  },
  {
    id: "receitas",
    nome: "Receitas e comida",
    descricao: "Pratos de família, temperos e segredos que ninguém anotou.",
    emoji: "🍲",
    temas: ["Pratos de festa", "Doces e bolos", "Pães", "Conservas", "Comida do dia a dia"],
  },
  {
    id: "cuidados",
    nome: "Cuidados e saúde caseira",
    descricao: "Chás, cuidados com crianças e conhecimentos de bem-estar.",
    emoji: "🌿",
    temas: ["Chás e ervas", "Cuidar de crianças", "Cuidar de idosos", "Remédios caseiros"],
  },
  {
    id: "historias",
    nome: "Histórias de vida",
    descricao: "Memórias, mudanças, famílias e lugares que formaram você.",
    emoji: "📖",
    temas: ["Infância", "Família", "Mudanças de cidade", "Trabalho e conquistas", "Festas e tradições"],
  },
  {
    id: "artesanato",
    nome: "Artesanato",
    descricao: "Trabalhos manuais com linha, madeira, barro e criatividade.",
    emoji: "🧶",
    temas: ["Crochê e tricô", "Bordado", "Cerâmica", "Cestaria", "Pintura"],
  },
  {
    id: "campo",
    nome: "Vida no campo",
    descricao: "Plantio, criação de animais, clima e sabedoria da terra.",
    emoji: "🌾",
    temas: ["Plantio", "Criação de animais", "Leitura do tempo", "Colheita", "Ferramentas"],
  },
];

export const getCategoria = (id: string) => CATEGORIAS.find((c) => c.id === id);

/* ------------------------- Entrevistadora inteligente ------------------------- */

const ABERTURA: Record<CategoryId, string[]> = {
  oficios: [
    "Para começarmos devagar: como você aprendeu esse ofício? Quem te ensinou?",
    "Quais ferramentas ou materiais são realmente indispensáveis nesse trabalho?",
    "Me conte o passo a passo de um trabalho seu, do começo ao fim.",
  ],
  receitas: [
    "Vamos começar pelo começo: quem te ensinou essa receita?",
    "Quais são os ingredientes e as quantidades que você costuma usar?",
    "Como é o preparo, passo a passo? Pode contar do seu jeito.",
  ],
  cuidados: [
    "Como você aprendeu esses cuidados? Foi com alguém da família?",
    "Quais ervas, ingredientes ou materiais você usa?",
    "Como você faz, do início ao fim, quando alguém precisa desse cuidado?",
  ],
  historias: [
    "Me conte onde e quando essa história começa.",
    "Quem são as pessoas mais importantes nessa história?",
    "O que acontecia no dia a dia nessa época?",
  ],
  artesanato: [
    "Quando e com quem você começou a fazer esse trabalho manual?",
    "Que materiais e ferramentas você usa?",
    "Como é o processo, do primeiro ponto até a peça pronta?",
  ],
  campo: [
    "Como era o lugar onde você fazia esse trabalho?",
    "O que é preciso ter em mãos para começar?",
    "Me explique o passo a passo, como se eu nunca tivesse feito isso.",
  ],
};

const APROFUNDAMENTO = [
  "Você falou algo importante aí. Pode explicar melhor essa parte?",
  "E como você sabe que está no ponto certo? Tem algum sinal que você observa?",
  "Qual é o erro mais comum de quem está começando?",
  "Tem algum truque ou segredo que só quem faz há muito tempo conhece?",
  "Quanto tempo costuma levar? E dá para apressar?",
  "Se faltar algum material, dá para substituir por outra coisa?",
  "Aconteceu alguma história marcante fazendo isso?",
  "Isso mudou com o tempo? Como era antes e como é hoje?",
  "Que cuidado é preciso ter para não se machucar ou estragar o trabalho?",
  "Alguém da família aprendeu com você? Como foi ensinar?",
];

const FECHAMENTO = [
  "Estamos quase no fim. O que você gostaria que as pessoas jamais esquecessem sobre isso?",
  "Se pudesse deixar um conselho para quem vai aprender agora, qual seria?",
];

/** Gera a próxima pergunta de forma adaptada ao que já foi respondido. */
export function proximaPergunta(
  categoria: CategoryId,
  tema: string,
  respostas: string[],
): { pergunta: string; encerrar: boolean } {
  const n = respostas.length;
  const total = totalPerguntas(respostas);

  if (n === 0) {
    return {
      pergunta: `Que alegria ter você aqui! Vamos conversar sobre ${tema.toLowerCase()}. Não tenha pressa: escreva do seu jeito, como se estivesse falando comigo. ${ABERTURA[categoria][0]}`,
      encerrar: false,
    };
  }

  if (n >= total - FECHAMENTO.length) {
    const i = Math.min(FECHAMENTO.length - 1, n - (total - FECHAMENTO.length));
    return { pergunta: FECHAMENTO[i]!, encerrar: n >= total - 1 };
  }

  if (n < ABERTURA[categoria].length) {
    return { pergunta: ABERTURA[categoria][n]!, encerrar: false };
  }

  const ultima = respostas[respostas.length - 1] ?? "";
  const curta = ultima.trim().split(/\s+/).length < 12;
  const idx = (n - ABERTURA[categoria].length) % APROFUNDAMENTO.length;
  const base = APROFUNDAMENTO[idx]!;
  const eco = destaque(ultima);

  const pergunta = curta
    ? `Pode me contar um pouco mais? ${base}`
    : eco
      ? `Você mencionou "${eco}". ${base}`
      : base;

  return { pergunta, encerrar: false };
}

/** Total adaptativo de perguntas: entre 8 e 15, conforme a riqueza das respostas. */
export function totalPerguntas(respostas: string[]) {
  const palavras = respostas.join(" ").split(/\s+/).filter(Boolean).length;
  if (respostas.length === 0) return 10;
  const media = palavras / respostas.length;
  if (media > 45) return 15;
  if (media > 25) return 12;
  return 8;
}

function destaque(texto: string) {
  const palavras = texto
    .toLowerCase()
    .replace(/[.,;:!?]/g, "")
    .split(/\s+/)
    .filter((p) => p.length > 5 && !STOP.has(p));
  return palavras[Math.floor(palavras.length / 2)] ?? "";
}

const STOP = new Set([
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
]);

/* --------------------------------- Modelos --------------------------------- */

export interface Message {
  id: string;
  session_id: string;
  role: "assistant" | "user";
  content: string;
  created_at: string;
}

export interface KnowledgeSession {
  id: string;
  user_id: string | null;
  category: CategoryId;
  topic: string;
  status: "em_andamento" | "concluida";
  created_at: string;
}

export interface KnowledgeArticle {
  id: string;
  session_id: string | null;
  author_name: string;
  title: string;
  category: CategoryId;
  topic: string;
  summary: string;
  sections: { heading: string; body: string }[];
  tags: string[];
  created_at: string;
}

/* ------------------------ Geração do conhecimento ------------------------ */

export function gerarArtigo(
  sessao: KnowledgeSession,
  mensagens: Message[],
  autor: string,
): KnowledgeArticle {
  const pares: { p: string; r: string }[] = [];
  for (let i = 0; i < mensagens.length; i++) {
    const m = mensagens[i]!;
    if (m.role === "assistant" && mensagens[i + 1]?.role === "user") {
      pares.push({ p: m.content, r: mensagens[i + 1]!.content });
    }
  }
  const respostas = pares.map((x) => x.r);
  const cat = getCategoria(sessao.category)!;

  const sections = [
    {
      heading: "Como tudo começou",
      body: respostas.slice(0, 1).join("\n\n") || "—",
    },
    {
      heading: "O que é preciso",
      body: respostas.slice(1, 2).join("\n\n") || "—",
    },
    {
      heading: "Passo a passo",
      body: respostas.slice(2, 4).join("\n\n") || "—",
    },
    {
      heading: "Segredos e detalhes",
      body: respostas.slice(4, -2).join("\n\n") || "—",
    },
    {
      heading: "Memórias e conselhos",
      body: respostas.slice(-2).join("\n\n") || "—",
    },
  ].filter((s) => s.body !== "—");

  return {
    id: uid(),
    session_id: sessao.id,
    author_name: autor,
    title: `${sessao.topic}: o saber de ${autor}`,
    category: sessao.category,
    topic: sessao.topic,
    summary: `Um registro sobre ${sessao.topic.toLowerCase()} em ${cat.nome.toLowerCase()}, contado por ${autor} em ${pares.length} perguntas.`,
    sections,
    tags: [cat.nome, sessao.topic, "saber popular"],
    created_at: new Date().toISOString(),
  };
}

/* ------------------------------ Armazenamento ------------------------------ */

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const KEY = "memoria-viva";

interface Store {
  sessions: KnowledgeSession[];
  messages: Message[];
  articles: KnowledgeArticle[];
  profile: { name: string; email: string } | null;
}

const vazio: Store = { sessions: [], messages: [], articles: [], profile: null };

export function loadStore(): Store {
  if (typeof window === "undefined") return vazio;
  try {
    return { ...vazio, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store) };
  } catch {
    return vazio;
  }
}

export function saveStore(patch: Partial<Store>) {
  if (typeof window === "undefined") return;
  const atual = loadStore();
  localStorage.setItem(KEY, JSON.stringify({ ...atual, ...patch }));
}

/* --------------------------- Conhecimentos fictícios --------------------------- */

export const ARTIGOS_EXEMPLO: KnowledgeArticle[] = [
  {
    id: "ex-1",
    session_id: null,
    author_name: "Dona Aparecida, 78 anos",
    title: "Pão de milho no forno de barro",
    category: "receitas",
    topic: "Pães",
    summary:
      "O pão que alimentou três gerações em Minas, com fubá moído na hora e fermento de batata.",
    sections: [
      {
        heading: "Como tudo começou",
        body: "Aprendi com minha avó, que fazia pão toda quinta-feira. Eu ficava sentada num banquinho vendo ela sovar a massa e contando as histórias dela.",
      },
      {
        heading: "O que é preciso",
        body: "Fubá de milho moído na hora, água morna, banha, sal, e o fermento de batata que a gente guardava numa vasilha de barro.",
      },
      {
        heading: "Segredos e detalhes",
        body: "O ponto da massa é quando ela solta da mão sem grudar. E o forno tem que estar com a boca quente: joga um pouco de fubá dentro, se dourar rápido, pode assar.",
      },
    ],
    tags: ["Receitas e comida", "Pães", "saber popular"],
    created_at: "2026-05-11T10:00:00.000Z",
  },
  {
    id: "ex-2",
    session_id: null,
    author_name: "Seu Otávio, 83 anos",
    title: "Encaixe rabo-de-andorinha sem prego",
    category: "oficios",
    topic: "Marcenaria",
    summary: "Cinquenta anos de marcenaria resumidos no encaixe que segura móvel por gerações.",
    sections: [
      {
        heading: "Como tudo começou",
        body: "Entrei na marcenaria do meu pai com onze anos, varrendo serragem. Só me deixaram pegar no formão depois de dois anos.",
      },
      {
        heading: "Passo a passo",
        body: "Marca com o riscador, nunca com lápis grosso. Serra sempre pelo lado de fora do risco. O formão termina o serviço, não a serra.",
      },
      {
        heading: "Memórias e conselhos",
        body: "Madeira boa não perdoa pressa. Quem tem pressa faz móvel que balança.",
      },
    ],
    tags: ["Ofícios e profissões", "Marcenaria", "saber popular"],
    created_at: "2026-04-28T10:00:00.000Z",
  },
  {
    id: "ex-3",
    session_id: null,
    author_name: "Dona Zilda, 71 anos",
    title: "Chás para gripe e dor de garganta",
    category: "cuidados",
    topic: "Chás e ervas",
    summary: "As ervas do quintal, as combinações certas e os cuidados que não se pode esquecer.",
    sections: [
      {
        heading: "O que é preciso",
        body: "Hortelã, gengibre, mel, limão e um pouco de alho para os casos mais fortes.",
      },
      {
        heading: "Segredos e detalhes",
        body: "Nunca ferva o mel junto: coloca depois que o chá amornar, senão perde a serventia.",
      },
      {
        heading: "Memórias e conselhos",
        body: "Chá ajuda, mas não substitui médico. Febre que não baixa em dois dias é caso de posto de saúde.",
      },
    ],
    tags: ["Cuidados e saúde caseira", "Chás e ervas", "saber popular"],
    created_at: "2026-03-19T10:00:00.000Z",
  },
  {
    id: "ex-4",
    session_id: null,
    author_name: "Dona Marlene, 69 anos",
    title: "Crochê: a toalha de barrado largo",
    category: "artesanato",
    topic: "Crochê e tricô",
    summary: "Do primeiro ponto correntinha ao barrado que virou marca registrada da família.",
    sections: [
      {
        heading: "Como tudo começou",
        body: "Comecei aos nove anos com um pedaço de barbante de saco de açúcar e uma agulha emprestada.",
      },
      {
        heading: "Passo a passo",
        body: "Correntinha bem folgada primeiro. Depois ponto baixo em toda a volta, e só então o barrado com ponto alto em leque.",
      },
    ],
    tags: ["Artesanato", "Crochê e tricô", "saber popular"],
    created_at: "2026-02-02T10:00:00.000Z",
  },
  {
    id: "ex-5",
    session_id: null,
    author_name: "Seu Joaquim, 88 anos",
    title: "Ler o tempo antes da chuva",
    category: "campo",
    topic: "Leitura do tempo",
    summary: "Os sinais dos bichos, do vento e do céu que avisavam a chuva antes de qualquer rádio.",
    sections: [
      {
        heading: "Segredos e detalhes",
        body: "Formiga carregando ovo para cima é chuva em três dias. Vento que muda de rumo à tardinha traz água na madrugada.",
      },
      {
        heading: "Memórias e conselhos",
        body: "Meu pai plantava pelo céu, não pelo calendário. E raramente errava.",
      },
    ],
    tags: ["Vida no campo", "Leitura do tempo", "saber popular"],
    created_at: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "ex-6",
    session_id: null,
    author_name: "Dona Iracema, 74 anos",
    title: "A mudança do sertão para a cidade grande",
    category: "historias",
    topic: "Mudanças de cidade",
    summary: "Três dias de pau-de-arara, uma mala de papelão e a coragem de recomeçar aos 19 anos.",
    sections: [
      {
        heading: "Como tudo começou",
        body: "Saí de casa com uma mala de papelão amarrada com barbante e o endereço de uma prima escrito num papel de pão.",
      },
      {
        heading: "Memórias e conselhos",
        body: "A cidade assusta, mas a gente aprende. O importante é não perder o jeito de cumprimentar as pessoas.",
      },
    ],
    tags: ["Histórias de vida", "Mudanças de cidade", "saber popular"],
    created_at: "2025-12-08T10:00:00.000Z",
  },
];
