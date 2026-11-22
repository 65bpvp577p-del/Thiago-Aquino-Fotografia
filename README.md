# Template de site — Thiago Aquino Fotografia

Protótipo estático independente, criado na branch de preparação. **Não está publicado nem integrado a um backend.**

## Visualização local
Sirva esta pasta com um servidor HTTP estático, por exemplo `python3 -m http.server 8080`, e abra `http://localhost:8080`.

## Personalização rápida
Edite somente `site.config.js` para trocar nome, cores, textos, serviços, portfólio, canais de contato e módulos visíveis. As imagens precisam ser URLs de arquivos próprios/licenciados.

## Formulário
O formulário **não salva solicitações em banco de dados**. Ele prepara uma mensagem de WhatsApp ou e-mail para o visitante enviar. Não há reserva automática, confirmação nem controle de disponibilidade. Configure `contact.whatsapp` (DDI+DDD+número) ou `contact.email` antes de usar. Sem canal configurado, o envio é bloqueado com aviso.

## Próxima fase
Migrar o template para repositório separado, integrar painel, armazenamento de fotos, solicitações, agenda, autenticação, validação server-side, antispam, privacidade/LGPD e testes. Não reutilizar credenciais nem dados de produção da ZylPapers.
\n## Editor de configuração (admin.html)\nAbra `admin.html` pelo mesmo servidor local. O botão **Visualizar alterações** abre a página inicial com uma configuração temporária desta sessão; não altera o site publicado. O botão **Baixar configuração** exporta `site.config.js`: substitua o arquivo de configuração **na cópia independente**, depois de revisar os dados. Este editor não autentica usuários e não deve ser exposto como painel de produção.\n
## Estado funcional e isolamento
Este repositório contém apenas HTML, CSS e JavaScript estáticos, sem dependências de execução do projeto ZylPapers, sem chaves de API e sem conexão com seu banco de dados. `features.booking` controla os campos de data e horário; `features.quotes` controla a seção de solicitação. **Agendamentos são apenas pedidos de contato, não reservas confirmadas.** Para produção, implementar autenticação e persistência próprias, validação de disponibilidade no servidor e proteção de dados pessoais.

## Direção visual aprovada como referência (novembro de 2026)
Identidade provisória em **preto, branco e vermelho**, inspirada na marca atual do fotógrafo (ícone de câmera com faixa vermelha e assinatura). A foto da marca sobre tecido **não é usada como logotipo definitivo**, para evitar reproduzir textura e distorções da camisa. Substituir por arquivo original transparente ou vetorial quando disponível. Fotografia autoral e portfólio reais ainda precisam ser fornecidos; os cartões sem imagem são espaços reservados, não trabalhos do fotógrafo.

## Retrato selecionado
A configuração aponta para `assets/retrato-thiago.png`, imagem selecionada pelo fotógrafo na conversa. **O arquivo binário ainda não foi enviado ao GitHub**: o site mantém a área reservada até a inclusão da foto. Para uma versão pronta para visualização com a imagem, usar o pacote local fornecido na conversa. A imagem é gerada por IA e requer conferência antes de publicação.

## Álbuns públicos
A seção de álbuns é configurável em `site.config.js` (`features.albums` e `albums`). Exibe **capas e metadados demonstrativos**, sem links de abertura nem publicação de fotos reais nesta fase. A visualização completa de álbuns e galerias privadas exigirá desenvolvimento adicional, autorização dos titulares e controle de acesso.

## Visualização de álbuns (protótipo funcional)
Os cartões da seção Álbuns agora abrem uma janela com as fotografias configuradas em `albums[].photos`. Cada item aceita `{ imageUrl: "./assets/foto.jpg", alt: "Descrição", caption: "Legenda" }`. Ao tocar numa foto, ela abre ampliada; a tecla Esc fecha as janelas. Álbuns sem imagens exibem aviso de conteúdo ainda não publicado. **Esta funcionalidade é apenas para álbuns públicos:** não utilizar para fotos privadas, links secretos ou imagens sem autorização. A publicação de álbuns privados exigirá backend autenticado e URLs protegidas.

## Editor de álbuns
No `admin.html`, a seção **Álbuns públicos** permite adicionar/remover álbuns, editar capa, título, descrição e fotos sem escrever JSON. Para cada foto, use uma linha no formato `./assets/foto.jpg | Legenda | Texto alternativo` (ou URL HTTPS). **Visualizar alterações** cria uma prévia temporária; **Baixar configuração do site** gera `site.config.js` para revisão e implantação manual. Nenhuma foto é enviada ao servidor e nenhuma alteração é publicada automaticamente. Não inserir fotos privadas ou não autorizadas.
