---
title: Guia de uso
sourceHash: 1c5618d6e3a40904
---

A API completa do `animated-fluent-emojis`. Para a instalação e o seu primeiro
emoji, comece pelo [README](../README.md).

- [Frameworks](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [HTML puro](#plain-html)
  - [Angular, Solid e Preact](#angular-solid-and-preact)
  - [Sem framework](#without-a-framework)
- [Props](#props)
- [Hover e foco](#hover-and-focus)
- [Movimento reduzido](#reduced-motion)
- [Fallback](#fallback)
- [Reprodução](#playback)
- [Imagens e sprite sheets HD](#images-and-hd-sprite-sheets)
- [Pré-carregamento](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Tipos](#types)

As props abaixo são compartilhadas por todos os adaptadores; cada seção de
framework indica como cada prop é escrita ali. O componente busca um manifest
pequeno do asset site na primeira vez que um emoji é renderizado, nunca no
momento da importação. Enquanto ele carrega, `Emoji` renderiza um placeholder
vazio e `aria-hidden` com o tamanho final, para que o layout não se desloque. Se
o id for desconhecido, ele renderiza o seu nó `fallback`, ou nada. Se o manifest
não puder ser carregado, ele renderiza o seu nó `fallback`, ou nada, e tenta de
novo na próxima montagem, na próxima chamada a `preloadEmojis` ou quando o
navegador voltar a ficar online.

## Frameworks

Um pacote, um caminho de importação por framework. `configureEmojis` e
`preloadEmojis` não dependem de nenhum framework e permanecem em
`animated-fluent-emojis`; veja [Pré-carregamento](#preloading) e
[Asset site](#asset-site). Todos os adaptadores compartilham um mesmo núcleo de
reprodução e passam por uma mesma suíte de conformidade, então as props se
comportam do mesmo jeito em qualquer lugar. Veja o
[ADR 0014](adr/0014-multi-framework-support.md).

Os adaptadores de React, Vue e Svelte e o `createEmoji` leem seus keyframes de
`animated-fluent-emojis/style.css`; importe-o uma única vez. O `<fluent-emoji>`
e o componente do Astro trazem seus próprios estilos.

### React

Importe `Emoji` do subcaminho do React:

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

Migrando da versão 0.6 ou anterior: a exportação `Emoji` da raiz foi
descontinuada na 0.6 e removida na 0.7. Mude o caminho de importação, nada mais;
as props e o comportamento são idênticos. O tipo `EmojiProps` também foi movido
para `animated-fluent-emojis/react`. `configureEmojis` e `preloadEmojis`
permanecem em `animated-fluent-emojis`. O React 18 e o 19 são compatíveis, e
`react` e `react-dom` são peers opcionais.

### Vue

Vue 3.3 ou posterior. `Emoji` recebe as props abaixo em camelCase. O slot
`fallback` substitui a imagem, e os eventos são `load`, `error` e `playbackEnd`.
Outros atributos, como `class`, `style` e `data-*`, vão para o span raiz.

```vue
<script setup lang="ts">
import { Emoji } from 'animated-fluent-emojis/vue'

import 'animated-fluent-emojis/style.css'

const handlePlaybackEnd = () => {
  console.log('done')
}
</script>

<template>
  <Emoji
    id="1f44b_wavinghand"
    :size="64"
    play-on-hover
    @playback-end="handlePlaybackEnd"
  >
    <template #fallback><span>👋</span></template>
  </Emoji>
</template>
```

No servidor, e durante a hidratação, ele renderiza um placeholder vazio com o
tamanho final, então funciona no Nuxt.

### Svelte

Svelte 5. `Emoji` recebe as props abaixo; `fallback` é um snippet, e `class`,
`style` e `attributes` vão para o span raiz. Os callbacks são `onLoad`,
`onError` e `onPlaybackEnd`.

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

Ele renderiza um placeholder no servidor e o emoji após a hidratação, então
funciona no SvelteKit. A exportação do pacote tem uma condição `svelte` que
aponta para o código-fonte do componente.

### Astro

Astro 5 ou posterior. O componente renderiza a marcação do emoji em tempo de
build, então o sprite já está no HTML antes de qualquer script rodar, e um
pequeno script inicia a reprodução no navegador. Ele traz seus próprios estilos;
não há folha de estilo para importar. O slot nomeado `fallback` é renderizado
quando o id é desconhecido ou a imagem falha.

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

As props são as listadas abaixo, menos os callbacks, com `class` e um `style` em
string. O span raiz dispara `emoji-load`, `emoji-error` e `playback-end` como
eventos DOM com bubbling, em vez de callbacks. O script do navegador também roda
de novo em `astro:page-load`, então as view transitions continuam funcionando.

### HTML puro

Importar `animated-fluent-emojis/element` registra o `<fluent-emoji>`. Ele não
precisa de folha de estilo: os keyframes ficam no seu shadow root.

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

Os atributos espelham as props em kebab-case: `id`, `size`, `play-on-hover`,
`animation-iterations`, `auto-play`, `playing`, `skin-tone` e `alt`. Um atributo
booleano está ativado, a menos que seu valor seja `false`. Os mesmos nomes
existem como propriedades em camelCase no elemento
(`element.playOnHover = true`); definir uma propriedade não reescreve o
atributo. Um elemento com `slot="fallback"` é o fallback. O elemento dispara
`emoji-load`, `emoji-error` e `playback-end` como eventos com bubbling e
composed.

Até que o elemento seja definido, ele não tem tamanho. Adicione
`FLUENT_EMOJI_PRE_UPGRADE_CSS`, exportado da mesma entrada, ao CSS da sua página
para reservar o espaço a partir do atributo `size` (em pixels) e evitar um
deslocamento de layout.

### Angular, Solid e Preact

Eles usam o `<fluent-emoji>` por meio da sintaxe de template de cada um; veja os
guias práticos para [Angular](how-to/use-with-angular.md),
[Solid](how-to/use-with-solid.md) e [Preact](how-to/use-with-preact.md). O mesmo
vale para Lit, Alpine e htmx: importe `animated-fluent-emojis/element` e escreva
a tag.

### Sem framework

`createEmoji` renderiza em qualquer nó do DOM e devolve um controller. É o
núcleo, independente de framework, de todos os adaptadores. Importá-lo não toca
no DOM.

```js
import { createEmoji } from 'animated-fluent-emojis'

import 'animated-fluent-emojis/style.css'

const controller = createEmoji(document.querySelector('#slot'), {
  id: '1f44b_wavinghand',
  size: 64,
  fallback: () => document.createTextNode('👋'),
})

controller.update({ playing: false })
controller.destroy()
```

Suas opções são as props abaixo, com `className`, `style` e `attributes` para o
span raiz, os callbacks `onLoad`, `onError` e `onPlaybackEnd`, e um `fallback`
que é um nó, uma função que devolve um nó, ou `null`.

## Props

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

### Hover e foco

Com `playOnHover`, a animação é reproduzida após a execução inicial quando o
ponteiro entra no emoji, e também quando o emoji está dentro de um `<button>` ou
`<a>` que recebe o foco do teclado (`:focus-visible`).

### Movimento reduzido

Quando o sistema do usuário pede para reduzir o movimento
(`prefers-reduced-motion: reduce`), `autoPlay` é ignorado e o emoji fica em seu
poster frame, o primeiro quadro da animação. `playOnHover` ainda reproduz no
hover e no foco, porque isso é uma ação explícita do usuário.

### Fallback

Se o sprite sheet falhar ao carregar, `Emoji` mostra o fallback glyph: o
caractere Unicode nativo do emoji, rotulado com `alt`. Passe `fallback` para
renderizar o seu próprio nó, ou `fallback={null}` para não renderizar nada:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` é executado quando a imagem falha (com o evento) e quando o manifest
falha (sem ele). O fallback glyph depende do manifest, então, quando o próprio
manifest falhou, só um nó `fallback` explícito é renderizado. Um id desconhecido
renderiza o nó `fallback`, ou nada; ele não chama `onError` e, em
desenvolvimento, avisa uma vez por id. A requisição do manifest desiste após 15
segundos e é repetida como qualquer outra falha.

### Reprodução

O autoplay espera até que o sprite sheet tenha carregado, o emoji esteja na tela
e a aba esteja visível, então emojis fora da tela ou em segundo plano não
animam. Abas ocultas pausam todos os emojis e retomam quando a aba volta. Mudar
o `id` inicia de novo a execução inicial do novo emoji. `animationIterations`
igual a `0`, a um número negativo ou a `NaN` desativa o autoplay; `Infinity` é o
mesmo que `'infinite'`. Enquanto o autoplay está retido, o emoji mostra seu
poster frame.

Use `playing` para controlar a reprodução você mesmo. `true` reproduz
`animationIterations` execuções, sobrepondo-se a `autoPlay` e ao movimento
reduzido (ainda esperando pela imagem, pela viewport e por uma aba visível);
`false` pausa no quadro atual. Uma execução concluída não é reiniciada ao
alternar, então remonte com um novo `key` para reproduzir de novo.
`onPlaybackEnd` é executado uma vez quando uma execução finita termina; ele
nunca é executado para `'infinite'` ou quando o emoji é desmontado no meio de
uma execução.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

### Imagens e sprite sheets HD

Os sprite sheets são carregados com `loading="lazy"` e `decoding="async"`. Os
emojis que têm um sprite sheet HD (quadros de 200px) também recebem um `srcSet`
baseado em largura (`100w` e `200w`), com `sizes` definido como o tamanho
renderizado (`auto` para um `size` em string), para que o navegador escolha o
sheet `@2x` em telas de alta densidade.

### Pré-carregamento

`preloadEmojis` começa a buscar o manifest antes que qualquer `Emoji` seja
renderizado e, quando recebe ids, solicita seus sprite sheets assim que ele
estiver pronto. Ele nunca rejeita:

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` escolhe a variante a aquecer para os emojis que têm tons de pele.

### Asset site

Por padrão, o manifest e os sprite sheets vêm de
`https://animated-fluent-emojis-cdn.andryore.dev`. O endereço anterior,
`https://animated-fluent-emojis.pages.dev`, continua funcionando. Para servi-los
a partir da sua própria cópia, chame `configureEmojis` uma vez, antes de o
primeiro `Emoji` ser renderizado:

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` não depende do React e compartilha o manifest
com `Emoji`, então é barato adicioná-lo ao lado dele. Cada função carrega o
manifest e resolve para `undefined` ou um array vazio, sem nunca rejeitar,
quando não consegue:

```js
import {
  extractEmojis,
  findEmojiByUnicode,
  searchEmojis,
} from 'animated-fluent-emojis/lookup'

await findEmojiByUnicode('👍🏽') // { id: 'yes', skinTone: 'medium' }
await extractEmojis('Hi 👋 there') // [{ id, text, index, length }]
await searchEmojis('party', { limit: 5 }) // [{ id }]
```

- `findEmojiByUnicode(text)` resolve um emoji e mapeia um único modificador de
  tom de pele para `skinTone`; tons mistos resolvem para o emoji base. Símbolos
  como `©` ou `™` precisam do seletor de variação de emoji (U+FE0F) para
  corresponder, enquanto as sequências ZWJ correspondem mesmo quando o seletor
  de variação está ausente (minimamente qualificadas).
- Quando várias entradas do catálogo compartilham um glifo, o lookup devolve o
  emoji canônico: o id prefixado com os code points do glifo, senão uma
  substituição revisada, senão a primeira entrada na ordem do catálogo. Por
  exemplo, `❤️` resolve para o coração, e não para uma variante que reutiliza o
  glifo. Com um tom de pele, ele recorre a uma entrada irmã que tenha tons.
- `extractEmojis(text)` encontra todos os emojis do catálogo em um texto,
  mantendo as sequências ZWJ inteiras, com seu deslocamento e comprimento. Sem
  `Intl.Segmenter`, ele recorre a um agrupador de code points, e nenhuma das
  duas funções jamais rejeita.
- `searchEmojis(query, { limit })` compara com as descrições, ignorando
  maiúsculas e minúsculas; `limit` tem padrão 20; um `limit` que não seja um
  número positivo significa sem limite, exceto `0`, que não devolve nada.

### Tipos

A raiz exporta `configureEmojis`, `preloadEmojis` e `createEmoji`, e os tipos
`SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions` e
`EmojiFallback`. O componente `Emoji` e `EmojiProps` foram removidos da raiz na
0.7.0; importe-os de `/react`. `/react`, `/vue` e `/svelte` exportam cada um o
seu próprio `Emoji` e `EmojiProps`; `/astro` tem uma exportação padrão e o tipo
`EmojiAstroProps`; `/element` exporta o tipo `FluentEmojiElement`. `EmojiId` é a
união de todos os ids publicados e é gerado a partir do catálogo; a prop `id` é
tipada como `EmojiId | (string & {})`, então os ids conhecidos têm autocompletar
e os ids adicionados ao catálogo depois da sua versão instalada continuam
compilando.
