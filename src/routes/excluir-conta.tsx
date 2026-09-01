import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/excluir-conta")({
  head: () => ({
    meta: [
      { title: "Excluir minha conta — Memória Viva" },
      {
        name: "description",
        content:
          "Como excluir sua conta do Memória Viva e apagar permanentemente seu perfil, suas conversas e seus guias.",
      },
      { property: "og:title", content: "Excluir minha conta — Memória Viva" },
      {
        property: "og:description",
        content: "Passo a passo para apagar sua conta e todos os seus dados.",
      },
    ],
  }),
  component: ExcluirConta,
});

function ExcluirConta() {
  return (
    <AppShell>
      <h1 className="text-3xl">Excluir minha conta</h1>
      <p className="mt-3 text-lg leading-relaxed text-foreground/90">
        Você pode apagar sua conta do Memória Viva a qualquer momento, junto com todos os dados
        ligados a ela. A exclusão é permanente e não pode ser desfeita.
      </p>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl">Pelo aplicativo</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg leading-relaxed">
          <li>Entre na sua conta.</li>
          <li>
            Abra{" "}
            <Link to="/configuracoes" className="font-semibold text-primary underline">
              Configurações
            </Link>
            .
          </li>
          <li>Role até a seção &quot;Conta&quot; e toque em &quot;Excluir minha conta&quot;.</li>
          <li>Escreva a palavra EXCLUIR para confirmar e toque em &quot;Excluir para sempre&quot;.</li>
        </ol>
        <p className="mt-4 text-lg leading-relaxed">
          A conta é apagada na hora e você é desconectado automaticamente.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl">O que é apagado</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-lg leading-relaxed">
          <li>seu perfil (nome, foto e e-mail de acesso);</li>
          <li>todas as conversas e mensagens da entrevista;</li>
          <li>todos os guias criados, públicos ou privados;</li>
          <li>seu usuário de autenticação, inclusive o vínculo com o Google.</li>
        </ul>
        <p className="mt-4 text-lg leading-relaxed">
          Cópias de segurança do banco de dados podem reter registros por até [PREENCHER: período de
          retenção de backups] antes de serem sobrescritas.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl">Se você não consegue entrar</h2>
        <p className="mt-3 text-lg leading-relaxed">
          Escreva para [PREENCHER: e-mail de contato] a partir do endereço de e-mail cadastrado,
          pedindo a exclusão da conta. Respondemos em até [PREENCHER: prazo de resposta] e a
          exclusão é feita em até [PREENCHER: prazo de exclusão].
        </p>
      </section>

      <p className="mt-8 text-base text-muted-foreground">
        Veja também a{" "}
        <Link to="/privacidade" className="font-semibold text-primary underline">
          Política de Privacidade
        </Link>{" "}
        e os{" "}
        <Link to="/termos" className="font-semibold text-primary underline">
          Termos de Uso
        </Link>
        .
      </p>
    </AppShell>
  );
}
