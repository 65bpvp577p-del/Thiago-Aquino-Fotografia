-- Execute no SQL Editor do projeto correto APOS schema e seed.
select 'albums' as item, count(*) as total from public.albums
union all select 'photos', count(*) from public.photos
union all select 'site_settings', count(*) from public.site_settings
union all select 'admin_users', count(*) from public.admin_users;
select a.id, a.title, a.published, count(p.id) as total_photos
from public.albums a left join public.photos p on p.album_id = a.id
group by a.id, a.title, a.published order by a.title;
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('albums','photos','site_settings','admin_users')
order by tablename;
select id, public, file_size_limit from storage.buckets where id='portfolio-public';
