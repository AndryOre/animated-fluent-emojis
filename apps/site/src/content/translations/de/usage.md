---
title: Nutzungsleitfaden
sourceHash: 1c5618d6e3a40904
---

Die vollständige API von `animated-fluent-emojis`. Für die Installation und dein
erstes Emoji beginne mit dem [README](../README.md).

- [Frameworks](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [Reines HTML](#plain-html)
  - [Angular, Solid und Preact](#angular-solid-and-preact)
  - [Ohne Framework](#without-a-framework)
- [Props](#props)
- [Hover und Fokus](#hover-and-focus)
- [Reduzierte Bewegung](#reduced-motion)
- [Fallback](#fallback)
- [Wiedergabe](#playback)
- [Bilder und HD-Sprite-Sheets](#images-and-hd-sprite-sheets)
- [Vorladen](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Typen](#types)

Die folgenden Props gelten für alle Adapter; jeder Framework-Abschnitt erklärt,
wie eine Prop dort geschrieben wird. Die Komponente lädt ein kleines Manifest
von der Asset site, sobald zum ersten Mal ein Emoji gerendert wird, niemals beim
Import. Während des Ladens rendert `Emoji` einen leeren, `aria-hidden`
Platzhalter in der endgültigen Größe, damit sich das Layout nicht verschiebt.
Ist die ID unbekannt, rendert sie deinen `fallback`-Knoten oder nichts. Kann das
Manifest nicht geladen werden, rendert sie deinen `fallback`-Knoten oder nichts
und versucht es beim nächsten Mount, beim nächsten Aufruf von `preloadEmojis`
oder erneut, sobald der Browser wieder online ist.

## Frameworks

Ein Paket, ein Importpfad pro Framework. `configureEmojis` und `preloadEmojis`
sind frameworkunabhängig und bleiben unter `animated-fluent-emojis`; siehe
[Vorladen](#preloading) und [Asset site](#asset-site). Alle Adapter teilen sich
einen gemeinsamen Wiedergabekern und bestehen dieselbe Konformitätssuite, sodass
sich die Props überall gleich verhalten. Siehe
[ADR 0014](adr/0014-multi-framework-support.md).

Die Adapter für React, Vue und Svelte sowie `createEmoji` lesen ihre Keyframes
aus `animated-fluent-emojis/style.css`; importiere sie einmal. `<fluent-emoji>`
und die Astro-Komponente bringen ihre eigenen Styles mit.

### React

Importiere `Emoji` aus dem React-Subpfad:

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

Migration von 0.6 oder früher: Der Root-Export `Emoji` wurde in 0.6 als veraltet
markiert und in 0.7 entfernt. Ändere den Importpfad, sonst nichts; Props und
Verhalten sind identisch. Der Typ `EmojiProps` ist ebenfalls nach
`animated-fluent-emojis/react` umgezogen. `configureEmojis` und `preloadEmojis`
bleiben unter `animated-fluent-emojis`. React 18 und 19 werden unterstützt, und
`react` und `react-dom` sind optionale Peers.

### Vue

Vue 3.3 oder neuer. `Emoji` akzeptiert die folgenden Props in camelCase. Der
`fallback`-Slot ersetzt das Bild, und die Events sind `load`, `error` und
`playbackEnd`. Weitere Attribute wie `class`, `style` und `data-*` gehen an das
Root-Span.

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

Auf dem Server und während der Hydration rendert es einen leeren Platzhalter in
der endgültigen Größe und funktioniert daher in Nuxt.

### Svelte

Svelte 5. `Emoji` akzeptiert die folgenden Props; `fallback` ist ein Snippet,
und `class`, `style` und `attributes` gehen an das Root-Span. Die Callbacks sind
`onLoad`, `onError` und `onPlaybackEnd`.

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

Es rendert auf dem Server einen Platzhalter und nach der Hydration das Emoji,
sodass es in SvelteKit funktioniert. Der Paket-Export hat eine
`svelte`-Condition, die auf den Komponenten-Quellcode zeigt.

### Astro

Astro 5 oder neuer. Die Komponente rendert das Emoji-Markup zur Build-Zeit,
sodass das Sprite bereits im HTML steckt, bevor ein Skript läuft, und ein
kleines Skript startet die Wiedergabe im Browser. Sie bringt ihre eigenen Styles
mit; es gibt kein Stylesheet zu importieren. Der benannte Slot `fallback` wird
gerendert, wenn die ID unbekannt ist oder das Bild fehlschlägt.

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

Die Props sind die unten genannten, ohne die Callbacks, mit `class` und einem
`style` als String. Das Root-Span sendet `emoji-load`, `emoji-error` und
`playback-end` als aufsteigende (bubbling) DOM-Events statt als Callbacks. Das
Browser-Skript läuft außerdem bei `astro:page-load` erneut, sodass View
Transitions weiter funktionieren.

<a id="plain-html"></a>

### Reines HTML

Der Import von `animated-fluent-emojis/element` registriert `<fluent-emoji>`. Es
braucht kein Stylesheet: Die Keyframes liegen in seinem Shadow Root.

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

Die Attribute spiegeln die Props in kebab-case: `id`, `size`, `play-on-hover`,
`animation-iterations`, `auto-play`, `playing`, `skin-tone` und `alt`. Ein
boolesches Attribut ist aktiv, es sei denn, sein Wert ist `false`. Dieselben
Namen existieren als camelCase-Properties am Element
(`element.playOnHover = true`); das Setzen einer Property schreibt das Attribut
nicht um. Ein Element mit `slot="fallback"` ist der Fallback. Das Element sendet
`emoji-load`, `emoji-error` und `playback-end` als aufsteigende, composed
Events.

Bis das Element definiert ist, hat es keine Größe. Füge
`FLUENT_EMOJI_PRE_UPGRADE_CSS`, exportiert aus demselben Entry, zum CSS deiner
Seite hinzu, um anhand des Attributs `size` (in Pixeln) den Platz zu reservieren
und einen Layout-Shift zu vermeiden.

<a id="angular-solid-and-preact"></a>

### Angular, Solid und Preact

Diese verwenden `<fluent-emoji>` über ihre eigene Template-Syntax; siehe die
How-to-Anleitungen für [Angular](how-to/use-with-angular.md),
[Solid](how-to/use-with-solid.md) und [Preact](how-to/use-with-preact.md). Das
Gleiche gilt für Lit, Alpine und htmx: Importiere
`animated-fluent-emojis/element` und schreibe das Tag.

<a id="without-a-framework"></a>

### Ohne Framework

`createEmoji` rendert in jeden DOM-Knoten und gibt einen Controller zurück. Es
ist der frameworkunabhängige Kern aller Adapter. Sein Import greift nicht auf
das DOM zu.

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

Seine Optionen sind die unten genannten Props, mit `className`, `style` und
`attributes` für das Root-Span, den Callbacks `onLoad`, `onError` und
`onPlaybackEnd` sowie einem `fallback`, der ein Knoten, eine Funktion, die einen
Knoten zurückgibt, oder `null` sein kann.

## Props

| Prop                | Type                   | Default     | Description                                                                      |
| ------------------- | ---------------------- | ----------- | -------------------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | The unique identifier of the emoji; known ids autocomplete                       |
| size                | number or string       | 100         | Pixels, or any CSS length such as `2rem` or `var(--size)`                        |
| playOnHover         | boolean                | false       | Whether to play the animation on hover and on keyboard focus                     |
| animationIterations | number or 'infinite'   | 2           | The number of times to play the animation on load                                |
| autoPlay            | boolean                | true        | Whether to automatically play the animation on mount                             |
| playing             | boolean                | -           | Controls playback; `true` plays, `false` pauses, omitted keeps the default       |
| onPlaybackEnd       | function               | -           | Called once when a finite run of `animationIterations` ends                      |
| skinTone            | SkinTone               | 'default'   | Skin tone for emojis that have variants (see below)                              |
| alt                 | string                 | description | Accessible text; defaults to the emoji description, `""` marks it as decorative  |
| className           | string                 | -           | Class name for the root `<span>`, merged with the component's own                |
| style               | CSSProperties          | -           | Inline style for the root `<span>`; `width` and `height` follow `size`           |
| ref                 | `Ref<HTMLSpanElement>` | -           | Forwarded to the root `<span>`; works on React 18 and 19                         |
| fallback            | ReactNode              | glyph       | Rendered when the image or manifest fails, or the id is unknown; `null`: nothing |
| onLoad              | function               | -           | Called when the sprite sheet loads                                               |
| onError             | function               | -           | Called when the image fails, and with no event when the manifest fails           |

Jedes andere `<span>`-Attribut (`data-*`, `aria-*`, `title`, Event-Handler) wird
an das Root weitergereicht. Eine numerische `size` wird gerundet; alles außer
einer endlichen positiven Zahl fällt auf 100 zurück. Eine `size` als String wird
unverändert an CSS übergeben, sodass `size="2rem"` oder
`size="var(--emoji-size)"` funktionieren. Ein numerischer String wie `"48"` wird
als die Zahl 48 behandelt, und das Bild erhält für andere Strings
`sizes="auto"`; ein `style` mit `width` oder `height` hat Vorrang vor `size`.

`skinTone` ist eines von `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` oder `'dark'`. Es gilt nur für Emojis, die als `diverse`
markiert sind; für jedes andere Emoji oder bei einem unbekannten Wert wird das
Standard-Sheet verwendet. `DiverseEmojiId` listet die IDs auf, die Hauttöne
haben, und `skinTone` wird dagegen typisiert, wenn `id` eine davon ist.

<a id="hover-and-focus"></a>

### Hover und Fokus

Mit `playOnHover` wird die Animation nach dem ersten Durchlauf abgespielt, wenn
der Zeiger das Emoji betritt, und auch, wenn das Emoji in einem `<button>` oder
`<a>` liegt, das den Tastaturfokus erhält (`:focus-visible`).

<a id="reduced-motion"></a>

### Reduzierte Bewegung

Wenn das System des Nutzers darum bittet, Bewegung zu reduzieren
(`prefers-reduced-motion: reduce`), wird `autoPlay` ignoriert und das Emoji ruht
auf seinem Poster-Frame, dem ersten Bild der Animation. `playOnHover` spielt bei
Hover und Fokus weiterhin ab, da dies eine ausdrückliche Handlung des Nutzers
ist.

### Fallback

Schlägt das Laden des Sprite Sheets fehl, zeigt `Emoji` das Fallback-Glyph: das
native Unicode-Zeichen des Emojis, beschriftet mit `alt`. Übergib `fallback`, um
stattdessen einen eigenen Knoten zu rendern, oder `fallback={null}`, um nichts
zu rendern:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` wird ausgeführt, wenn das Bild fehlschlägt (mit dem Event) und wenn
das Manifest fehlschlägt (ohne eines). Das Fallback-Glyph benötigt das Manifest;
ist das Manifest selbst fehlgeschlagen, wird daher nur ein ausdrücklicher
`fallback`-Knoten gerendert. Eine unbekannte ID rendert den `fallback`-Knoten
oder nichts; sie ruft `onError` nicht auf und warnt in der Entwicklung einmal
pro ID. Die Manifest-Anfrage gibt nach 15 Sekunden auf und wird wie jeder andere
Fehler erneut versucht.

<a id="playback"></a>

### Wiedergabe

Autoplay wartet, bis das Sprite Sheet geladen ist, das Emoji im sichtbaren
Bereich liegt und der Tab sichtbar ist, sodass Emojis außerhalb des Bildschirms
oder im Hintergrund nicht animiert werden. Versteckte Tabs pausieren jedes Emoji
und setzen es fort, wenn der Tab zurückkehrt. Eine Änderung von `id` startet den
ersten Durchlauf des neuen Emojis erneut. Ein `animationIterations` von `0`,
eine negative Zahl oder `NaN` deaktiviert Autoplay; `Infinity` entspricht
`'infinite'`. Solange Autoplay gehalten wird, zeigt das Emoji seinen
Poster-Frame.

Verwende `playing`, um die Wiedergabe selbst zu steuern. `true` spielt
`animationIterations` Durchläufe ab und überschreibt `autoPlay` und reduzierte
Bewegung (wartet aber weiterhin auf das Bild, den sichtbaren Bereich und einen
sichtbaren Tab); `false` pausiert auf dem aktuellen Bild. Ein beendeter
Durchlauf wird durch Umschalten nicht neu gestartet, mounte daher mit einem
neuen `key` neu, um ihn erneut abzuspielen. `onPlaybackEnd` wird einmal
ausgeführt, wenn ein endlicher Durchlauf endet; es läuft nie bei `'infinite'`
oder wenn das Emoji mitten im Durchlauf unmountet wird.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

<a id="images-and-hd-sprite-sheets"></a>

### Bilder und HD-Sprite-Sheets

Sprite Sheets werden mit `loading="lazy"` und `decoding="async"` geladen. Emojis
mit einem HD-Sprite-Sheet (Frames mit 200px) erhalten zusätzlich ein
breitenbasiertes `srcSet` (`100w` und `200w`), wobei `sizes` der gerenderten
Größe entspricht (`auto` bei einer `size` als String), sodass der Browser auf
Displays mit hoher Pixeldichte das `@2x`-Sheet wählt.

<a id="preloading"></a>

### Vorladen

`preloadEmojis` beginnt das Manifest zu laden, bevor ein `Emoji` gerendert wird,
und fordert, wenn IDs übergeben werden, deren Sprite Sheets an, sobald es bereit
ist. Es lehnt nie ab (rejects):

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` wählt die Variante, die für Emojis mit Hauttönen vorgewärmt wird.

### Asset site

Standardmäßig stammen das Manifest und die Sprite Sheets von
`https://animated-fluent-emojis-cdn.andryore.dev`. Die frühere Adresse,
`https://animated-fluent-emojis.pages.dev`, funktioniert weiterhin. Um sie von
deiner eigenen Kopie auszuliefern, rufe `configureEmojis` einmal auf, bevor das
erste `Emoji` gerendert wird:

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` enthält kein React und teilt sich das Manifest
mit `Emoji`, sodass es günstig ist, es daneben hinzuzufügen. Jede Funktion lädt
das Manifest und liefert `undefined` oder ein leeres Array, wenn sie es nicht
kann, und lehnt nie ab:

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

- `findEmojiByUnicode(text)` löst ein einzelnes Emoji auf und bildet einen
  einzelnen Hautton-Modifikator auf `skinTone` ab; gemischte Töne lösen zum
  Basis-Emoji auf. Symbole wie `©` oder `™` benötigen den
  Emoji-Variation-Selector (U+FE0F), um zu passen, während ZWJ-Sequenzen auch
  dann passen, wenn der Variation Selector fehlt (minimally qualified).
- Wenn sich mehrere Katalogeinträge ein Glyph teilen, liefert Lookup das
  kanonische Emoji: die ID, der die Codepoints des Glyphs vorangestellt sind,
  andernfalls einen geprüften Override, andernfalls den ersten Eintrag in der
  Katalogreihenfolge. Zum Beispiel löst `❤️` zum Herz auf und nicht zu einer
  Variante, die das Glyph wiederverwendet. Mit einem Hautton fällt es auf einen
  Geschwistereintrag zurück, der Töne hat.
- `extractEmojis(text)` findet jedes Katalog-Emoji in einem Text, belässt
  ZWJ-Sequenzen ganz und liefert Offset und Länge. Ohne `Intl.Segmenter` fällt
  es auf einen Codepoint-Gruppierer zurück, und keine der beiden Funktionen
  lehnt je ab.
- `searchEmojis(query, { limit })` vergleicht Beschreibungen ohne
  Berücksichtigung der Groß- und Kleinschreibung; `limit` ist standardmäßig 20;
  ein `limit`, der keine positive Zahl ist, bedeutet kein Limit, außer `0`, das
  nichts zurückgibt.

<a id="types"></a>

### Typen

Der Root exportiert `configureEmojis`, `preloadEmojis` und `createEmoji` sowie
die Typen `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`,
`EmojiOptions` und `EmojiFallback`. Die Komponente `Emoji` und `EmojiProps`
wurden in 0.7.0 aus dem Root entfernt; importiere sie aus `/react`. `/react`,
`/vue` und `/svelte` exportieren jeweils ihr eigenes `Emoji` und `EmojiProps`;
`/astro` hat einen Default-Export und den Typ `EmojiAstroProps`; `/element`
exportiert den Typ `FluentEmojiElement`. `EmojiId` ist die Union aller
veröffentlichten IDs und wird aus dem Katalog generiert; die Prop `id` ist als
`EmojiId | (string & {})` typisiert, sodass bekannte IDs automatisch
vorgeschlagen werden und IDs, die nach deiner installierten Version zum Katalog
hinzugekommen sind, weiterhin kompilieren.
