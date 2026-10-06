---
title: Guía de uso
sourceHash: 1c5618d6e3a40904
---

La API completa de `animated-fluent-emojis`. Para la instalación y tu primer
emoji, empieza por el [README](../README.md).

- [Frameworks](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [HTML simple](#plain-html)
  - [Angular, Solid y Preact](#angular-solid-and-preact)
  - [Sin un framework](#without-a-framework)
- [Props](#props)
- [Hover y foco](#hover-and-focus)
- [Movimiento reducido](#reduced-motion)
- [Fallback](#fallback)
- [Reproducción](#playback)
- [Imágenes y sprite sheets HD](#images-and-hd-sprite-sheets)
- [Precarga](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Tipos](#types)

Las props de abajo son compartidas por todos los adaptadores; cada sección de
framework indica cómo se escribe cada prop allí. El componente obtiene un
manifest pequeño del asset site la primera vez que se renderiza un emoji, nunca
al momento de importar. Mientras carga, `Emoji` renderiza un marcador vacío y
`aria-hidden` con el tamaño final, de modo que el diseño no se desplaza. Si el
id es desconocido, renderiza tu nodo `fallback`, o nada. Si no se puede cargar
el manifest, renderiza tu nodo `fallback`, o nada, y reintenta en el siguiente
montaje, en la siguiente llamada a `preloadEmojis` o cuando el navegador vuelva
a estar en línea.

## Frameworks

Un paquete, una ruta de importación por framework. `configureEmojis` y
`preloadEmojis` no dependen de ningún framework y permanecen en
`animated-fluent-emojis`; consulta [Precarga](#preloading) y
[Asset site](#asset-site). Todos los adaptadores comparten un mismo núcleo de
reproducción y pasan una misma suite de conformidad, por lo que las props se
comportan igual en todas partes. Consulta el
[ADR 0014](adr/0014-multi-framework-support.md).

Los adaptadores de React, Vue y Svelte y `createEmoji` leen sus keyframes de
`animated-fluent-emojis/style.css`; impórtalo una sola vez. `<fluent-emoji>` y
el componente de Astro incluyen sus propios estilos.

### React

Importa `Emoji` desde la subruta de React:

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

Si migras desde la 0.6 o anterior: la exportación `Emoji` de la raíz quedó
obsoleta en la 0.6 y se eliminó en la 0.7. Cambia la ruta de importación y nada
más; las props y el comportamiento son idénticos. El tipo `EmojiProps` también
se movió a `animated-fluent-emojis/react`. `configureEmojis` y `preloadEmojis`
permanecen en `animated-fluent-emojis`. Se admiten React 18 y 19, y `react` y
`react-dom` son peers opcionales.

### Vue

Vue 3.3 o posterior. `Emoji` recibe las props de abajo en camelCase. El slot
`fallback` reemplaza la imagen, y los eventos son `load`, `error` y
`playbackEnd`. Otros atributos como `class`, `style` y `data-*` se pasan al span
raíz.

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

En el servidor, y durante la hidratación, renderiza un marcador vacío con el
tamaño final, por lo que funciona en Nuxt.

### Svelte

Svelte 5. `Emoji` recibe las props de abajo; `fallback` es un snippet, y
`class`, `style` y `attributes` se pasan al span raíz. Los callbacks son
`onLoad`, `onError` y `onPlaybackEnd`.

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

Renderiza un marcador en el servidor y el emoji después de la hidratación, por
lo que funciona en SvelteKit. La exportación del paquete tiene una condición
`svelte` que apunta al código fuente del componente.

### Astro

Astro 5 o posterior. El componente renderiza el marcado del emoji en tiempo de
compilación, por lo que el sprite ya está en el HTML antes de que se ejecute
cualquier script, y un pequeño script inicia la reproducción en el navegador.
Trae sus propios estilos; no hay ninguna hoja de estilos que importar. El slot
con nombre `fallback` se renderiza cuando el id es desconocido o la imagen
falla.

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

Las props son las de abajo, sin los callbacks, con `class` y un `style` de tipo
string. El span raíz despacha `emoji-load`, `emoji-error` y `playback-end` como
eventos DOM con burbujeo, en lugar de callbacks. El script del navegador también
se ejecuta de nuevo en `astro:page-load`, por lo que las transiciones de vista
siguen funcionando.

<a id="plain-html"></a>

### HTML simple

Importar `animated-fluent-emojis/element` registra `<fluent-emoji>`. No necesita
hoja de estilos: los keyframes viven en su shadow root.

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

Los atributos reflejan las props en kebab-case: `id`, `size`, `play-on-hover`,
`animation-iterations`, `auto-play`, `playing`, `skin-tone` y `alt`. Un atributo
booleano está activo a menos que su valor sea `false`. Los mismos nombres
existen como propiedades en camelCase del elemento
(`element.playOnHover = true`); asignar una propiedad no reescribe el atributo.
Un elemento con `slot="fallback"` es el fallback. El elemento despacha
`emoji-load`, `emoji-error` y `playback-end` como eventos con burbujeo y
`composed`.

Hasta que el elemento está definido no tiene tamaño. Agrega
`FLUENT_EMOJI_PRE_UPGRADE_CSS`, exportado desde la misma entrada, al CSS de tu
página para reservar el espacio a partir del atributo `size` (en píxeles) y
evitar un desplazamiento del diseño.

<a id="angular-solid-and-preact"></a>

### Angular, Solid y Preact

Estos usan `<fluent-emoji>` mediante su propia sintaxis de plantillas; consulta
las guías prácticas de [Angular](how-to/use-with-angular.md),
[Solid](how-to/use-with-solid.md) y [Preact](how-to/use-with-preact.md). Lo
mismo aplica a Lit, Alpine y htmx: importa `animated-fluent-emojis/element` y
escribe la etiqueta.

<a id="without-a-framework"></a>

### Sin un framework

`createEmoji` renderiza en cualquier nodo del DOM y devuelve un controlador. Es
el núcleo sin framework de cada adaptador. Importarlo no toca el DOM.

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

Sus opciones son las props de abajo, con `className`, `style` y `attributes`
para el span raíz, los callbacks `onLoad`, `onError` y `onPlaybackEnd`, y un
`fallback` que es un nodo, una función que devuelve un nodo, o `null`.

## Props

| Prop                | Type                   | Default     | Description                                                                                      |
| ------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| id                  | `EmojiId` or string    | -           | El identificador único del emoji; los ids conocidos se autocompletan                             |
| size                | number or string       | 100         | Píxeles, o cualquier longitud CSS como `2rem` o `var(--size)`                                    |
| playOnHover         | boolean                | false       | Si se reproduce la animación al pasar el cursor y con el foco del teclado                        |
| animationIterations | number or 'infinite'   | 2           | El número de veces que se reproduce la animación al cargar                                       |
| autoPlay            | boolean                | true        | Si se reproduce la animación automáticamente al montar                                           |
| playing             | boolean                | -           | Controla la reproducción; `true` reproduce, `false` pausa, omitida mantiene el valor por defecto |
| onPlaybackEnd       | function               | -           | Se llama una vez cuando termina una ejecución finita de `animationIterations`                    |
| skinTone            | SkinTone               | 'default'   | Tono de piel para los emojis que tienen variantes (ver abajo)                                    |
| alt                 | string                 | description | Texto accesible; por defecto es la descripción del emoji, `""` lo marca como decorativo          |
| className           | string                 | -           | Nombre de clase para el `<span>` raíz, combinado con el propio del componente                    |
| style               | CSSProperties          | -           | Estilo en línea para el `<span>` raíz; `width` y `height` siguen a `size`                        |
| ref                 | `Ref<HTMLSpanElement>` | -           | Se reenvía al `<span>` raíz; funciona en React 18 y 19                                           |
| fallback            | ReactNode              | glyph       | Se renderiza cuando falla la imagen o el manifest, o el id es desconocido; `null`: nada          |
| onLoad              | function               | -           | Se llama cuando carga el sprite sheet                                                            |
| onError             | function               | -           | Se llama cuando falla la imagen, y sin evento cuando falla el manifest                           |

Cualquier otro atributo de `<span>` (`data-*`, `aria-*`, `title`, manejadores de
eventos) se pasa a la raíz. Un `size` numérico se redondea; cualquier valor que
no sea un número finito y positivo vuelve a 100. Un `size` de tipo string se
pasa a CSS tal cual, por lo que `size="2rem"` o `size="var(--emoji-size)"`
funcionan. Un string numérico como `"48"` se trata como el número 48, y la
imagen recibe `sizes="auto"` para los demás strings; un `style` con `width` o
`height` prevalece sobre `size`.

`skinTone` es uno de `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` o `'dark'`. Solo se aplica a los emojis marcados como `diverse`;
para cualquier otro emoji, o un valor desconocido, se usa el sheet por defecto.
`DiverseEmojiId` lista los ids que tienen tonos de piel, y `skinTone` se tipa
contra él cuando `id` es uno de ellos.

<a id="hover-and-focus"></a>

### Hover y foco

Con `playOnHover`, la animación se reproduce después de la ejecución inicial
cuando el puntero entra en el emoji, y también cuando el emoji está dentro de un
`<button>` o un `<a>` que recibe el foco del teclado (`:focus-visible`).

<a id="reduced-motion"></a>

### Movimiento reducido

Cuando el sistema del usuario pide reducir el movimiento
(`prefers-reduced-motion: reduce`), `autoPlay` se ignora y el emoji descansa en
su poster frame, el primer cuadro de la animación. `playOnHover` sigue
reproduciendo al pasar el cursor y con el foco, porque es una acción explícita
del usuario.

### Fallback

Si el sprite sheet no carga, `Emoji` muestra el fallback glyph: el carácter
Unicode nativo del emoji, etiquetado con `alt`. Pasa `fallback` para renderizar
tu propio nodo en su lugar, o `fallback={null}` para no renderizar nada:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` se ejecuta cuando falla la imagen (con el evento) y cuando falla el
manifest (sin él). El fallback glyph necesita el manifest, así que cuando el
propio manifest falló solo se renderiza un nodo `fallback` explícito. Un id
desconocido renderiza el nodo `fallback`, o nada; no llama a `onError` y, en
desarrollo, avisa una vez por id. La solicitud del manifest se rinde tras 15
segundos y se reintenta como cualquier otro fallo.

<a id="playback"></a>

### Reproducción

El autoplay espera hasta que el sprite sheet haya cargado, el emoji esté en
pantalla y la pestaña esté visible, por lo que los emojis fuera de pantalla o en
segundo plano no se animan. Las pestañas ocultas pausan todos los emojis y los
reanudan cuando la pestaña vuelve. Cambiar `id` inicia de nuevo la ejecución
inicial del nuevo emoji. Un `animationIterations` de `0`, un número negativo o
`NaN` desactiva el autoplay; `Infinity` equivale a `'infinite'`. Mientras el
autoplay está retenido, el emoji muestra su poster frame.

Usa `playing` para controlar la reproducción tú mismo. `true` reproduce
`animationIterations` ejecuciones, anulando `autoPlay` y el movimiento reducido
(esperando aún la imagen, el viewport y una pestaña visible); `false` pausa en
el cuadro actual. Una ejecución terminada no se reinicia al alternar, así que
vuelve a montar con una nueva `key` para repetirla. `onPlaybackEnd` se ejecuta
una vez cuando termina una ejecución finita; nunca se ejecuta con `'infinite'`
ni cuando el emoji se desmonta a mitad de una ejecución.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

<a id="images-and-hd-sprite-sheets"></a>

### Imágenes y sprite sheets HD

Los sprite sheets se cargan con `loading="lazy"` y `decoding="async"`. Los
emojis que tienen un sprite sheet HD (cuadros de 200px) reciben además un
`srcSet` basado en ancho (`100w` y `200w`) con `sizes` igual al tamaño
renderizado (`auto` para un `size` de tipo string), de modo que el navegador
elige el sheet `@2x` en pantallas de alta densidad.

<a id="preloading"></a>

### Precarga

`preloadEmojis` empieza a obtener el manifest antes de que se renderice
cualquier `Emoji` y, cuando recibe ids, solicita sus sprite sheets una vez que
está listo. Nunca rechaza:

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` elige la variante que se precalienta para los emojis que tienen tonos
de piel.

### Asset site

Por defecto, el manifest y los sprite sheets provienen de
`https://animated-fluent-emojis-cdn.andryore.dev`. La dirección anterior,
`https://animated-fluent-emojis.pages.dev`, sigue funcionando. Para servirlos
desde tu propia copia, llama a `configureEmojis` una vez, antes de que se
renderice el primer `Emoji`:

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` no depende de React y comparte el manifest con
`Emoji`, por lo que es barato agregarlo junto a él. Cada función carga el
manifest y, cuando no puede, resuelve a `undefined` o a un arreglo vacío, sin
rechazar nunca:

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

- `findEmojiByUnicode(text)` resuelve un emoji y asigna un único modificador de
  tono de piel a `skinTone`; los tonos mezclados resuelven al emoji base. Los
  símbolos como `©` o `™` necesitan el selector de variación de emoji (U+FE0F)
  para coincidir, mientras que las secuencias ZWJ coinciden incluso cuando falta
  el selector de variación (minimally qualified).
- Cuando varias entradas del catalog comparten un glifo, lookup devuelve el
  emoji canónico: el id con prefijo de los code points del glifo; si no, una
  sobrescritura revisada; si no, la primera entrada en el orden del catalog. Por
  ejemplo, `❤️` resuelve al corazón y no a una variante que reutiliza el glifo.
  Con un tono de piel, recurre a una entrada hermana que tenga tonos.
- `extractEmojis(text)` encuentra todos los emojis del catalog en un texto,
  manteniendo completas las secuencias ZWJ, con su desplazamiento y longitud.
  Sin `Intl.Segmenter` recurre a un agrupador de code points, y ninguna de las
  dos funciones rechaza nunca.
- `searchEmojis(query, { limit })` busca en las descripciones, sin distinguir
  mayúsculas de minúsculas; `limit` es 20 por defecto; un `limit` que no sea un
  número positivo significa sin límite, excepto `0`, que no devuelve nada.

<a id="types"></a>

### Tipos

La raíz exporta `configureEmojis`, `preloadEmojis` y `createEmoji`, y los tipos
`SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions` y
`EmojiFallback`. El componente `Emoji` y `EmojiProps` se eliminaron de la raíz
en la 0.7.0; impórtalos desde `/react`. `/react`, `/vue` y `/svelte` exportan
cada uno su propio `Emoji` y `EmojiProps`; `/astro` tiene una exportación por
defecto y el tipo `EmojiAstroProps`; `/element` exporta el tipo
`FluentEmojiElement`. `EmojiId` es la unión de todos los ids publicados y se
genera a partir del catalog; la prop `id` se tipa como
`EmojiId | (string & {})`, por lo que los ids conocidos se autocompletan y los
ids agregados al catalog después de tu versión instalada siguen compilando.
