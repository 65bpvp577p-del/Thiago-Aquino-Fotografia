-- Etapa 2: modelo preparado para Supabase/PostgreSQL; NAO executado.
begin;
create extension if not exists pgcrypto;
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.albums (
  id text primary key,
  title text not null check (length(trim(title)) > 0),
  subtitle text not null default '',
  cover_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id text not null references public.albums(id) on delete cascade,
  image_url text not null check (length(trim(image_url)) > 0),
  storage_path text,
  alt text not null default '',
  caption text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (album_id, image_url)
);
create index if not exists photos_album_order_idx on public.photos(album_id, sort_order);
create index if not exists albums_published_order_idx on public.albums(published, sort_order);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create or replace function public.is_site_admin()
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;
alter table public.site_settings enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.admin_users enable row level security;
drop policy if exists settings_read on public.site_settings;
create policy settings_read on public.site_settings for select to anon, authenticated using (true);
drop policy if exists settings_admin on public.site_settings;
create policy settings_admin on public.site_settings for all to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
drop policy if exists albums_public_read on public.albums;
create policy albums_public_read on public.albums for select to anon, authenticated using (published);
drop policy if exists albums_admin on public.albums;
create policy albums_admin on public.albums for all to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
drop policy if exists photos_public_read on public.photos;
create policy photos_public_read on public.photos for select to anon, authenticated using (published and exists (select 1 from public.albums a where a.id = album_id and a.published));
drop policy if exists photos_admin on public.photos;
create policy photos_admin on public.photos for all to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
drop policy if exists admin_users_admin_read on public.admin_users;
create policy admin_users_admin_read on public.admin_users for select to authenticated using ((select public.is_site_admin()));
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.site_settings, public.albums, public.photos to anon, authenticated;
grant insert, update, delete on public.site_settings, public.albums, public.photos to authenticated;
commit;
