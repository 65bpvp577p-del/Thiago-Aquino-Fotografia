/**
 * Operações administrativas para futura integração ao painel Lovable.
 * Recebe cliente Supabase configurado e só executa após checar autorização.
 * Não usa token GitHub nem armazena credenciais.
 */
export function createAlbumManager(supabase, { bucket = "portfolio-public" } = {}) {
  if (!supabase?.auth || !supabase?.from || !supabase?.storage) throw new Error("Cliente Supabase inválido");
  const ensureAdmin = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) throw new Error("Faça login para continuar");
    const { data: allowed, error } = await supabase.rpc("is_site_admin");
    if (error || allowed !== true) throw new Error("Acesso administrativo não autorizado");
  };
  const check = (result) => {
    if (result.error) throw result.error;
    return result.data;
  };
  const cleanName = (name) => String(name || "").trim();
  const normalizeImage = (value) => String(value || "").trim();
  const makePath = (albumId, file) => {
    const extension = (file.name.split(".").pop() || "").toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(extension)) throw new Error(`O arquivo "${file.name}" não é JPG, PNG ou WebP. Exporte HEIC/RAW como JPEG antes de enviar.`);
    if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" não foi reconhecido como imagem.`);
    if (file.size > 20 * 1024 * 1024) throw new Error(`"${file.name}" excede 20 MB. Exporte uma versão otimizada para o site.`);
    return `albums/${encodeURIComponent(albumId)}/${crypto.randomUUID()}.${extension}`;
  };
  return {
    async listAlbums() {
      await ensureAdmin();
      const albums = check(await supabase.from("albums").select("*").order("sort_order"));
      const photos = check(await supabase.from("photos").select("*").order("sort_order"));
      return albums.map(album => ({ ...album, photos: photos.filter(photo => photo.album_id === album.id) }));
    },
    async saveAlbum({ id, title, subtitle = "", cover_url = null, sort_order = 0, published = true }) {
      await ensureAdmin();
      if (!cleanName(title)) throw new Error("Informe o nome do álbum");
      const record = { id: cleanName(id) || crypto.randomUUID(), title: cleanName(title), subtitle: cleanName(subtitle), cover_url, sort_order, published };
      return check(await supabase.from("albums").upsert(record, { onConflict: "id" }).select().single());
    },
    async updateAlbum(id, changes) {
      await ensureAdmin();
      const allowed = ["title", "subtitle", "cover_url", "sort_order", "published"];
      const updates = Object.fromEntries(Object.entries(changes).filter(([key]) => allowed.includes(key)));
      if (updates.title !== undefined && !cleanName(updates.title)) throw new Error("Nome do álbum obrigatório");
      if (!Object.keys(updates).length) return null;
      return check(await supabase.from("albums").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single());
    },
    async uploadPhotos(albumId, files, onProgress = () => {}) {
      await ensureAdmin();
      const list = Array.from(files || []);
      if (!list.length) return [];
      const album = check(await supabase.from("albums").select("id").eq("id", albumId).single());
      if (!album) throw new Error("Álbum não encontrado");
      const existing = check(await supabase.from("photos").select("sort_order").eq("album_id", albumId).order("sort_order", { ascending: false }).limit(1));
      const baseOrder = existing.length ? existing[0].sort_order + 1 : 0;
      const results = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const path = makePath(albumId, file);
        check(await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || (path.endsWith(".png") ? "image/png" : path.endsWith(".webp") ? "image/webp" : "image/jpeg") }));
        try {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
          const image_url = normalizeImage(urlData?.publicUrl);
          if (!image_url) throw new Error("Não foi possível gerar URL da imagem");
          const photo = check(await supabase.from("photos").insert({
            album_id: albumId, image_url, storage_path: path,
            alt: file.name.replace(/\.[^.]+$/, ""), sort_order: baseOrder + i, published: true
          }).select().single());
          results.push(photo);
          onProgress({ completed: i + 1, total: list.length, photo });
        } catch (error) {
          await supabase.storage.from(bucket).remove([path]);
          throw error;
        }
      }
      return results;
    },
    async editPhoto(id, changes) {
      await ensureAdmin();
      const allowed = ["alt", "caption", "sort_order", "published", "album_id"];
      const updates = Object.fromEntries(Object.entries(changes).filter(([key]) => allowed.includes(key)));
      return check(await supabase.from("photos").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single());
    },
    async deletePhoto(id, { confirmed = false } = {}) {
      if (!confirmed) throw new Error("Confirme a exclusão da fotografia");
      await ensureAdmin();
      const photo = check(await supabase.from("photos").select("*").eq("id", id).single());
      check(await supabase.from("photos").delete().eq("id", id));
      if (photo.storage_path) {
        const { error } = await supabase.storage.from(bucket).remove([photo.storage_path]);
        if (error) throw new Error("Registro removido, mas o arquivo precisa de limpeza manual: " + error.message);
      }
    },
    async deleteAlbum(id, { confirmed = false } = {}) {
      if (!confirmed) throw new Error("Confirme a exclusão do álbum e de suas fotos");
      await ensureAdmin();
      const photos = check(await supabase.from("photos").select("storage_path").eq("album_id", id));
      const paths = photos.map(p => p.storage_path).filter(Boolean);
      // Evita remover arquivos antes de saber se a exclusão no banco foi autorizada.
      check(await supabase.from("albums").delete().eq("id", id));
      if (paths.length) {
        const { error } = await supabase.storage.from(bucket).remove(paths);
        if (error) throw new Error("Álbum removido, mas alguns arquivos precisam de limpeza manual: " + error.message);
      }
    }
  };
}
