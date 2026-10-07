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

-- DALZON BUILD — abonnements et limites
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro','business','agency')),
  status text not null default 'active' check (status in ('active','trialing','past_due','canceled')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
alter table public.subscriptions enable row level security;
drop policy if exists "Users can view their own subscription" on public.subscriptions;
drop policy if exists "Users can create their own subscription" on public.subscriptions;
create policy "Users can view their own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can create their own subscription" on public.subscriptions for insert with check (auth.uid() = user_id);
create or replace function public.set_subscriptions_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_subscriptions_updated_at();


-- DALZON BUILD — analytics anonymisées
create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  event_type text not null default 'pageview' check (event_type in ('pageview')),
  page_path text,
  referrer text,
  created_at timestamptz not null default now()
);
create index if not exists site_events_site_id_idx on public.site_events(site_id);
create index if not exists site_events_created_at_idx on public.site_events(created_at desc);
alter table public.site_events enable row level security;
drop policy if exists "Public can record page views for published sites" on public.site_events;
drop policy if exists "Owners can view analytics for their sites" on public.site_events;
create policy "Public can record page views for published sites"
on public.site_events for insert to anon, authenticated
with check (event_type = 'pageview' and exists (select 1 from public.sites s where s.id = site_id and s.status = 'published'));
create policy "Owners can view analytics for their sites"
on public.site_events for select to authenticated
using (exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));
