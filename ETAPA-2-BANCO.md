# Etapa 2 — Banco de dados (preparação gratuita)
Status: **estrutura e importação preparadas; banco real NÃO provisionado nem conectado ao Lovable**.

## Arquivos
- `database/migrations/001_site_schema.sql`: esquema PostgreSQL/Supabase e políticas RLS.
- `scripts/gerar-seed-banco.cjs`: gera comandos SQL a partir do `site.config.js` original (5 álbuns e 29 referências de fotos).

## Implantação futura (exige autorização separada)
1. Criar/conectar PostgreSQL/Supabase ao projeto Thiago Aquino Fotografia (não ao ZylPapers).
2. Executar `database/migrations/001_site_schema.sql` com credenciais administrativas **fora do navegador**.
3. Executar `node scripts/gerar-seed-banco.cjs > database/seed.sql` e aplicar o SQL gerado uma única vez; o script também aceita reexecução sem duplicar as fotos por álbum.
4. Criar conta pelo serviço de autenticação e inserir seu UUID em `public.admin_users` **somente por console seguro/conta de serviço**. Não registrar senha, token ou chave de serviço no GitHub.
5. Migrar arquivos físicos para storage apropriado e atualizar URLs; configurar políticas de storage para uploads administrativos e leitura pública somente de arquivos autorizados. O SQL não cria buckets e não envia arquivos.
6. Conectar a interface aos dados e testar RLS: visitante lê somente conteúdo publicado, visitante não altera nada, administrador autenticado edita, e dados persistem após recarregar.
7. Não publicar nem alterar domínio sem aprovação.

## Limites e cautelas
- O site Lovable atualmente usa uma cópia estática do site original. Este banco não altera a interface até a integração.
- A coluna `image_url` conserva os caminhos relativos originais; após migrar para storage, os URLs devem ser atualizados.
- O seed não apaga registros adicionais e não altera automaticamente o campo `published` de registros existentes.
- A tabela `site_settings` é pública por definição: inserir somente conteúdo destinado à divulgação, nunca segredos.
- Não executar comandos SQL em um banco desconhecido ou compartilhado; confirmar o projeto de destino.
- Esta etapa de preparação não consome créditos do Lovable. A ativação e validação operacional permanecem pendentes.
