# Ativação do painel administrativo — Thiago Aquino Fotografia

Painel: `https://65bpvp577p-del.github.io/Thiago-Aquino-Fotografia/admin/`.

## Antes do primeiro acesso

O painel usa **Supabase Auth** e exige que o usuário autenticado esteja na tabela `public.admin_users`. Não há senha padrão, nem cadastro público no painel. Não use chaves secretas no navegador.

1. No Supabase do projeto **Thiago Aquino Fotografia**, acesse **Authentication → Users** e crie ou convide o usuário administrador com seu e-mail pessoal. Defina senha forte por canal seguro. Confirme o e-mail, se exigido.
2. Copie o **UUID** do usuário criado em Authentication → Users.
3. Em **SQL Editor**, execute o comando abaixo substituindo apenas o UUID, sem alterar outras tabelas:

```sql
insert into public.admin_users (user_id)
values ('COLE-AQUI-O-UUID-DO-USUARIO'::uuid)
on conflict (user_id) do nothing;
```

4. Em **Authentication → URL Configuration**, configure **Site URL** para o endereço público do site e adicione **Redirect URL**: `https://65bpvp577p-del.github.io/Thiago-Aquino-Fotografia/admin/`. Isso permite recuperar a senha.
5. Abra o painel, entre com e-mail e senha e teste: criar álbum, enviar foto de teste, editar legenda, ocultar foto, verificar site público, excluir a foto de teste.

## Segurança

- A interface não protege os dados sozinha: o acesso é verificado por `is_site_admin()` e pelas políticas RLS do Supabase.
- O bucket `portfolio-public` é público: não envie fotografias privadas, galerias confidenciais ou arquivos de clientes sem autorização.
- Fotos importadas originalmente do repositório podem ter `storage_path` vazio. Ao excluir registros dessas fotos, o arquivo original no GitHub não é removido.
- A exclusão de álbum remove os registros associados e os arquivos do bucket associados; faça backup antes de excluir conteúdo importante.
- Não execute a inserção de administrador para um UUID desconhecido.
