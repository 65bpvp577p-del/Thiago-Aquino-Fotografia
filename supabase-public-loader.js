/* Leitura pública do Supabase, com fallback para o site.config.js existente.
 * Configuração via window.SUPABASE_PUBLIC_CONFIG = { url, publishableKey }.
 * Nunca incluir service_role/secret keys no navegador.
 */
(function () {
  'use strict';
  const timeout = (ms) => AbortSignal.timeout(ms);
  const config = window.SUPABASE_PUBLIC_CONFIG || {};
  const base = typeof config.url === 'string' ? config.url.replace(/\/+$/, '') : '';
  const key = config.publishableKey;
  const enabled = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base) && typeof key === 'string' && key.startsWith('sb_publishable_');
  async function read(table, select, order, signal) {
    const endpoint = new URL(base + '/rest/v1/' + table);
    endpoint.searchParams.set('select', select);
    endpoint.searchParams.set('order', order);
    endpoint.searchParams.set('published', 'eq.true');
    const response = await fetch(endpoint, {
      headers: { apikey: key, Accept: 'application/json' },
      signal
    });
    if (!response.ok) throw new Error('Falha ao consultar ' + table + ': HTTP ' + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Resposta inesperada de ' + table);
    return data;
  }
  function resolveImage(path) {
    if (!path || typeof path !== 'string') return '';
    if (/^https:\/\//i.test(path)) return path;
    if (/^(?:data:|javascript:|\/\/)/i.test(path)) return '';
    // Os caminhos importados do site.config.js são relativos ao index.html.
    return new URL(path, document.baseURI).href;
  }
  window.loadPortfolioFromSupabase = async function () {
    if (!enabled) return false;
    try {
      const [albums, photos] = await Promise.all([
        read('albums', 'id,title,subtitle,cover_url,sort_order,published', 'sort_order.asc', timeout(8000)),
        read('photos', 'album_id,image_url,alt,caption,sort_order,published', 'sort_order.asc', timeout(8000))
      ]);
      const published = new Set(albums.map(a => a.id));
      const validPhotos = photos.filter(p => published.has(p.album_id));
      const nextAlbums = albums.map(a => ({
        id: a.id, title: a.title, subtitle: a.subtitle || '',
        imageUrl: resolveImage(validPhotos.find(p => p.album_id === a.id && p.image_url === a.cover_url)?.image_url || validPhotos.find(p => p.album_id === a.id)?.image_url || ''),
        photos: validPhotos.filter(p => p.album_id === a.id).map(p => ({
          imageUrl: resolveImage(p.image_url), alt: p.alt || '', caption: p.caption || ''
        })).filter(p => p.imageUrl)
      }));
      if (!window.SITE_CONFIG || !Array.isArray(window.SITE_CONFIG.albums)) throw new Error('Configuração estática indisponível');
      window.SITE_CONFIG.albums = nextAlbums;
      return true;
    } catch (error) {
      console.warn('Supabase indisponível; usando portfólio estático.', error);
      return false;
    }
  };
})();
