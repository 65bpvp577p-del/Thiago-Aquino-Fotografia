import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { createAdminAuth } from '../auth/admin-auth.mjs';
import { createAlbumManager } from './album-manager.mjs';

const $ = id => document.getElementById(id);
// Fotos importadas do site antigo usam ./database/...; o painel vive em /admin/.
const siteRoot = new URL('../', import.meta.url);
function photoSrc(value) {
  const path = String(value || '').trim();
  if (!path) return '';
  try {
    const url = new URL(path, siteRoot);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    return url.href;
  } catch { return ''; }
}
function previewImage(value, alt) {
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = alt || 'Prévia da fotografia';
  const src = photoSrc(value);
  if (src) img.src = src;
  else img.hidden = true;
  img.addEventListener('error', () => {
    img.hidden = true;
    if (!img.parentElement.querySelector('.image-fallback')) {
      img.parentElement.prepend(element('p', 'Prévia indisponível', 'image-fallback'));
    }
  });
  return img;
}
const cfg = window.SUPABASE_PUBLIC_CONFIG || {};
const base = typeof cfg.url === 'string' ? cfg.url.replace(/\/+$/, '') : '';
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base) || !String(cfg.publishableKey || '').startsWith('sb_publishable_')) {
  $('message').textContent = 'Configuração pública indisponível. Verifique a publicação do GitHub Pages.';
  $('message').className = 'error';
  $('loginForm').querySelector('button').disabled = true;
  throw new Error('Configuração Supabase ausente');
}
const supabase = createClient(base, cfg.publishableKey, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } });
const auth = createAdminAuth(supabase);
const manager = createAlbumManager(supabase);
let albums = [];
let photos = [];
let busy = false;
const message = (text, error = false) => { $('message').textContent = text; $('message').className = error ? 'error' : 'ok'; };
async function run(task) {
  if (busy) return;
  busy = true;
  try { await task(); } catch (error) { message(error.message || 'Ocorreu um erro', true); }
  finally { busy = false; }
}
function element(tag, text, cls) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = String(text);
  if (cls) el.className = cls;
  return el;
}
function button(label, handler, cls = 'secondary') {
  const b = element('button', label, cls);
  b.type = 'button';
  b.addEventListener('click', handler);
  return b;
}
function field(label, value, change, type = 'text') {
  const wrap = element('div');
  const lab = element('label', label);
  const inp = document.createElement('input');
  inp.type = type;
  if (type === 'checkbox') inp.checked = Boolean(value);
  else inp.value = value ?? '';
  inp.addEventListener('change', () => change(type === 'checkbox' ? inp.checked : (type === 'number' ? Number(inp.value) : inp.value)));
  lab.append(inp); wrap.append(lab);
  return wrap;
}
async function refresh() {
  albums = await manager.listAlbums();
  photos = albums.flatMap(a => a.photos);
  drawAlbums();
  const selected = $('photoAlbum').value;
  $('photoAlbum').replaceChildren();
  for (const a of albums) {
    const opt = document.createElement('option');
    opt.value = a.id; opt.textContent = a.title;
    $('photoAlbum').append(opt);
  }
  if (albums.some(a => a.id === selected)) $('photoAlbum').value = selected;
  drawPhotos();
}
function drawAlbums() {
  $('albumList').replaceChildren();
  if (!albums.length) $('albumList').append(element('p', 'Nenhum álbum cadastrado.'));
  for (const a of albums) {
    const card = element('article', undefined, 'album');
    const cover = a.cover_url || a.photos[0]?.image_url;
    if (cover) card.append(previewImage(cover, 'Capa de ' + a.title));
    card.append(element('h3', a.title), element('p', (a.subtitle || '') + ' • ' + a.photos.length + ' fotos • ' + (a.published ? 'Publicado' : 'Oculto')));
    const actions = element('div', undefined, 'row');
    actions.append(
      button('Editar', () => {
        $('albumId').value = a.id; $('albumTitle').value = a.title;
        $('albumSubtitle').value = a.subtitle || ''; $('albumOrder').value = a.sort_order;
        $('albumCover').value = a.cover_url || '';
        $('albumPublished').checked = a.published;
        $('albumTitle').focus(); window.scrollTo({ top: 0, behavior: 'smooth' });
      }),
      button('Ver fotos', () => { $('photoAlbum').value = a.id; drawPhotos(); $('photoAlbum').scrollIntoView({ behavior: 'smooth' }); }),
      button('Excluir', () => run(async () => {
        if (!confirm('Excluir o álbum "' + a.title + '" e todas as fotografias vinculadas? Esta ação não pode ser desfeita.')) return;
        await manager.deleteAlbum(a.id, { confirmed: true });
        message('Álbum excluído.'); await refresh();
      }), 'danger')
    );
    card.append(actions); $('albumList').append(card);
  }
}
function drawPhotos() {
  const id = $('photoAlbum').value;
  $('photoList').replaceChildren();
  if (!id) { $('photoList').append(element('p', 'Crie um álbum para adicionar fotografias.')); return; }
  const chosen = photos.filter(p => p.album_id === id);
  if (!chosen.length) $('photoList').append(element('p', 'Este álbum ainda não tem fotografias.'));
  for (const p of chosen) {
    const card = element('article', undefined, 'photo');
    card.append(previewImage(p.image_url, p.alt || 'Fotografia'));
    card.append(field('Descrição da fotografia', p.alt, value => run(async () => { await manager.editPhoto(p.id, { alt: value }); message('Descrição salva.'); })));
    card.append(field('Legenda', p.caption, value => run(async () => { await manager.editPhoto(p.id, { caption: value }); message('Legenda salva.'); })));
    card.append(field('Ordem', p.sort_order, value => run(async () => { await manager.editPhoto(p.id, { sort_order: value }); message('Ordem salva.'); await refresh(); }), 'number'));
    card.append(field('Publicada', p.published, value => run(async () => { await manager.editPhoto(p.id, { published: value }); message('Visibilidade atualizada.'); }), 'checkbox'));
    card.append(button('Excluir fotografia', () => run(async () => {
      if (!confirm('Excluir esta fotografia permanentemente?')) return;
      await manager.deletePhoto(p.id, { confirmed: true });
      message('Fotografia excluída.'); await refresh();
    }), 'danger'));
    $('photoList').append(card);
  }
}
function clearAlbum() {
  $('albumForm').reset(); $('albumId').value = ''; $('albumOrder').value = '0'; $('albumPublished').checked = true;
}
async function showDashboard() {
  $('loadingSection').hidden = true;
  $('loginSection').hidden = true; $('dashboard').hidden = false; $('logout').hidden = false;
  await refresh(); message('Painel conectado com segurança.');
}
function showLogin() {
  $('loadingSection').hidden = true;
  $('dashboard').hidden = true; $('logout').hidden = true; $('loginSection').hidden = false;
}
$('loginForm').addEventListener('submit', event => { event.preventDefault(); run(async () => {
  await auth.signIn($('email').value.trim(), $('password').value);
  $('password').value = ''; await showDashboard();
}); });
$('logout').addEventListener('click', () => run(async () => { await auth.signOut(); showLogin(); message('Sessão encerrada.'); }));
$('reset').addEventListener('click', () => run(async () => {
  const email = $('email').value.trim();
  if (!email) throw new Error('Informe seu e-mail para recuperar a senha.');
  await auth.resetPassword(email, new URL('./', location.href).href);
  message('Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.');
}));
$('savePassword').addEventListener('click', () => run(async () => {
  if ($('newPassword').value.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
  await auth.updatePassword($('newPassword').value);
  $('newPassword').value = ''; $('newPasswordArea').hidden = true;
  message('Senha atualizada.'); await auth.signOut(); showLogin();
}));
$('clearAlbum').addEventListener('click', clearAlbum);
$('albumForm').addEventListener('submit', event => { event.preventDefault(); run(async () => {
  const id = $('albumId').value;
  const data = {
    title: $('albumTitle').value.trim(), subtitle: $('albumSubtitle').value.trim(),
    sort_order: Number($('albumOrder').value) || 0,
    cover_url: $('albumCover').value.trim() || null, published: $('albumPublished').checked
  };
  if (id) await manager.updateAlbum(id, data);
  else await manager.saveAlbum(data);
  clearAlbum(); await refresh(); message('Álbum salvo.');
}); });
$('photoAlbum').addEventListener('change', drawPhotos);
$('upload').addEventListener('click', () => run(async () => {
  const albumId = $('photoAlbum').value;
  if (!albumId) throw new Error('Crie ou selecione um álbum primeiro.');
  const files = [...$('files').files];
  if (!files.length) throw new Error('Selecione as fotografias para enviar.');
  $('upload').disabled = true;
  try {
    await manager.uploadPhotos(albumId, files, ({ completed, total }) => {
      $('uploadStatus').textContent = 'Enviadas ' + completed + ' de ' + total + ' fotografias.';
    });
    $('files').value = ''; await refresh(); message('Fotografias enviadas com sucesso.');
  } finally { $('upload').disabled = false; }
}));
auth.onAuthStateChange(event => {
  if (event === 'PASSWORD_RECOVERY') {
    showLogin(); $('newPasswordArea').hidden = false;
    message('Defina sua nova senha.');
  }
});
run(async () => {
  try {
    const status = await auth.restoreSession();
    if (status.authorized) await showDashboard();
    else {
      showLogin();
      if (status.reason === 'forbidden') message('Conta sem permissão de administrador.', true);
    }
  } catch (error) {
    showLogin();
    throw error;
  }
});
