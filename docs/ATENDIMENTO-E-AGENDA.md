# Atendimento e agenda — implementação segura

## Situação
O formulário atual prepara mensagem para WhatsApp/e-mail, mas **não grava pedidos**. O SQL em `database/001_studio_requests.sql` é uma migração **ainda não executada**. Nenhum banco, serviço ou credencial foi criado.

## Fluxo proposto
1. Visitante escolhe serviço, informa nome, contato, detalhes e data/horário de preferência, aceita o tratamento dos dados.
2. Front-end envia pedido a uma API própria (HTTPS) com validação server-side, antispam, limitação de taxa e registro de consentimento.
3. API grava no banco **exclusivo** do estúdio, com status `new`.
4. Proprietário autenticado consulta os pedidos no painel e muda o status para `reviewing`, `proposed`, `approved`, `declined`, `completed` ou `cancelled`.
5. Só uma aprovação explícita, após checagem de conflitos, confirma o horário. Uma preferência enviada pelo cliente nunca equivale a reserva.

## Segurança
- Não expor chave de serviço ou senha de banco no navegador ou GitHub.
- Ativar RLS; não criar política pública para leitura ou escrita de pedidos.
- Verificar autorização no servidor para todas as operações administrativas.
- Nunca usar o banco, os usuários ou os tokens da ZylPapers.
- Definir política de retenção, aviso de privacidade e canal para exclusão/correção de dados antes de receber pedidos reais.
- Armazenar horário com fuso explícito na implementação da agenda; a data/hora preferida isolada não representa reserva.
- Validar conflitos no banco/transação para impedir duas confirmações simultâneas.

## Próximos marcos
- Provisionar infraestrutura exclusiva e configurar segredos no ambiente de hospedagem.
- Implementar API, autenticação administrativa, proteção antispam e testes.
- Conectar formulário à API, painel de pedidos e disponibilidade.
- Publicar somente após testes completos e configuração de contato e imagens autorais.
