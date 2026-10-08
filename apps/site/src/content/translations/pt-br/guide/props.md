---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

| Prop                | Type                   | Default     | Description                                                                           |
| ------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | O identificador único do emoji; os ids conhecidos têm autocompletar                   |
| size                | number or string       | 100         | Pixels, ou qualquer comprimento CSS como `2rem` ou `var(--size)`                      |
| playOnHover         | boolean                | false       | Se a animação é reproduzida no hover e no foco do teclado                             |
| animationIterations | number or 'infinite'   | 2           | O número de vezes que a animação é reproduzida ao carregar                            |
| autoPlay            | boolean                | true        | Se a animação é reproduzida automaticamente na montagem                               |
| playing             | boolean                | -           | Controla a reprodução; `true` reproduz, `false` pausa, omitida mantém o padrão        |
| onPlaybackEnd       | function               | -           | Chamado uma vez quando uma execução finita de `animationIterations` termina           |
| skinTone            | SkinTone               | 'default'   | Tom de pele para emojis que têm variantes (veja abaixo)                               |
| alt                 | string                 | description | Texto acessível; por padrão é a descrição do emoji, `""` o marca como decorativo      |
| className           | string                 | -           | Nome de classe para o `<span>` raiz, mesclado com o do próprio componente             |
| style               | CSSProperties          | -           | Estilo inline para o `<span>` raiz; `width` e `height` seguem `size`                  |
| ref                 | `Ref<HTMLSpanElement>` | -           | Encaminhado ao `<span>` raiz; funciona no React 18 e 19                               |
| fallback            | ReactNode              | glyph       | Renderizado quando a imagem ou o manifest falha, ou o id é desconhecido; `null`: nada |
| onLoad              | function               | -           | Chamado quando o sprite sheet carrega                                                 |
| onError             | function               | -           | Chamado quando a imagem falha, e sem evento quando o manifest falha                   |

Qualquer outro atributo de `<span>` (`data-*`, `aria-*`, `title`, event
handlers) é repassado à raiz. Um `size` numérico é arredondado; qualquer coisa
que não seja um número finito e positivo volta para 100. Um `size` em string é
repassado ao CSS como está, então `size="2rem"` ou `size="var(--emoji-size)"`
funcionam. Uma string numérica como `"48"` é tratada como o número 48, e a
imagem recebe `sizes="auto"` para as demais strings; um `style` com `width` ou
`height` vence o `size`.

`skinTone` é um entre `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` ou `'dark'`. Ele só se aplica a emojis marcados como `diverse`;
para qualquer outro emoji, ou um valor desconhecido, usa-se o sprite sheet
padrão. `DiverseEmojiId` lista os ids que têm tons de pele, e `skinTone` é
tipado a partir dele quando `id` é um deles.
