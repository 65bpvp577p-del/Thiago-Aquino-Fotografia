# API independente — Thiago Aquino Fotografia

Serviço HTTP Node.js (20+) com `POST /api/requests` e `GET /health`.

## Executar
1. Criar **outro** projeto Supabase, exclusivo do estúdio.
2. Executar `../database/001_studio_requests.sql` nesse novo projeto.
3. Definir `STUDIO_SUPABASE_URL`, `STUDIO_SUPABASE_SERVICE_KEY` e `STUDIO_ALLOWED_ORIGIN` no ambiente seguro do servidor. **Não** versionar as credenciais.
4. Executar `node server.js`; testes: `npm test`.

A API não foi implantada. O site estático continua enviando pedidos por WhatsApp/e-mail; ainda não está conectado à API.

## Limites antes da produção
O limite em memória é básico e não serve para várias instâncias. Implementar rate limiting compartilhado, proteção antispam adicional, catálogo de serviços validado no servidor, revisão de privacidade/LGPD, observabilidade e autenticação do painel. CORS **não** é autenticação nem impede clientes não navegador. Nunca considerar a data desejada como reserva. O endpoint de saúde não revela segredos.
