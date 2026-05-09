-- =============================================
-- Flô — Schema do Banco de Dados
-- Execute no Supabase > SQL Editor
-- =============================================


-- TABELA: profiles
-- Extensão do usuário autenticado (auth.users)
create table profiles (
  id              uuid references auth.users(id) primary key,
  username        text unique not null,
  bio             text,
  estado          text,
  avatar_url      text,
  membro_numero   integer unique,
  is_fundador     boolean default false,
  ciclo_completo  boolean default false,
  modo_ninja      boolean default false,
  preferred_unit  text default 'metric',
  created_at      timestamptz default now()
);


-- TABELA: cultivos
create table cultivos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  nome            text not null,
  genetica        text,
  genetica_custom text,
  banco_semente   text,
  tipo_semente    text check (tipo_semente in (
                    'regular', 'feminizada', 'fast_flowering',
                    'automatica', 'cbd', 'prenseed'
                  )),
  substrato       text check (substrato in (
                    'solo_organico', 'solo_vivo_notill',
                    'inerte', 'semi_inerte',
                    'hidroponia', 'aeroponia'
                  )),
  metodo          text check (metodo in ('indoor', 'outdoor', 'greenhouse')),
  data_inicio     date,
  planejado       boolean default false,
  is_clone        boolean default false,
  fase_atual      text check (fase_atual in (
                    'germinacao', 'muda', 'vegetativo',
                    'pre_floracao', 'floracao', 'flush',
                    'colheita', 'cura', 'concluido'
                  )),
  publico         boolean default false,
  concluido       boolean default false,
  created_at      timestamptz default now()
);


-- TABELA: registros
-- Cada entrada no diário de um cultivo
create table registros (
  id                  uuid primary key default gen_random_uuid(),
  cultivo_id          uuid references cultivos(id) on delete cascade,
  user_id             uuid references profiles(id) on delete cascade,

  estado_planta       text check (estado_planta in (
                        'saudavel', 'overfert', 'fome',
                        'pragas', 'estresse_termico', 'em_recuperacao', 'outro'
                      )),
  estado_custom       text,

  regou               boolean,
  volume_ml           integer,
  tipo_agua           text,
  ph_agua             numeric(4,2),
  ec_ppm              numeric(6,2),
  ph_runoff           numeric(4,2),
  ec_runoff           numeric(6,2),

  nutriu              boolean,
  produtos            text[],
  dosagem_obs         text,

  temperatura_c       numeric(4,1),
  temperatura_folha_c numeric(4,1),
  umidade_pct         numeric(4,1),
  horas_luz           numeric(3,1),
  vpd_calculado       numeric(4,2),

  tags_equipamento    text[],
  treinamento         text[],
  anotacao            text,
  fotos               text[],

  created_at          timestamptz default now()
);


-- TABELA: milestones
-- Conquistas desbloqueadas por cultivo
create table milestones (
  id              uuid primary key default gen_random_uuid(),
  cultivo_id      uuid references cultivos(id) on delete cascade,
  user_id         uuid references profiles(id) on delete cascade,
  tipo            text check (tipo in (
                    'germinacao', 'vegetativo', 'flip_flora',
                    'floracao', 'flush', 'colheita', 'cura', 'ciclo_completo'
                  )),
  desbloqueado_em timestamptz default now()
);


-- TABELA: posts_forum
-- user_id existe apenas para moderação — nunca exposto ao frontend
create table posts_forum (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  categoria   text check (categoria in (
                'clinica_flo', 'cacadores_terpenos',
                'mostra_seu_canto', 'cultura_reducao_danos', 'papo_laricas'
              )),
  titulo      text not null,
  conteudo    text not null,
  upvotes     integer default 0,
  downvotes   integer default 0,
  created_at  timestamptz default now()
);

-- View pública: nunca expõe user_id ao frontend
create view posts_forum_publico as
  select id, categoria, titulo, conteudo, upvotes, downvotes, created_at
  from posts_forum;


-- TABELA: comentarios_forum
create table comentarios_forum (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references posts_forum(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  parent_id   uuid references comentarios_forum(id),
  conteudo    text not null,
  upvotes     integer default 0,
  created_at  timestamptz default now()
);

-- View pública sem user_id
create view comentarios_forum_publico as
  select id, post_id, parent_id, conteudo, upvotes, created_at
  from comentarios_forum;


-- TABELA: geneticas (seed data)
create table geneticas (
  id      uuid primary key default gen_random_uuid(),
  nome    text not null,
  aliases text[],
  banco   text,
  tipo    text
);


-- TABELA: bancos_semente (seed data)
create table bancos_semente (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null,
  pais  text
);


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Garante que cada usuário só acessa os próprios dados
-- =============================================

-- Profiles
alter table profiles enable row level security;

create policy "usuário vê próprio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "usuário edita próprio perfil"
  on profiles for update
  using (auth.uid() = id);

create policy "perfis públicos visíveis"
  on profiles for select
  using (modo_ninja = false);


-- Cultivos
alter table cultivos enable row level security;

create policy "ver próprios cultivos"
  on cultivos for select
  using (auth.uid() = user_id);

create policy "ver cultivos públicos"
  on cultivos for select
  using (publico = true);

create policy "criar/editar/deletar próprios cultivos"
  on cultivos for all
  using (auth.uid() = user_id);


-- Registros
alter table registros enable row level security;

create policy "acesso próprios registros"
  on registros for all
  using (auth.uid() = user_id);


-- Milestones
alter table milestones enable row level security;

create policy "acesso próprios milestones"
  on milestones for all
  using (auth.uid() = user_id);


-- Fórum
alter table posts_forum enable row level security;

create policy "ler fórum"
  on posts_forum for select
  using (true);

create policy "postar no fórum"
  on posts_forum for insert
  with check (auth.role() = 'authenticated');

alter table comentarios_forum enable row level security;

create policy "ler comentários"
  on comentarios_forum for select
  using (true);

create policy "comentar no fórum"
  on comentarios_forum for insert
  with check (auth.role() = 'authenticated');


-- Genéticas e Bancos (leitura pública)
alter table geneticas enable row level security;

create policy "ler genéticas"
  on geneticas for select
  using (true);

alter table bancos_semente enable row level security;

create policy "ler bancos"
  on bancos_semente for select
  using (true);


-- =============================================
-- TRIGGER: cria profile automaticamente no cadastro
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
