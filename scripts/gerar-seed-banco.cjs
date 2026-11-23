#!/usr/bin/env node
// Gera SQL de importação idempotente a partir da fonte de verdade site.config.js.
// Uso: node scripts/gerar-seed-banco.cjs > database/seed.sql
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('site.config.js', 'utf8');
const sandbox = {window:{}};
vm.runInNewContext(source,sandbox,{timeout:1000,filename:'site.config.js'});
const cfg=JSON.parse(JSON.stringify(sandbox.window.SITE_CONFIG));
if(!Array.isArray(cfg.albums)) throw new Error('Catalogo invalido');
const q = value => "'" + String(value ?? '').replace(/'/g,"''") + "'";
const rows = ['-- Gerado a partir de site.config.js; execute APOS 001_site_schema.sql','begin;'];
for (const key of ['brand','contact','hero','about','features','services','portfolio']) {
 rows.push('insert into public.site_settings(key,value) values ('+q(key)+','+q(JSON.stringify(cfg[key]))+'::jsonb) on conflict(key) do update set value=excluded.value, updated_at=now();');
}
cfg.albums.forEach((album,i)=>{
 rows.push('insert into public.albums(id,title,subtitle,cover_url,sort_order,published) values ('+[q(album.id),q(album.title),q(album.subtitle),q(album.imageUrl),i,'true'].join(',')+') on conflict(id) do update set title=excluded.title,subtitle=excluded.subtitle,cover_url=excluded.cover_url,sort_order=excluded.sort_order,updated_at=now();');
 (album.photos||[]).forEach((photo,j)=>{
  rows.push('insert into public.photos(album_id,image_url,alt,caption,sort_order,published) values ('+[q(album.id),q(photo.imageUrl),q(photo.alt),q(photo.caption),j,'true'].join(',')+') on conflict(album_id,image_url) do update set alt=excluded.alt,caption=excluded.caption,sort_order=excluded.sort_order,updated_at=now();');
 });
});
rows.push('commit;');
process.stdout.write(rows.join('\n')+'\n');
