-- DALZON BUILD — stockage des images
-- À exécuter dans Supabase > SQL Editor après schema.sql

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "DALZON BUILD upload site assets" on storage.objects;
drop policy if exists "DALZON BUILD read site assets" on storage.objects;
drop policy if exists "DALZON BUILD update site assets" on storage.objects;
drop policy if exists "DALZON BUILD delete site assets" on storage.objects;

create policy "DALZON BUILD upload site assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "DALZON BUILD read site assets"
on storage.objects for select to authenticated, anon
using (bucket_id = 'site-assets');

create policy "DALZON BUILD update site assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "DALZON BUILD delete site assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'site-assets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
