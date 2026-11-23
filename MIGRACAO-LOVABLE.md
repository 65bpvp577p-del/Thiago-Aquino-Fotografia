# Migração para Lovable — Thiago Aquino Fotografia

## Estado e limites
- Preparação feita exclusivamente no GitHub, sem consumo de créditos Lovable.
- Projeto Lovable de destino: https://lovable.dev/projects/72ad3a2e-c0df-4fcf-9fd1-bbd038fa2398
- Site em produção: https://65bpvp577p-del.github.io/Thiago-Aquino-Fotografia/
- Não publicar, trocar DNS, remover o site atual nem tocar no projeto ZylPapers.
- Este documento não realiza importação automática. A migração efetiva depende de integração/importação no Lovable autorizada posteriormente.

## Fonte da verdade
- `index.html`: layout público e interações, preservar aparência e transições.
- `site.config.js`: marca, contato, serviços, portfólio, álbuns e fotos.
- `database/`: imagens referenciadas por caminhos relativos.
- `painel.html`, `painel.js`, `painel.css`: funcionalidades atuais a substituir por autenticação real e painel seguro.
- `tests/site-check.cjs`: verificações estáticas existentes.

## Dados atuais para preservar
- Álbuns: Casamento, Ensaio de Casal, Ensaios, Eventos e Famílias.
- Campos por álbum: id, title, subtitle, imageUrl, photos (imageUrl, alt e caption opcional).
- Preservar ordem, legendas, capa, nomes, conteúdo e URLs de fotos.
- Antes de importar, conferir se TODOS os arquivos referenciados existem; não publicar caminhos quebrados.

## Requisitos da versão Lovable
1. Interface pública responsiva fiel ao site atual (preto, branco e vermelho; galeria editorial; transições suaves).
2. Login administrativo com e-mail/senha e recuperação de acesso, sem token GitHub no navegador.
3. Controle de autorização no backend (RLS), garantindo que visitantes não possam modificar álbuns ou fotos.
4. Banco para álbuns/fotos, com ordenação persistente, movimentação/cópia entre álbuns, capas e exclusão confirmada.
5. Armazenamento de imagens com upload múltiplo, pré-visualização imediata, indicador de progresso, tratamento de erros e proteção contra duplicatas.
6. Fotos públicas só quando autorizadas; arquivos privados não podem usar bucket público.
7. Importação com verificação de integridade, backup e possibilidade de reversão.
8. SEO, links e formulários preservados; nenhum contato deve ser perdido.

## Plano de execução (somente com nova autorização)
1. Criar cópia de teste no Lovable a partir deste repositório, sem alterar o GitHub Pages.
2. Implantar autenticação e tabelas/políticas de acesso.
3. Migrar arquivos de imagem e metadados; verificar imagens quebradas.
4. Testar login/logout/recuperação, upload em lote, mover/copiar fotos, editar e excluir álbuns.
5. Comparar visual do site novo com o original em celular e desktop.
6. Somente após aprovação, planejar publicação e eventual migração de domínio.

## Condição de parada
Nenhuma chamada que execute trabalho de agente no Lovable, provisionamento ou importação será feita sem nova autorização explícita de créditos.
## Exportação gratuita de dados
Na raiz do repositório, execute `node scripts/exportar-migracao.cjs`.
Isso cria `migracao-export.json` com a configuração completa, os cinco álbuns, a ordem das fotografias e um inventário das imagens.
O relatório de execução informa `missingLocalAssets`; se não estiver vazio, corrigir os caminhos ou restaurar os arquivos antes da importação.
O script **não** faz upload, não autentica usuários, não altera o site publicado e não acessa Lovable.
O JSON é um pacote de metadados: os arquivos binários de `database/` precisam ser transferidos separadamente.
