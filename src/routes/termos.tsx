import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Memória Viva" },
      {
        name: "description",
        content:
          "Regras de uso do Memória Viva: sua conta, seu conteúdo, o papel da inteligência artificial e os limites do serviço.",
      },
      { property: "og:title", content: "Termos de Uso — Memória Viva" },
      { property: "og:description", content: "Regras de uso do Memória Viva." },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <AppShell>
      <article>
        <h1 className="text-3xl">Termos de Uso</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Versão inicial (beta). Última atualização: [PREENCHER: data].
        </p>

        <Secao titulo="Sobre o serviço">
          <p>
            O Memória Viva é um aplicativo que conversa com você e transforma suas memórias,
            ofícios, receitas e experiências em um guia organizado. O serviço é oferecido por
            [PREENCHER: nome do responsável ou da empresa] e está em fase beta: funcionalidades
            podem mudar, apresentar falhas ou ser descontinuadas.
          </p>
        </Secao>

        <Secao titulo="Conta">
          <p>
            Para usar o aplicativo é preciso criar uma conta com e-mail e senha ou entrar com o
            Google. Você é responsável por manter seus dados de acesso em segurança e por tudo o
            que for feito com sua conta.
          </p>
        </Secao>

        <Secao titulo="Seu conteúdo">
          <p>
            O conteúdo que você escreve continua sendo seu. Você nos autoriza apenas a armazenar e
            processar esse conteúdo para prestar o serviço: conduzir a entrevista, gerar o guia e
            exibi-lo para você. Se decidir publicar um guia, ele passa a ficar visível para
            qualquer visitante, junto com o seu nome de exibição — você pode voltar atrás e torná-lo
            privado a qualquer momento.
          </p>
        </Secao>

        <Secao titulo="Uso responsável">
          <p>Ao usar o Memória Viva, você concorda em não:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>publicar dados pessoais de terceiros sem autorização;</li>
            <li>publicar conteúdo ilegal, ofensivo, discriminatório ou enganoso;</li>
            <li>usar o serviço para orientações que exijam profissional habilitado, como
              diagnósticos médicos, jurídicos ou financeiros;</li>
            <li>tentar burlar limites técnicos, sobrecarregar o sistema ou acessar dados de outras
              pessoas.</li>
          </ul>
        </Secao>

        <Secao titulo="Inteligência artificial">
          <p>
            As perguntas e a organização do guia são geradas por um modelo de inteligência
            artificial a partir do que você escreve. O resultado pode conter imprecisões e não
            substitui orientação profissional. Reveja o guia antes de publicar ou compartilhar.
          </p>
        </Secao>

        <Secao titulo="Disponibilidade e limitação de responsabilidade">
          <p>
            O serviço é fornecido &quot;como está&quot;, sem garantia de disponibilidade contínua.
            Na medida permitida pela lei aplicável, [PREENCHER: nome do responsável ou da empresa]
            não se responsabiliza por perdas decorrentes do uso ou da indisponibilidade do serviço.
            Recomendamos guardar uma cópia dos conteúdos importantes para você.
          </p>
        </Secao>

        <Secao titulo="Encerramento e exclusão da conta">
          <p>
            Você pode encerrar sua conta quando quiser, em Configurações → Excluir minha conta, ou
            seguindo as instruções da página{" "}
            <Link to="/excluir-conta" className="font-semibold text-primary underline">
              Excluir minha conta
            </Link>
            . A exclusão apaga permanentemente seu perfil, conversas e guias. Podemos suspender
            contas que violem estes termos.
          </p>
        </Secao>

        <Secao titulo="Privacidade">
          <p>
            O tratamento dos seus dados está descrito na{" "}
            <Link to="/privacidade" className="font-semibold text-primary underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </Secao>

        <Secao titulo="Lei aplicável e contato">
          <p>
            Estes termos são regidos pelas leis de [PREENCHER: país/estado], com foro em
            [PREENCHER: comarca]. Dúvidas: [PREENCHER: e-mail de contato].
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
