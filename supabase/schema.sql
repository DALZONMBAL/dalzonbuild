-- DALZON BUILD — base et contenu des sites
-- À exécuter dans Supabase > SQL Editor

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  template text default 'starter',
  status text not null default 'draft' check (status in ('draft','published')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sites add column if not exists content jsonb not null default '{}'::jsonb;

create index if not exists sites_user_id_idx on public.sites(user_id);

alter table public.sites enable row level security;

drop policy if exists "Users can view their own sites" on public.sites;
drop policy if exists "Users can create their own sites" on public.sites;
drop policy if exists "Users can update their own sites" on public.sites;
drop policy if exists "Users can delete their own sites" on public.sites;

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

-- Mise à jour automatique de updated_at
create or replace function public.set_sites_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sites_updated_at on public.sites;
create trigger sites_updated_at
before update on public.sites
for each row execute function public.set_sites_updated_at();