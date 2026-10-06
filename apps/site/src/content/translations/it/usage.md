---
title: Guida all'uso
sourceHash: 1c5618d6e3a40904
---

L'API completa di `animated-fluent-emojis`. Per l'installazione e il tuo primo
emoji, parti dal [README](../README.md).

- [Framework](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [HTML semplice](#plain-html)
  - [Angular, Solid e Preact](#angular-solid-and-preact)
  - [Senza framework](#without-a-framework)
- [Props](#props)
- [Hover e focus](#hover-and-focus)
- [Movimento ridotto](#reduced-motion)
- [Fallback](#fallback)
- [Riproduzione](#playback)
- [Immagini e sprite sheet HD](#images-and-hd-sprite-sheets)
- [Precaricamento](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Tipi](#types)

Le props qui sotto sono condivise da tutti gli adapter; ogni sezione dedicata a
un framework spiega come si scrive ciascuna prop in quel contesto. Il componente
recupera un piccolo manifest dall'asset site la prima volta che viene
renderizzato un emoji, mai al momento dell'import. Durante il caricamento
`Emoji` renderizza un segnaposto vuoto, con `aria-hidden`, alla dimensione
finale, così il layout non si sposta. Se l'id è sconosciuto, renderizza il tuo
nodo `fallback`, oppure niente. Se il manifest non può essere caricato,
renderizza il tuo nodo `fallback`, oppure niente, e riprova al successivo mount,
alla successiva chiamata a `preloadEmojis` o quando il browser torna online.

## Frameworks

Un solo pacchetto, un percorso di import per ogni framework. `configureEmojis` e
`preloadEmojis` non dipendono da alcun framework e restano in
`animated-fluent-emojis`; vedi [Precaricamento](#preloading) e
[Asset site](#asset-site). Tutti gli adapter condividono lo stesso core di
riproduzione e superano la stessa suite di conformità, quindi le props si
comportano ovunque allo stesso modo. Vedi l'
[ADR 0014](adr/0014-multi-framework-support.md).

Gli adapter React, Vue e Svelte e `createEmoji` leggono i propri keyframes da
`animated-fluent-emojis/style.css`; importalo una sola volta. `<fluent-emoji>` e
il componente Astro includono i propri stili.

### React

Importa `Emoji` dal sottopercorso React:

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

Se esegui la migrazione dalla 0.6 o da una versione precedente: l'export `Emoji`
dalla radice è stato deprecato nella 0.6 e rimosso nella 0.7. Cambia il percorso
di import, nient'altro; props e comportamento sono identici. Anche il tipo
`EmojiProps` è stato spostato in `animated-fluent-emojis/react`.
`configureEmojis` e `preloadEmojis` restano in `animated-fluent-emojis`. React
18 e 19 sono supportati, e `react` e `react-dom` sono peer opzionali.

### Vue

Vue 3.3 o successivo. `Emoji` riceve le props qui sotto in camelCase. Lo slot
`fallback` sostituisce l'immagine, e gli eventi sono `load`, `error` e
`playbackEnd`. Gli altri attributi come `class`, `style` e `data-*` vengono
passati allo span radice.

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

Lato server, e durante l'idratazione, renderizza un segnaposto vuoto alla
dimensione finale, quindi funziona con Nuxt.

### Svelte

Svelte 5. `Emoji` riceve le props qui sotto; `fallback` è uno snippet, e
`class`, `style` e `attributes` vengono passati allo span radice. I callback
sono `onLoad`, `onError` e `onPlaybackEnd`.

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

Renderizza un segnaposto lato server e l'emoji dopo l'idratazione, quindi
funziona con SvelteKit. L'export del pacchetto ha una condizione `svelte` che
punta al sorgente del componente.

### Astro

Astro 5 o successivo. Il componente renderizza il markup dell'emoji in fase di
build: lo sprite è quindi già nell'HTML prima che giri qualsiasi script, e un
piccolo script avvia la riproduzione nel browser. Include i propri stili; nessun
foglio di stile da importare. Lo slot con nome `fallback` viene renderizzato
quando l'id è sconosciuto o l'immagine non si carica.

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

Le props sono quelle qui sotto, senza i callback, con `class` e uno `style` di
tipo stringa. Lo span radice emette `emoji-load`, `emoji-error` e `playback-end`
come eventi DOM con bubbling, al posto dei callback. Lo script del browser viene
eseguito di nuovo anche su `astro:page-load`, così le view transition continuano
a funzionare.

<a id="plain-html"></a>

### HTML semplice

Importare `animated-fluent-emojis/element` registra `<fluent-emoji>`. Non serve
alcun foglio di stile: i keyframes vivono nel suo shadow root.

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

Gli attributi rispecchiano le props in kebab-case: `id`, `size`,
`play-on-hover`, `animation-iterations`, `auto-play`, `playing`, `skin-tone` e
`alt`. Un attributo booleano è attivo a meno che il suo valore sia `false`. Gli
stessi nomi esistono come proprietà camelCase dell'elemento
(`element.playOnHover = true`); assegnare una proprietà non riscrive
l'attributo. Un elemento con `slot="fallback"` è il fallback. L'elemento emette
`emoji-load`, `emoji-error` e `playback-end` come eventi con bubbling e
`composed`.

Finché l'elemento non è definito, non ha dimensioni. Aggiungi
`FLUENT_EMOJI_PRE_UPGRADE_CSS`, esportato dallo stesso entry point, al CSS della
tua pagina per riservare lo spazio a partire dall'attributo `size` (in pixel) ed
evitare uno spostamento del layout.

<a id="angular-solid-and-preact"></a>

### Angular, Solid e Preact

Usano `<fluent-emoji>` tramite la propria sintassi dei template; vedi le guide
pratiche per [Angular](how-to/use-with-angular.md),
[Solid](how-to/use-with-solid.md) e [Preact](how-to/use-with-preact.md). Lo
stesso vale per Lit, Alpine e htmx: importa `animated-fluent-emojis/element` e
scrivi il tag.

<a id="without-a-framework"></a>

### Senza framework

`createEmoji` esegue il rendering in qualsiasi nodo del DOM e restituisce un
controller. È il core senza framework di ogni adapter. Importarlo non tocca il
DOM.

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

Le sue opzioni sono le props qui sotto, con `className`, `style` e `attributes`
per lo span radice, i callback `onLoad`, `onError` e `onPlaybackEnd`, e un
`fallback` che è un nodo, una funzione che restituisce un nodo, oppure `null`.

## Props

| Prop                | Type                   | Default     | Description                                                                                     |
| ------------------- | ---------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | L'identificatore univoco dell'emoji; gli id noti hanno l'autocompletamento                      |
| size                | number or string       | 100         | Pixel, oppure qualsiasi lunghezza CSS come `2rem` o `var(--size)`                               |
| playOnHover         | boolean                | false       | Indica se l'animazione parte al passaggio del puntatore e al focus da tastiera                  |
| animationIterations | number or 'infinite'   | 2           | Quante volte l'animazione viene riprodotta al caricamento                                       |
| autoPlay            | boolean                | true        | Indica se l'animazione parte automaticamente al mount                                           |
| playing             | boolean                | -           | Controlla la riproduzione; `true` riproduce, `false` mette in pausa, se omessa resta il default |
| onPlaybackEnd       | function               | -           | Chiamato una volta quando termina un'esecuzione finita di `animationIterations`                 |
| skinTone            | SkinTone               | 'default'   | Tono della pelle per gli emoji che hanno varianti (vedi sotto)                                  |
| alt                 | string                 | description | Testo accessibile; per default la descrizione dell'emoji, `""` lo segna come decorativo         |
| className           | string                 | -           | Nome di classe del `<span>` radice, combinato con quello del componente                         |
| style               | CSSProperties          | -           | Stile inline del `<span>` radice; `width` e `height` seguono `size`                             |
| ref                 | `Ref<HTMLSpanElement>` | -           | Inoltrato al `<span>` radice; funziona con React 18 e 19                                        |
| fallback            | ReactNode              | glyph       | Renderizzato quando l'immagine o il manifest falliscono, o l'id è sconosciuto; `null`: niente   |
| onLoad              | function               | -           | Chiamato quando lo sprite sheet è caricato                                                      |
| onError             | function               | -           | Chiamato quando l'immagine fallisce, e senza evento quando fallisce il manifest                 |

Qualsiasi altro attributo di `<span>` (`data-*`, `aria-*`, `title`, gestori di
eventi) viene passato alla radice. Un `size` numerico viene arrotondato;
qualsiasi valore che non sia un numero finito e positivo ricade su 100. Un
`size` di tipo stringa viene passato così com'è al CSS, quindi `size="2rem"` o
`size="var(--emoji-size)"` funzionano. Una stringa numerica come `"48"` viene
trattata come il numero 48, e l'immagine riceve `sizes="auto"` per le altre
stringhe; uno `style` con `width` o `height` prevale su `size`.

`skinTone` vale `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` o `'dark'`. Si applica solo agli emoji contrassegnati come
`diverse`; per qualsiasi altro emoji, o un valore sconosciuto, viene usato lo
sheet di default. `DiverseEmojiId` elenca gli id che hanno toni della pelle, e
`skinTone` è tipizzato rispetto a esso quando `id` ne fa parte.

<a id="hover-and-focus"></a>

### Hover e focus

Con `playOnHover`, l'animazione viene riprodotta dopo l'esecuzione iniziale
quando il puntatore entra nell'emoji, e anche quando l'emoji si trova dentro un
`<button>` o un `<a>` che riceve il focus da tastiera (`:focus-visible`).

<a id="reduced-motion"></a>

### Movimento ridotto

Quando il sistema dell'utente chiede di ridurre il movimento
(`prefers-reduced-motion: reduce`), `autoPlay` viene ignorato e l'emoji resta
sul suo poster frame, il primo fotogramma dell'animazione. `playOnHover`
continua a riprodurre al passaggio del puntatore e al focus, perché è un'azione
esplicita dell'utente.

### Fallback

Se lo sprite sheet non si carica, `Emoji` mostra il fallback glyph: il carattere
Unicode nativo dell'emoji, etichettato con `alt`. Passa `fallback` per
renderizzare invece il tuo nodo, oppure `fallback={null}` per non renderizzare
nulla:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` viene eseguito quando l'immagine fallisce (con l'evento) e quando
fallisce il manifest (senza). Il fallback glyph ha bisogno del manifest; quando
è il manifest stesso a fallire, viene quindi renderizzato solo un nodo
`fallback` esplicito. Un id sconosciuto renderizza il nodo `fallback`, oppure
niente; non chiama `onError` e, in sviluppo, avvisa una sola volta per id. La
richiesta del manifest si interrompe dopo 15 secondi e viene ritentata come
qualsiasi altro fallimento.

<a id="playback"></a>

### Riproduzione

L'autoplay aspetta che lo sprite sheet sia caricato, che l'emoji sia sullo
schermo e che la scheda sia visibile; gli emoji fuori schermo o in background
non si animano quindi. Le schede nascoste mettono in pausa tutti gli emoji e li
riprendono quando la scheda torna in primo piano. Cambiare `id` riavvia
l'esecuzione iniziale del nuovo emoji. Un `animationIterations` pari a `0`, un
numero negativo o `NaN` disattiva l'autoplay; `Infinity` equivale a
`'infinite'`. Finché l'autoplay è trattenuto, l'emoji mostra il suo poster
frame.

Usa `playing` per controllare tu stesso la riproduzione. `true` riproduce
`animationIterations` esecuzioni, scavalcando `autoPlay` e il movimento ridotto
(aspettando comunque l'immagine, il viewport e una scheda visibile); `false`
mette in pausa sul fotogramma corrente. Un'esecuzione terminata non riparte
quando si commuta, quindi per rigiocarla va rimontato il componente con una
nuova `key`. `onPlaybackEnd` viene eseguito una volta quando un'esecuzione
finita termina; non viene mai eseguito con `'infinite'` né quando l'emoji viene
smontato durante un'esecuzione.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

<a id="images-and-hd-sprite-sheets"></a>

### Immagini e sprite sheet HD

Gli sprite sheet vengono caricati con `loading="lazy"` e `decoding="async"`. Gli
emoji che dispongono di uno sprite sheet HD (fotogrammi da 200px) ricevono
inoltre un `srcSet` basato sulla larghezza (`100w` e `200w`) con `sizes` pari
alla dimensione renderizzata (`auto` per un `size` di tipo stringa), così il
browser sceglie lo sheet `@2x` sugli schermi ad alta densità.

<a id="preloading"></a>

### Precaricamento

`preloadEmojis` inizia a recuperare il manifest prima che venga renderizzato
qualsiasi `Emoji` e, quando riceve degli id, richiede i loro sprite sheet una
volta che è pronto. Non rifiuta mai:

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` sceglie la variante da preriscaldare per gli emoji che hanno toni
della pelle.

### Asset site

Per default, il manifest e gli sprite sheet provengono da
`https://animated-fluent-emojis-cdn.andryore.dev`. Il vecchio indirizzo,
`https://animated-fluent-emojis.pages.dev`, continua a funzionare. Per servirli
dalla tua copia, chiama `configureEmojis` una volta, prima che venga
renderizzato il primo `Emoji`:

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` non dipende da React e condivide il manifest con
`Emoji`; aggiungerlo accanto ha quindi un costo minimo. Ogni funzione carica il
manifest e, quando non riesce, si risolve in `undefined` o in un array vuoto,
senza mai rifiutare:

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

- `findEmojiByUnicode(text)` risolve un emoji e assegna a `skinTone` un unico
  modificatore del tono della pelle; i toni misti si risolvono nell'emoji di
  base. Simboli come `©` o `™` hanno bisogno del selettore di variazione emoji
  (U+FE0F) per corrispondere, mentre le sequenze ZWJ corrispondono anche quando
  il selettore di variazione manca (minimally qualified).
- Quando più voci del catalog condividono un glifo, lookup restituisce l'emoji
  canonico: l'id prefissato dai code point del glifo; altrimenti, un override
  rivisto; altrimenti, la prima voce nell'ordine del catalog. Ad esempio, `❤️`
  si risolve in cuore e non in una variante che riutilizza il glifo. Con un tono
  della pelle, ripiega su una voce sorella che ha toni.
- `extractEmojis(text)` trova tutti gli emoji del catalog in un testo,
  mantenendo intere le sequenze ZWJ, con il loro offset e la loro lunghezza.
  Senza `Intl.Segmenter`, ripiega su un raggruppatore di code point, e nessuna
  delle due funzioni rifiuta mai.
- `searchEmojis(query, { limit })` cerca nelle descrizioni, senza distinguere
  maiuscole e minuscole; `limit` vale 20 per default; un `limit` che non è un
  numero positivo significa nessun limite, tranne `0`, che non restituisce
  nulla.

<a id="types"></a>

### Tipi

La radice esporta `configureEmojis`, `preloadEmojis` e `createEmoji`, oltre ai
tipi `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions`
e `EmojiFallback`. Il componente `Emoji` e `EmojiProps` sono stati rimossi dalla
radice nella 0.7.0; importali da `/react`. `/react`, `/vue` e `/svelte`
esportano ciascuno i propri `Emoji` e `EmojiProps`; `/astro` ha un export di
default e il tipo `EmojiAstroProps`; `/element` esporta il tipo
`FluentEmojiElement`. `EmojiId` è l'unione di tutti gli id pubblicati ed è
generato a partire dal catalog; la prop `id` è tipizzata
`EmojiId | (string & {})`, così gli id noti hanno l'autocompletamento e gli id
aggiunti al catalog dopo la tua versione installata continuano a compilare.
