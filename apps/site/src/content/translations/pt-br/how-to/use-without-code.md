---
title: Use os emojis sem código
sourceHash: 1a25330011d80c02
---

Coloque um emoji Fluent animado no Slack, no Notion, no Google Docs, em um
e-mail ou no README do GitHub. Você só precisa de um link ou de um arquivo. Sem
biblioteca, sem instalação.

Todo emoji, e todo tom de pele, é um arquivo simples no files site:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

Troque `<slug>` pelo nome do emoji. Por exemplo, este é o rosto sorridente com
olhos grandes:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

Cole um link assim no navegador e o emoji aparece. Clique com o botão direito
nele para salvar o arquivo.

## Encontre o nome (o slug)

O slug é a descrição do emoji em minúsculas, com hifens entre as palavras:
`grinning-face-with-big-eyes`, `waving-hand`.

Os emojis com tons de pele ganham um destes finais: `-light`, `-medium-light`,
`-medium`, `-medium-dark`, `-dark`. Assim, `waving-hand` é a mão amarela padrão
e `waving-hand-medium-dark` é o mesmo aceno em um tom médio-escuro.

Se dois emojis tivessem o mesmo nome, o segundo recebe `-2` (depois `-3`). Um
slug nunca muda depois de publicado, então os seus links continuam funcionando.

Para ver todos os nomes, abra o índice:

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## Escolha um formato

| Formato | Caminho             | Use para                                         |
| ------- | ------------------- | ------------------------------------------------ |
| GIF     | `/gif/<slug>.gif`   | Qualquer coisa que anime: Slack, e-mail, READMEs |
| WebP    | `/webp/<slug>.webp` | Animação com bordas suaves, em fundos escuros    |
| PNG     | `/png/<slug>.png`   | Uma imagem estática: Google Docs, Slides         |

## Slack

1. Baixe
   `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`.
2. No Slack, abra o seletor de emojis, escolha **Add Emoji** e depois **Upload
   Image**.
3. Escolha o arquivo, dê um nome (por exemplo `wave`) e salve.

Digite `:wave:` em qualquer mensagem para usá-lo.

## Notion

Cole o link da imagem em uma página e escolha **Embed as image**, ou digite
`/image`, escolha **Embed link** e cole o mesmo link.

## Google Docs e Slides

O Google Docs e o Slides mostram uma imagem estática, então use o PNG. Escolha
**Insert**, **Image**, **By URL** e cole:

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## E-mail

Insira o GIF como imagem, a partir do arquivo ou pelo link. A maioria dos apps
de e-mail o reproduz. Alguns, como certas versões desktop do Outlook, mostram só
o primeiro quadro.

## Um README do GitHub

Markdown:

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

HTML, se você quiser definir o tamanho:

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

Mantenha o texto `alt`. É o que um leitor de tela diz.

## Fundos escuros

A transparência de um GIF é tudo ou nada: cada pixel é totalmente transparente
ou totalmente sólido. Por isso, bordas suaves podem mostrar uma franja clara em
um fundo escuro. Nesse caso, use o WebP ou o PNG, que mantêm as bordas suaves.

## Créditos

A arte dos emojis é da Microsoft, e o seu uso está sujeito aos termos da
Microsoft. Este projeto não é afiliado nem endossado pela Microsoft. Alguns
emojis vêm do repositório da Microsoft com licença MIT; o aviso que se aplica a
eles está em `/LICENSE-fluentui-emoji-animated.txt`. A atribuição está em
`/NOTICE.txt`. Confira os termos que se aplicam à arte antes de usá-la no seu
próprio trabalho.

Está criando um site ou app? O [guia de uso](../usage.md) cobre a biblioteca.
