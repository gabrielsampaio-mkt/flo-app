-- =============================================
-- Flô — Sprint 3: políticas extras
-- Execute no Supabase > SQL Editor
-- =============================================

-- Permite usuários autenticados votarem em posts do fórum
create policy "autenticado pode votar em posts"
  on posts_forum for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Permite usuários autenticados votarem em comentários
create policy "autenticado pode votar em comentários"
  on comentarios_forum for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
