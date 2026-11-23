# Etapa 5 — Validação final e publicação

**Status: iniciada, publicação bloqueada até a aplicação funcionar integralmente.**

## Validação automatizada
O workflow `.github/workflows/validar-migracao.yml` confere a sintaxe do JavaScript, a geração não vazia do seed SQL e a presença dos arquivos essenciais. **A existência do workflow não comprova que ele executou ou passou.**

## Testes reais ainda necessários
- [ ] Etapa 2: banco provisionado, migrações e seed aplicados; dados conferidos (5 álbuns, 29 referências de fotos).
- [ ] Etapa 3: login, senha inválida, sessão persistente, logout, recuperação de senha e RLS testados.
- [ ] Etapa 4: interface do painel integrada; criar, editar, reordenar, publicar/despublicar e excluir álbum/foto; upload múltiplo testado.
- [ ] Site público: hero, galeria, filtros, lightbox, transições suaves e ausência de bordas pretas.
- [ ] Testes em desktop e celular, imagens sem erros, acessibilidade básica e desempenho.
- [ ] Validar links, contato, metadados e domínio.
- [ ] Criar backup/rollback e só então publicar após aprovação explícita do proprietário.

**Não publicar** enquanto as etapas 2–4 estiverem pendentes ou se houver falhas críticas. Não usar créditos do Lovable sem autorização explícita. Não acessar ZylPapers.
