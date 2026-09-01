import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Memória Viva" },
      {
        name: "description",
        content:
          "Como o Memória Viva coleta, usa, armazena e exclui os dados de quem registra suas memórias e conhecimentos.",
      },
      { property: "og:title", content: "Política de Privacidade — Memória Viva" },
      {
        property: "og:description",
        content: "Como tratamos seus dados, suas conversas e seus conhecimentos.",
      },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <AppShell>
      <article className="prose-mv">
        <h1 className="text-3xl">Política de Privacidade</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Versão inicial (beta). Última atualização: [PREENCHER: data].
        </p>

        <Secao titulo="Quem é o responsável">
          <p>
            O Memória Viva é operado por [PREENCHER: nome do responsável ou da empresa],
            [PREENCHER: CNPJ/CPF, se aplicável], com endereço em [PREENCHER: endereço].
            Contato para assuntos de privacidade: [PREENCHER: e-mail de contato].
          </p>
          <p>
            Esses campos ainda não estão definidos no projeto e devem ser preenchidos antes da
            publicação nas lojas de aplicativos.
          </p>
        </Secao>

        <Secao titulo="Dados de cadastro">
          <p>
            Para criar uma conta, guardamos seu e-mail e uma senha (armazenada de forma
            criptografada pelo serviço de autenticação) ou, se você entrar com o Google, o e-mail,
            o nome e a foto de perfil enviados pelo Google. Guardamos também o nome que você
            escolhe exibir e a data de criação da conta.
          </p>
        </Secao>

        <Secao titulo="Memórias e conteúdo que você escreve">
          <p>
            Tudo o que você escreve durante a conversa — histórias, receitas, ofícios, cuidados,
            experiências — é armazenado na sua conta. Os guias gerados a partir dessas conversas
            também ficam guardados. Eles são privados por padrão: só ficam visíveis para outras
            pessoas se você escolher publicá-los na página Explorar.
          </p>
        </Secao>

        <Secao titulo="Mensagens e conversas">
          <p>
            Cada pergunta da entrevistadora e cada resposta sua é salva como mensagem ligada à
            sua conversa, para que você possa continuar de onde parou e para que o guia final
            possa ser gerado.
          </p>
        </Secao>

        <Secao titulo="Onde os dados ficam armazenados">
          <p>
            Os dados ficam em um banco de dados gerenciado (Supabase, através do Lovable Cloud),
            com regras de acesso que limitam cada registro ao seu dono. Conteúdo público fica
            legível para qualquer visitante, por definição.
          </p>
        </Secao>

        <Secao titulo="Processamento por inteligência artificial">
          <p>
            Para conduzir a entrevista e organizar o guia, o texto da sua conversa é enviado a um
            provedor de modelos de linguagem (Google Gemini, através do gateway de IA do Lovable).
            O envio acontece a partir do nosso servidor, nunca do seu aparelho, e é usado apenas
            para gerar a próxima pergunta, verificar a qualidade do conteúdo e montar o guia.
          </p>
          <p>
            Evite escrever dados sensíveis de terceiros (documentos, endereços, dados de saúde de
            outras pessoas). O sistema avisa quando percebe esse tipo de informação, mas a decisão
            final é sua.
          </p>
        </Secao>

        <Secao titulo="Autenticação com Google">
          <p>
            Se você entrar com o Google, recebemos apenas as informações básicas do seu perfil
            (e-mail, nome e foto). Não temos acesso à sua senha do Google nem a outros serviços da
            conta.
          </p>
        </Secao>

        <Secao titulo="Cookies e armazenamento no aparelho">
          <p>
            Usamos o armazenamento local do navegador para manter você conectado (sessão de
            autenticação) e para guardar o rascunho da conversa que você começou antes de entrar.
            Não usamos cookies de publicidade nem rastreamento de terceiros.
          </p>
        </Secao>

        <Secao titulo="Por quanto tempo guardamos">
          <p>
            Seus dados ficam guardados enquanto sua conta existir. Ao excluir a conta, apagamos
            perfil, conversas, mensagens e guias. Cópias de segurança do banco podem reter dados
            por até [PREENCHER: período de retenção de backups] antes de serem sobrescritas.
          </p>
        </Secao>

        <Secao titulo="Exclusão de conta e dados">
          <p>
            Você pode excluir sua conta a qualquer momento dentro do aplicativo, em Configurações →
            Excluir minha conta. A exclusão é permanente e não pode ser desfeita. As instruções
            completas, inclusive para quem não consegue acessar o aplicativo, estão na página{" "}
            <Link to="/excluir-conta" className="font-semibold text-primary underline">
              Excluir minha conta
            </Link>
            .
          </p>
        </Secao>

        <Secao titulo="Seus direitos">
          <p>
            Você pode acessar, corrigir e excluir seus dados, além de pedir uma cópia do seu
            conteúdo e revogar o consentimento para o tratamento. Para exercer esses direitos,
            escreva para [PREENCHER: e-mail de contato].
          </p>
        </Secao>

        <Secao titulo="Contato">
          <p>[PREENCHER: e-mail de contato]</p>
          <p className="mt-4">
            Veja também os{" "}
            <Link to="/termos" className="font-semibold text-primary underline">
              Termos de Uso
            </Link>
            .
          </p>
        </Secao>
      </article>
    </AppShell>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-3xl border border-border bg-card p-6">
      <h2 className="text-xl">{titulo}</h2>
      <div className="mt-3 space-y-3 text-lg leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
