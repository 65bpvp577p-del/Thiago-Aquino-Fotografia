-- Execute somente em um projeto Supabase NOVO e exclusivo do estúdio.
-- Não executar no banco de dados da ZylPapers.
create extension if not exists pgcrypto;
create table if not exists public.studio_requests (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 client_name text not null check (char_length(trim(client_name)) between 2 and 120),
 client_phone text not null check (char_length(trim(client_phone)) between 8 and 30),
 service_id text not null check (char_length(service_id) between 1 and 80),
 preferred_date date,
 preferred_time time,
 location text check (char_length(location) <= 200),
 details text check (char_length(details) <= 2000),
 consent_at timestamptz not null,
 status text not null default 'new' check (status in ('new','reviewing','proposed','approved','declined','completed','cancelled')),
 internal_notes text check (char_length(internal_notes) <= 4000),
 proposed_date date,
 proposed_time time,
 decided_at timestamptz,
 updated_at timestamptz not null default now()
);
create index if not exists studio_requests_created_at_idx on public.studio_requests(created_at desc);
create index if not exists studio_requests_status_idx on public.studio_requests(status);
alter table public.studio_requests enable row level security;
-- Sem políticas públicas: visitantes não podem ler, criar ou alterar registros diretamente.
-- Criação de pedidos: somente por endpoint de servidor com validação, rate limit e antispam.
-- Administração: somente após implementar autenticação e autorização verificadas no servidor.
comment on table public.studio_requests is 'Dados privados do estúdio. Não conectar diretamente ao formulário público.';
