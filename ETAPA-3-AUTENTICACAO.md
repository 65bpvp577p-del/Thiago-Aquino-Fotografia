# Etapa 3 — Autenticação administrativa

**Status: preparada, não ativada.** O banco Lovable retornou HTTP 402 (créditos insuficientes). Não existe login operacional novo até a infraestrutura ser conectada.

## Requisitos obrigatórios
- Autenticação via Supabase Auth com **e-mail e senha**. Nunca usar token pessoal GitHub no navegador.
- Cadastro público de administradores **desativado**. Administrador criado por convite ou pelo console seguro; autorização controlada pela tabela `public.admin_users`.
- Login em `/admin/login` com erros claros, sem revelar se o e-mail existe.
- Sessão persistente com refresh de token automático; ao recarregar, aguardar a checagem de sessão antes de redirecionar. Não armazenar senha, token de serviço ou GitHub PAT em localStorage.
- Recuperação de senha com link de uso único e URL de redirecionamento autorizada.
- Sair da conta invalida a sessão e redireciona ao login.
- Rotas administrativas protegidas por verificação de sessão **e** permissão no backend; nunca confiar apenas em ocultar botões.
- Consultas e alterações protegidas por RLS, com acesso de visitante somente ao conteúdo publicado.
- Nenhuma mudança no site público, domínio ou projeto ZylPapers.

## Contrato de autenticação
1. No login: `supabase.auth.signInWithPassword({email,password})`.
2. Depois do login: verificar `supabase.auth.getUser()` e consultar `public.is_site_admin()` via `rpc`; recusar usuário autenticado que não seja administrador.
3. No carregamento: `supabase.auth.getSession()` + `onAuthStateChange` para atualizar a interface; confirmação de permissão no backend.
4. Recuperação: `supabase.auth.resetPasswordForEmail(email,{redirectTo: '<URL-DE-RESET-AUTORIZADA>'})` e, na página de redefinição, `supabase.auth.updateUser({password})`.
5. Sair: `supabase.auth.signOut()`.
6. Em caso de falha de rede, token expirado ou permissão revogada: bloquear edição e mostrar mensagem recuperável.

## Checklist de validação antes de declarar concluída
- [ ] Banco e autenticação ativados no projeto Thiago Aquino Fotografia.
- [ ] Conta administrativa criada e autorizada com UUID na tabela `admin_users`.
- [ ] Login válido funciona; senha inválida falha sem revelar dados.
- [ ] Atualizar a página mantém a sessão.
- [ ] Logout encerra o acesso.
- [ ] Recuperação de senha funciona com e-mail real.
- [ ] Usuário comum e visitante não conseguem editar, inclusive por API.
- [ ] Login testado em celular e computador.
- [ ] Site público permanece funcionando.

**Não criar credenciais fictícias nem declarar conclusão sem esses testes.**
