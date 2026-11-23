# Integração de leitura pública — sem publicação

- `index.html` carrega `site.config.js`, configuração pública e loader antes de renderizar.
- `supabase-public-loader.js` consulta álbuns e fotos publicados via REST/RLS e preserva a experiência da galeria; se API falhar, mantém os dados estáticos originais.
- `supabase-public-config.js` é propositalmente inativo no repositório.
- Workflow manual `Preparar integracao Supabase (sem publicar)` usa as duas **Variables** do GitHub para gerar arquivo de configuração pública como artefato; **não publica e não sincroniza com Lovable**.
- URLs relativas de fotos importadas são resolvidas em relação ao index.html. No Lovable, onde o site foi copiado para `/site/`, os caminhos deverão continuar relativos à página do iframe.
- Somente chave `sb_publishable_` no frontend; nunca chave secreta.
- **Pendente:** executar workflow, testar consulta real e integração do Lovable, confirmar filtros, fotos, mobile e políticas RLS. Nada foi publicado.
