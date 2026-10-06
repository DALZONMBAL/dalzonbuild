-- DALZON BUILD — base initiale
-- À exécuter dans Supabase > SQL Editor

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  template text default 'starter',
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sites_user_id_idx on public.sites(user_id);

alter table public.sites enable row level security;

create policy "Users can view their own sites"
on public.sites for select
using (auth.uid() = user_id);

create policy "Users can create their own sites"
on public.sites for insert
with check (auth.uid() = user_id);

create policy "Users can update their own sites"
on public.sites for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own sites"
on public.sites for delete
using (auth.uid() = user_id);
