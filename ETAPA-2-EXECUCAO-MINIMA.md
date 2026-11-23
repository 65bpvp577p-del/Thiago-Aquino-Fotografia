# Execução mínima da Etapa 2 — sem créditos Lovable

**Preparação realizada:** SQL de estrutura, seed com 5 álbuns e 29 fotos, bucket e políticas de escrita, consultas de conferência. **Ainda não aplicado a nenhum Supabase.**

## O que fazer no Supabase
1. Criar projeto gratuito separado para **Thiago Aquino Fotografia** em https://supabase.com/dashboard (não usar o projeto ZylPapers).
2. Abrir SQL Editor no projeto correto e executar, nesta ordem:
   - `database/migrations/001_site_schema.sql`
   - `database/migrations/002_portfolio_storage.sql`
   - `database/seed.sql`
   - `database/validar-etapa-2.sql`
3. Esperado: pelo menos 5 álbuns, 29 fotos, 7 configurações e RLS ativo nas quatro tabelas. A tabela `admin_users` começa vazia, até criar o administrador na Etapa 3.
4. As imagens originais continuam hospedadas no site estático. O seed preserva caminhos relativos como `./database/casal-01.jpg`. Para exibir esses caminhos no novo frontend, resolver em relação ao diretório público correto; **não tratar esses caminhos como URL Supabase**. Migrar binários para Storage e atualizar URLs somente quando a interface estiver preparada.
5. A chave `anon/publishable` pode ser usada no frontend sob RLS; **nunca publicar service_role, senha do banco ou tokens privados no GitHub**.
6. No Lovable, a integração deverá apenas conectar o cliente e substituir a leitura estática. Não solicitar recriação de tabelas.

## Avisos importantes
- O bucket `portfolio-public` é público: **não colocar fotografias privadas** nele. Uma imagem já publicada pode continuar acessível por URL mesmo que a linha do banco seja despublicada; para conteúdo privado, usar bucket privado e URLs assinadas.
- O módulo de upload da Etapa 4 exige login administrativo real e políticas RLS testadas.
- Não compartilhar credenciais nesta conversa.
- Não publicar o site ou mudar DNS sem autorização.
- A execução das migrações, os testes de permissão e a conexão com o Lovable continuam pendentes; a Etapa 2 não está operacionalmente concluída.
