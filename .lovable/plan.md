# Plano: Memória Viva com Supabase + IA

## Visão
Transformar o protótipo local (localStorage, perguntas estáticas, artigo simples) na arquitetura do diagrama:

```text
USUÁRIO → MEMÓRIA VIVA → SUPABASE → LOGIN / BANCO / CONVERSAS / CONHECIMENTOS
                        → IA → ENTREVISTA / PERGUNTAS / ORGANIZAÇÃO
                        → GUIA FINAL
```

## Decisões de produto
- **Perfis de usuário:** sim. Tabela `public.users` ligada a `auth.users(id)` com campos:
  - `id` (uuid, PK, referência a auth.users)
  - `name` (text)
  - `avatar_url` (text, opcional)
  - `created_at` (timestamptz)
- O schema existente será ajustado: renomear `full_name` para `name` e remover `display_age`/`city` para bater com a estrutura acima.

## Etapas

### 1. Ativar Lovable Cloud (Supabase)
- Habilitar o backend no projeto.
- Aplicar o schema já preparado em `supabase/schema.sql` como migração inicial.
- Verificar variáveis de ambiente injetadas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.).

### 2. Autenticação real
- Substituir o login/cadastro simulado em `src/routes/entrar.tsx` por Supabase Auth.
- Usar `supabase.auth.signInWithPassword` e `signUp`.
- Criar hook `useAuth` para expor sessão, usuário e logout.
- Atualizar `SiteHeader` para mostrar nome real e botão de sair.
- Proteger rotas privadas (`/nova`, `/conversa/$id`, `/conhecimento/$id` do usuário) movendo-as para `src/routes/_authenticated/`.

### 3. Dados no banco — server functions
Criar `src/lib/memoria.functions.ts` com `createServerFn`:
- `listSessions`, `getSession`, `createSession`, `updateSessionStatus`.
- `listMessages`, `insertMessage`.
- `listArticles`, `getArticle`, `createArticle`, `deleteArticle`.
- Todas as funções de escrita usam `.middleware([requireSupabaseAuth])` e `context.supabase`.
- Leitura pública de artigos via server publishable client + RLS `TO anon`.

Ajustar as rotas:
- `nova.tsx`: criar sessão no Supabase ao invés de `localStorage`.
- `conversa.$id.tsx`: carregar/gravar mensagens no banco; manter UX local otimista.
- `conhecimento.$id.tsx`: ler artigo do banco (público ou do dono).
- `explorar.tsx`: listar artigos públicos do Supabase + exemplos seed.
- `index.tsx`: listar artigos públicos recentes do banco.

### 4. Integração com IA real (Lovable AI Gateway)
- Criar `src/lib/ai.ts` com helper para chamar o gateway via `createServerFn`.
- Usar modelo padrão `google/gemini-3.7-flash` no chat path (`createOpenAICompatible`).
- Implementar `proximaPerguntaIA(sessionId, history)`:
  - Envia histórico da conversa + categoria/tema.
  - Retorna próxima pergunta adaptativa, mantendo tom simples e acolhedor.
- Implementar `gerarArtigoIA(session, messages)`:
  - Envia todo o chat.
  - Retorna JSON estrito com `title`, `summary`, `sections[]`, `tags[]`.
- Preservar fallback local caso a IA falhe ou créditos esgotem.

### 5. Segurança e RLS
- Manter políticas do `schema.sql`.
- Garantir `GRANT` em toda tabela nova.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` ou `LOVABLE_API_KEY` no cliente.
- Adicionar `attachSupabaseAuth` ao `functionMiddleware` de `src/start.ts`.

### 6. Seed e dados iniciais
- Inserir os `ARTIGOS_EXEMPLO` como conhecimentos públicos via migração SQL, não no código.
- Remover dependência de `ARTIGOS_EXEMPLO` do frontend ou mantê-los como cache local mínimo.

### 7. Testes e validação
- Testar login/cadastro end-to-end.
- Testar fluxo completo: escolher tema → responder perguntas → gerar artigo → visualizar/compartilhar.
- Verificar build (`bun run build`) e typecheck.
- Validar RLS: usuário só lê/escreve suas próprias sessões e mensagens.

## Entregáveis
- Backend ativo com tabelas reais.
- Login/cadastro funcional.
- Conversas e conhecimentos persistidos no Supabase.
- Entrevistadora e geração de artigo impulsionadas por IA real.
- Página pública de exploração lendo do banco.
