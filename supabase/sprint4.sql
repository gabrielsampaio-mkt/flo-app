-- =============================================
-- Flô — Sprint 4: Membros Fundadores
-- Execute no Supabase > SQL Editor
-- =============================================

-- Atualiza trigger de cadastro: atribui membro_numero e is_fundador
create or replace function public.handle_new_user()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(membro_numero), 0) + 1 into next_num from public.profiles;

  insert into public.profiles (id, username, membro_numero, is_fundador)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    next_num,
    next_num <= 150
  );
  return new;
end;
$$ language plpgsql security definer;

-- Preenche membro_numero de usuários já cadastrados (rode uma vez)
do $$
declare
  r record;
  next_num integer;
begin
  select coalesce(max(membro_numero), 0) into next_num from public.profiles;
  for r in
    select id from public.profiles where membro_numero is null order by created_at
  loop
    next_num := next_num + 1;
    update public.profiles
    set membro_numero = next_num, is_fundador = next_num <= 150
    where id = r.id;
  end loop;
end $$;

-- Função pública: vagas restantes de Membros Fundadores
create or replace function public.fundadores_restantes()
returns integer
language sql
security definer
stable
as $$
  select greatest(0, 150 - count(*)::integer)
  from public.profiles
  where membro_numero is not null and membro_numero <= 150;
$$;

grant execute on function public.fundadores_restantes() to anon, authenticated;
