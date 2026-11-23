# Etapa 4 — Painel de gerenciamento

**Estado: operações preparadas em código; painel visual ainda não integrado, banco e login ainda não ativos.**

## Módulo
`admin/album-manager.mjs` exporta `createAlbumManager(supabase)` e oferece:
- listagem de álbuns com fotos em ordem;
- criação e edição de álbuns, capa, visibilidade e ordenação;
- upload múltiplo sequencial com validação JPG/JPEG/PNG/WEBP, limite 20 MB por arquivo e callback de progresso por arquivo concluído;
- edição de legenda, texto alternativo, publicação, posição e álbum da foto;
- exclusão de fotos e álbuns com confirmação obrigatória e tentativa de limpeza de arquivos de storage.

## Antes de ativar
1. Etapa 2: provisionar PostgreSQL e aplicar esquema/seed.
2. Etapa 3: autenticação real, administrador autorizado e RLS verificado.
3. Criar bucket `portfolio-public` e políticas de storage: leitura pública **apenas para imagens aprovadas**, escrita e exclusão somente para administradores. A implementação atual usa URL pública e marca uploads como publicados; **não usar para imagens privadas**. Para fotos privadas, criar fluxo separado com bucket privado e URLs assinadas.
4. Integrar módulo ao frontend do Lovable, com interface para criar/editar álbuns, seleção múltipla de imagens, prévia, estados de erro, ordenação e confirmação de exclusão.
5. Testar uploads reais, rede interrompida, arquivos duplicados, permissões, persistência, exclusões e responsividade. Em caso de erro de storage após exclusão no banco, o módulo sinaliza necessidade de limpeza manual.
6. Implementar operação transacional ou fila de limpeza para remoções em massa e movimentação/cópia de arquivos quando necessário.
7. Verificar que a página pública não depende de arquivos estáticos após ativar o banco.

**Atenção:** o módulo é uma base de integração, não um painel pronto para uso. Não foi executado no Lovable, nem publicado. Nenhum crédito foi gasto.
