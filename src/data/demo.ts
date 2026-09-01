import type { KnowledgeArticle } from "@/types";

/** Conhecimentos fictícios usados para demonstração. Nomes e dados são inventados. */
export const ARTIGOS_DEMO: KnowledgeArticle[] = [
  {
    id: "demo-mecanica",
    user_id: null,
    session_id: null,
    title: "Como identificar problemas comuns em máquinas de lavar",
    summary:
      "Vinte e cinco anos consertando máquinas ensinaram a reconhecer quase todo defeito pelo barulho, antes mesmo de abrir o aparelho.",
    category: "profissao",
    is_public: true,
    author_name: "João Silva",
    created_at: "2026-05-02T10:00:00.000Z",
    updated_at: "2026-05-02T10:00:00.000Z",
    content: [
      {
        id: "d1-1",
        titulo: "Resumo",
        texto:
          "Um guia prático para reconhecer os defeitos mais frequentes em máquinas de lavar domésticas usando o ouvido, o cheiro e três testes simples.",
      },
      {
        id: "d1-2",
        titulo: "O que aprendi",
        texto:
          "A maior parte dos chamados não é defeito grave. É mangueira entupida, dreno sujo ou máquina desnivelada. Aprendi a ouvir antes de abrir: o barulho conta metade da história.",
      },
      {
        id: "d1-3",
        titulo: "Guia passo a passo",
        texto:
          "Primeiro, escute a máquina enchendo. Se demora, o problema é entrada de água. Depois, ouça a centrifugação: barulho de metal batendo costuma ser rolamento; chiado agudo é correia. Por último, teste o dreno com a máquina vazia.",
      },
      {
        id: "d1-4",
        titulo: "Erros mais comuns",
        texto:
          "Trocar a placa eletrônica antes de checar as coisas simples. Já vi cliente pagar uma placa nova quando o problema era uma moeda presa na bomba.",
      },
      {
        id: "d1-5",
        titulo: "Conselhos para iniciantes",
        texto:
          "Sempre desligue da tomada. Anote a posição dos fios antes de soltar qualquer um. E cobre pelo diagnóstico, não só pela peça.",
      },
    ],
  },
  {
    id: "demo-culinaria",
    user_id: null,
    session_id: null,
    title: "O pão de milho que atravessou três gerações",
    summary:
      "Fubá moído na hora, fermento de batata e um forno de barro: a receita que alimentou a família desde os anos 1950.",
    category: "receita",
    is_public: true,
    author_name: "Aparecida Ramos",
    created_at: "2026-04-18T10:00:00.000Z",
    updated_at: "2026-04-18T10:00:00.000Z",
    content: [
      {
        id: "d2-1",
        titulo: "Resumo",
        texto:
          "A receita do pão de milho feita toda quinta-feira, com o ponto da massa e os sinais do forno explicados do jeito de quem faz há sessenta anos.",
      },
      {
        id: "d2-2",
        titulo: "Conhecimentos principais",
        texto:
          "Fubá moído na hora, água morna, banha, sal e o fermento de batata guardado em vasilha de barro. Nada de pressa.",
      },
      {
        id: "d2-3",
        titulo: "Guia passo a passo",
        texto:
          "Misture o fubá com a água morna aos poucos. Sove até a massa soltar da mão. Deixe descansar coberta com pano até dobrar de tamanho. Só então leve ao forno bem quente.",
      },
      {
        id: "d2-4",
        titulo: "Dicas importantes",
        texto:
          "Para saber se o forno está no ponto, jogue um pouco de fubá dentro: se dourar rápido, pode assar.",
      },
    ],
  },
  {
    id: "demo-construcao",
    user_id: null,
    session_id: null,
    title: "Assentar tijolo no prumo sem desperdiçar massa",
    summary:
      "Quarenta anos de obra resumidos no jeito certo de esticar a linha, dosar a massa e conferir o prumo a cada fiada.",
    category: "profissao",
    is_public: true,
    author_name: "Antônio Ferreira",
    created_at: "2026-03-27T10:00:00.000Z",
    updated_at: "2026-03-27T10:00:00.000Z",
    content: [
      {
        id: "d3-1",
        titulo: "Resumo",
        texto:
          "Como levantar uma parede reta, econômica e firme, com as conferências que evitam ter que derrubar serviço no dia seguinte.",
      },
      {
        id: "d3-2",
        titulo: "Guia passo a passo",
        texto:
          "Marque a primeira fiada no chão. Estique a linha bem esticada entre as duas pontas. Assente a massa em cordão parelho e bata o tijolo com o cabo da colher até encostar na linha. Confira o prumo a cada três fiadas.",
      },
      {
        id: "d3-3",
        titulo: "Erros mais comuns",
        texto:
          "Fazer massa demais de uma vez. Ela endurece e vira prejuízo. Faça massa para quarenta minutos de serviço.",
      },
      {
        id: "d3-4",
        titulo: "Conselhos para iniciantes",
        texto:
          "Parede torta não se conserta com reboco. Conserta-se derrubando. Vale mais gastar dez minutos conferindo do que um dia refazendo.",
      },
    ],
  },
  {
    id: "demo-vida",
    user_id: null,
    session_id: null,
    title: "Recomeçar aos 19 anos numa cidade desconhecida",
    summary:
      "Três dias de viagem, uma mala de papelão e o endereço de uma prima escrito num papel de pão.",
    category: "experiencia",
    is_public: true,
    author_name: "Iracema Nunes",
    created_at: "2026-02-09T10:00:00.000Z",
    updated_at: "2026-02-09T10:00:00.000Z",
    content: [
      {
        id: "d4-1",
        titulo: "Resumo",
        texto:
          "O relato de uma mudança do interior para a cidade grande e o que essa travessia ensinou sobre coragem, trabalho e recomeço.",
      },
      {
        id: "d4-2",
        titulo: "O que aprendi",
        texto:
          "Que medo e coragem andam juntos. Eu chorei os três dias de viagem e mesmo assim desci do caminhão e procurei serviço no mesmo dia.",
      },
      {
        id: "d4-3",
        titulo: "Exemplos reais",
        texto:
          "Meu primeiro emprego foi lavando roupa para uma família na vila. Ganhava pouco, mas aprendi a cidade andando a pé para entregar as trouxas.",
      },
      {
        id: "d4-4",
        titulo: "Conselhos para iniciantes",
        texto:
          "A cidade assusta, mas a gente aprende. O importante é não perder o jeito de cumprimentar as pessoas.",
      },
    ],
  },
];
