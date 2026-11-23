-- Executar uma vez no SQL Editor do Supabase. Dados privados, somente administradores.
begin;
create extension if not exists pgcrypto;
create table if not exists public.photo_jobs (
 id uuid primary key default gen_random_uuid(),
 client_name text not null check(length(trim(client_name))>0),
 client_phone text not null default '',
 client_email text not null default '',
 service_name text not null check(length(trim(service_name))>0),
 event_date date,
 start_time time,
 location text not null default '',
 status text not null default 'orcamento' check(status in ('orcamento','aguardando','confirmado','realizado','entregue','cancelado')),
 quote_status text not null default 'rascunho' check(quote_status in ('rascunho','enviado','aprovado','recusado')),
 description text not null default '',
 total_amount numeric(12,2) not null default 0 check(total_amount>=0),
 valid_until date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.photo_job_transactions (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.photo_jobs(id) on delete cascade,
 kind text not null check(kind in ('receita','despesa')),
 description text not null default '',
 amount numeric(12,2) not null check(amount>0),
 due_date date,
 paid_at date,
 payment_method text not null default '',
 created_at timestamptz not null default now()
);
create index if not exists photo_jobs_date_idx on public.photo_jobs(event_date);
create index if not exists photo_job_transactions_job_idx on public.photo_job_transactions(job_id);
alter table public.photo_jobs enable row level security;
alter table public.photo_job_transactions enable row level security;
drop policy if exists photo_jobs_admin on public.photo_jobs;
create policy photo_jobs_admin on public.photo_jobs for all to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
drop policy if exists photo_job_transactions_admin on public.photo_job_transactions;
create policy photo_job_transactions_admin on public.photo_job_transactions for all to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));
revoke all on public.photo_jobs,public.photo_job_transactions from anon;
grant select,insert,update,delete on public.photo_jobs,public.photo_job_transactions to authenticated;
commit;
