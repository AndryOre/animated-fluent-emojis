# Usage guide

The full API of `animated-fluent-emojis`. For install and a first emoji, start
with the [README](../README.md).

- [Importing the component](#importing-the-component)
- [Props](#props)
- [Hover and focus](#hover-and-focus)
- [Reduced motion](#reduced-motion)
- [Fallback](#fallback)
- [Playback](#playback)
- [Images and HD sprite sheets](#images-and-hd-sprite-sheets)
- [Preloading](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Types](#types)

The component fetches a small manifest from the asset site the first time an
emoji renders, never at import time. While it loads, `Emoji` renders an empty,
`aria-hidden` placeholder of the final size, so the layout does not shift. If
the id is unknown it renders nothing. If the manifest cannot be loaded, it
renders your `fallback` node, or nothing, and retries on the next mount, the
next `preloadEmojis` call or when the browser comes back online.

## Importing the component

Import `Emoji` from the React subpath:

```jsx
import { Emoji } from 'animated-fluent-emojis/react'
```

Migrating from 0.5: the root `Emoji` export is deprecated in 0.6 and removed in
0.7. Change the import path, nothing else; props and behavior are identical.
`configureEmojis` and `preloadEmojis` stay at `animated-fluent-emojis`.

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

Any other `<span>` attribute (`data-*`, `aria-*`, `title`, event handlers) is
passed to the root. A numeric `size` is rounded; anything but a finite positive
number falls back to 100. A string `size` is passed to CSS as-is, so
`size="2rem"` or `size="var(--emoji-size)"` work. A numeric string such as
`"48"` is treated as the number 48, and the image gets `sizes="auto"` for other
strings; a `style` with `width` or `height` wins over `size`.

`skinTone` is one of `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` or `'dark'`. It only applies to emojis marked `diverse`; for any
other emoji, or an unknown value, the default sheet is used. `DiverseEmojiId`
lists the ids that have skin tones, and `skinTone` is typed against it when `id`
is one of them.

### Hover and focus

With `playOnHover`, the animation plays after the initial run when the pointer
enters the emoji, and also when the emoji sits inside a `<button>` or `<a>` that
receives keyboard focus (`:focus-visible`).

### Reduced motion

When the user's system asks to reduce motion (`prefers-reduced-motion: reduce`),
`autoPlay` is ignored and the emoji rests on its poster frame, the first frame
of the animation. `playOnHover` still plays on hover and focus, because that is
an explicit user action.

### Fallback

If the sprite sheet fails to load, `Emoji` shows the fallback glyph: the emoji's
native Unicode character, labelled with `alt`. Pass `fallback` to render your
own node instead, or `fallback={null}` to render nothing:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` runs when the image fails (with the event) and when the manifest fails
(without one). The fallback glyph needs the manifest, so when the manifest
itself failed only an explicit `fallback` node renders. An unknown id renders
the `fallback` node, or nothing; it does not call `onError` and, in development,
warns once per id. The manifest request gives up after 15 seconds and is retried
like any other failure.

### Playback

Autoplay waits until the sprite sheet has loaded, the emoji is on screen and the
tab is visible, so offscreen or background emojis do not animate. Hidden tabs
pause every emoji and resume when the tab returns. Changing `id` starts the new
emoji's initial run again. `animationIterations` of `0`, a negative number or
`NaN` disables autoplay; `Infinity` is the same as `'infinite'`. While autoplay
is held, the emoji shows its poster frame.

Use `playing` to drive playback yourself. `true` plays `animationIterations`
runs, overriding `autoPlay` and reduced motion (still waiting for the image, the
viewport and a visible tab); `false` pauses on the current frame. A finished run
is not restarted by toggling, so remount with a new `key` to replay.
`onPlaybackEnd` runs once when a finite run ends; it never runs for `'infinite'`
or when the emoji unmounts mid-run.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

### Images and HD sprite sheets

Sprite sheets are loaded with `loading="lazy"` and `decoding="async"`. Emojis
that have an HD sprite sheet (200px frames) also get a width-based `srcSet`
(`100w` and `200w`) with `sizes` set to the rendered size (`auto` for a string
`size`), so the browser picks the `@2x` sheet on high-density displays.

### Preloading

`preloadEmojis` starts fetching the manifest before any `Emoji` renders and,
when given ids, requests their sprite sheets once it is ready. It never rejects:

```jsx
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` picks the variant to warm for emojis that have skin tones.

### Asset site

By default the manifest and sprite sheets come from
`https://animated-fluent-emojis.pages.dev`. To serve them from your own copy,
call `configureEmojis` once, before the first `Emoji` renders:

```jsx
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` has no React and shares the manifest with
`Emoji`, so it is cheap to add next to it. Every function loads the manifest and
resolves to `undefined` or an empty array, never rejects, when it cannot:

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

- `findEmojiByUnicode(text)` resolves one emoji and maps a single skin tone
  modifier to `skinTone`; mixed tones resolve to the base emoji. Symbols such as
  `©` or `™` need the emoji variation selector (U+FE0F) to match, while ZWJ
  sequences match even when the variation selector is missing (minimally
  qualified).
- When several catalog entries share a glyph, lookup returns the canonical
  emoji: the official id prefixed with the glyph's code points, otherwise a
  reviewed override, otherwise the first entry in catalog order. For example,
  `❤️` resolves to the heart rather than a variant that reuses the glyph. With a
  skin tone, it falls back to a sibling entry that has tones.
- `extractEmojis(text)` finds every catalog emoji in a text, keeping ZWJ
  sequences whole, with its offset and length. Without `Intl.Segmenter` it falls
  back to a code point grouper, and neither function ever rejects.
- `searchEmojis(query, { limit })` matches descriptions, ignoring case; `limit`
  defaults to 20; a `limit` that is not a positive number means no limit, except
  `0`, which returns nothing.

### Types

The package exports `Emoji`, `configureEmojis`, `preloadEmojis` and the types
`EmojiProps`, `SkinTone`, `EmojiId` and `DiverseEmojiId`. `EmojiId` is the union
of every published id and is generated from the catalog; the `id` prop is typed
`EmojiId | (string & {})`, so known ids autocomplete and ids added to the
catalog after your installed version still compile.
