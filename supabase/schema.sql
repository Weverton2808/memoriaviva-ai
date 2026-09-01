-- Memória Viva — estrutura preparada para Lovable Cloud (Supabase).
-- Executar como migração quando o backend for ativado.

create type public.knowledge_category as enum (
  'oficios', 'receitas', 'cuidados', 'historias', 'artesanato', 'campo'
);
create type public.session_status as enum ('em_andamento', 'concluida');
create type public.message_role as enum ('assistant', 'user');

-- Perfis (users): dados públicos ligados a auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  display_age int,
  city text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.users to authenticated;
grant select on public.users to anon;
grant all on public.users to service_role;
alter table public.users enable row level security;
create policy "Perfis são públicos" on public.users for select using (true);
create policy "Usuário edita o próprio perfil" on public.users
  for update to authenticated using (auth.uid() = id);
create policy "Usuário cria o próprio perfil" on public.users
  for insert to authenticated with check (auth.uid() = id);

-- Sessões de conversa
create table public.knowledge_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.knowledge_category not null,
  topic text not null,
  status public.session_status not null default 'em_andamento',
  -- expansão futura: modo de entrada da conversa ('texto' hoje, 'audio' depois)
  input_mode text not null default 'texto',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.knowledge_sessions to authenticated;
grant all on public.knowledge_sessions to service_role;
alter table public.knowledge_sessions enable row level security;
create policy "Dono gerencia suas sessões" on public.knowledge_sessions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Mensagens do chat
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.knowledge_sessions(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  -- expansão futura para áudio
  audio_url text,
  transcript_confidence numeric,
  created_at timestamptz not null default now()
);
create index messages_session_idx on public.messages(session_id, created_at);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "Dono lê mensagens da própria sessão" on public.messages
  for select to authenticated using (exists (
    select 1 from public.knowledge_sessions s
    where s.id = session_id and s.user_id = auth.uid()));
create policy "Dono grava mensagens na própria sessão" on public.messages
  for insert to authenticated with check (exists (
    select 1 from public.knowledge_sessions s
    where s.id = session_id and s.user_id = auth.uid()));

-- Conhecimentos publicados
create table public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.knowledge_sessions(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category public.knowledge_category not null,
  topic text not null,
  summary text not null default '',
  sections jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create index knowledge_articles_public_idx on public.knowledge_articles(is_public, created_at desc);
grant select, insert, update, delete on public.knowledge_articles to authenticated;
grant select on public.knowledge_articles to anon;
grant all on public.knowledge_articles to service_role;
alter table public.knowledge_articles enable row level security;
create policy "Conhecimentos públicos são visíveis" on public.knowledge_articles
  for select using (is_public);
create policy "Autor lê os próprios conhecimentos" on public.knowledge_articles
  for select to authenticated using (auth.uid() = user_id);
create policy "Autor gerencia os próprios conhecimentos" on public.knowledge_articles
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Perfil criado automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();
