/**
 * Contrato reutilizável para o painel administrativo futuro.
 * Injete um cliente Supabase configurado para o projeto correto.
 * Não contém chaves, não cria sessão simulada e não é conectado ao site público.
 */
export function createAdminAuth(supabase) {
  if (!supabase?.auth) throw new Error("Cliente Supabase não configurado");
  const requireAdmin = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return { authorized: false, reason: "unauthenticated" };
    const { data: allowed, error } = await supabase.rpc("is_site_admin");
    if (error) throw error;
    return { authorized: allowed === true, reason: allowed ? null : "forbidden", user: userData.user };
  };
  return {
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const result = await requireAdmin();
      if (!result.authorized) {
        await supabase.auth.signOut();
        throw new Error("Acesso administrativo não autorizado");
      }
      return result.user;
    },
    requireAdmin,
    async restoreSession() {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      return requireAdmin();
    },
    async resetPassword(email, redirectTo) {
      if (!redirectTo) throw new Error("URL de redefinição não configurada");
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(callback);
    },
  };
}
