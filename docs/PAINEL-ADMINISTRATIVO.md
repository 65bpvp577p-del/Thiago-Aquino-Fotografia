# Consulta administrativa — primeira integração de backend

A API agora inclui `GET /api/admin/requests`. Antes de consultar o banco, verifica um token de acesso de usuário pelo endpoint `/auth/v1/user` do **Supabase exclusivo do estúdio**, e exige que o identificador autenticado corresponda a `STUDIO_ADMIN_USER_ID`. O token deve chegar em `Authorization: Bearer <token>`. A API limita a listagem aos 100 pedidos mais recentes. Há testes em `api/admin.test.js`.

## Variáveis de ambiente do servidor
- `STUDIO_SUPABASE_URL` — URL do projeto exclusivo
- `STUDIO_SUPABASE_SERVICE_KEY` — chave secreta apenas no servidor
- `STUDIO_SUPABASE_ANON_KEY` — chave pública para verificar token com Supabase Auth
- `STUDIO_ADMIN_USER_ID` — UUID do proprietário autorizado
- `STUDIO_ALLOWED_ORIGIN` — origem HTTPS do site/painel

**Ainda não existe interface de login nem integração da lista real no painel.** A interface `painel/` continua com dados fictícios. Não há endpoint de alteração de status nem confirmação de agenda. O banco não foi provisionado e nenhum teste foi executado nesta etapa.

Para produção: configurar HTTPS, autenticação real, proteção contra requisições abusivas, controle de sessão, paginação, auditoria, políticas de privacidade e testes integrados. A chave secreta não pode ser enviada ao navegador. Nunca usar credenciais da ZylPapers.
