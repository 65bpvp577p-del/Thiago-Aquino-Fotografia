# Contrato da futura API de solicitações

O módulo `api/request-validation.js` valida os campos de uma solicitação **no servidor** e possui testes automatizados executáveis com `cd api && npm test` (Node.js 20+). É uma biblioteca, **não é um endpoint HTTP**.

## POST /api/requests (a implementar)
Entrada JSON: `client_name`, `client_phone`, `service_id`, `preferred_date` (AAAA-MM-DD, opcional), `preferred_time` (HH:MM, opcional), `location`, `details`, `consent: true`.

Resposta planejada: `202 Accepted` com identificador opaco e aviso de que o pedido **não confirma reserva**. Em erro de validação, `400` com campos inválidos. Nunca devolver dados de outras solicitações.

## Requisitos para colocar em produção
- Escolher e provisionar hospedagem da API e banco isolados.
- Verificar `service_id` contra catálogo ativo no servidor, não apenas formato.
- Aplicar limite de corpo, rate limiting por origem, antispam e logs sem dados pessoais sensíveis.
- Persistir consentimento e pedido em transação, com chave de banco apenas no servidor.
- Configurar CORS estrito, HTTPS, tratamento de erros e política de retenção.
- Proteger endpoints de listagem e alteração de status com autenticação e autorização administrativa.
- Testar conflitos de agenda, notificações e fuso horário.

**Não conectar diretamente o formulário público ao banco.** Enquanto a API não existir, manter o fluxo explícito de WhatsApp/e-mail.
