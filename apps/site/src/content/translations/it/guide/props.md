---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

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
