-- Executar somente no projeto Supabase EXCLUSIVO Thiago Aquino Fotografia.
-- Portfolio publico: arquivos publicados sao acessiveis por URL publica.
-- Nunca armazenar fotos privadas neste bucket.
begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-public', 'portfolio-public', true, 20971520, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,
  file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "portfolio_admin_insert" on storage.objects;
create policy "portfolio_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'portfolio-public' and (select public.is_site_admin()));

drop policy if exists "portfolio_admin_update" on storage.objects;
create policy "portfolio_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'portfolio-public' and (select public.is_site_admin()))
with check (bucket_id = 'portfolio-public' and (select public.is_site_admin()));

drop policy if exists "portfolio_admin_delete" on storage.objects;
create policy "portfolio_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'portfolio-public' and (select public.is_site_admin()));

drop policy if exists "portfolio_admin_select" on storage.objects;
create policy "portfolio_admin_select" on storage.objects
for select to authenticated
using (bucket_id = 'portfolio-public' and (select public.is_site_admin()));
commit;
