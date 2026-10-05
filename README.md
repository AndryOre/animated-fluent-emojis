<p align="center">
  <img src="./docs/assets/Cover.webp" alt="Animated Fluent Emojis">
</p>

# Animated Fluent Emojis

<p align="center">
  <a href="https://github.com/AndryOre/animated-fluent-emojis/actions/workflows/ci.yml"><img src="https://github.com/AndryOre/animated-fluent-emojis/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/animated-fluent-emojis"><img src="https://img.shields.io/npm/v/animated-fluent-emojis" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/animated-fluent-emojis" alt="License"></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/AndryOre/animated-fluent-emojis"><img src="https://api.scorecard.dev/projects/github.com/AndryOre/animated-fluent-emojis/badge" alt="OpenSSF Scorecard"></a>
</p>

**Animated Fluent Emojis** is a React component library that brings Microsoft's
Fluent emojis to life in your web applications. This library offers an easy way
to integrate expressive and engaging animated emojis, enhancing user experience
and visual appeal in your React projects.

<p align="center">
  <img src="docs/assets/rocket-launch.webp" alt="Rocket Launch" width="100" height="100">
  <img src="docs/assets/fire.webp" alt="Fire" width="100" height="100">
  <img src="docs/assets/hundred-points.webp" alt="Hundred Points" width="100" height="100">
</p>

> 🎉 **Exclusive Feature:** Until now, these Animated Fluent Emojis were only
> available within Microsoft Teams. This library makes them accessible for use
> in any web application for the first time, bringing a unique and lively emoji
> experience to your projects!

<details>
<summary>Table of Contents</summary>

- [Features](#features-)
- [Tech Stack](#tech-stack-)
- [Installation](#installation-)
- [Usage](#usage-)
- [Props](#props)
- [Migrating from 0.4](#migrating-from-04)
- [Examples](#examples)
- [Emoji Categories](#emoji-categories-)
- [Contributing](#contributing)
- [Support the Project](#support-the-project)
- [License](#license-)
- [Acknowledgements](#acknowledgements)

</details>

## Features 🌟

- 🚀 **Easy Integration**: Simple React component for quick implementation in
  your projects.
- 🎨 **Customizable**: Adjust size, animation behavior, and more to fit your
  design needs.
- 🔄 **Flexible Animation**: Support for autoplay and hover- or focus-triggered
  animations, and a still poster frame when the user prefers reduced motion.
- ♿ **Accessible**: Descriptive `alt` text by default, or mark an emoji as
  decorative.
- 🖼️ **Sharp on HD screens**: Emojis with an HD sprite sheet are served at 2x to
  high-density displays.
- 🌈 **Wide Variety**: Access to a diverse set of emojis from Microsoft's Fluent
  Emoji collection, with skin tone variants.
- 📦 **Lightweight**: Optimized for performance to keep your applications fast
  and responsive.
- 🌐 **TypeScript Support**: Full TypeScript support for improved development
  experience.

## Tech Stack 🧰

- [![React][React]][React-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Vite][Vite]][Vite-url]

## Installation 🔧

To install Animated Fluent Emojis in your project, run one of the following
commands:

```sh
bun add animated-fluent-emojis
# or
npm install animated-fluent-emojis
# or
pnpm add animated-fluent-emojis
```

The package supports React 18 and 19 (`react` and `react-dom` are peer
dependencies) and is ESM-only.

## Usage 📚

1. Import the Emoji component and the stylesheet in your React file (the
   stylesheet import is required once, for example in your app entry). The
   stylesheet carries the animation keyframes, so without it emojis render as
   static sprite sheets:

   ```jsx
   import { Emoji } from 'animated-fluent-emojis'

   import 'animated-fluent-emojis/style.css'
   ```

2. Use the component in your JSX:

   ```jsx
   <Emoji id="1f603_grinningfacewithbigeyes" />
   ```

3. Customize the emoji with props:
   ```jsx
   <Emoji id="1f44b_wavinghand" size={64} playOnHover skinTone="medium" />
   ```

The component fetches a small manifest from the asset site the first time an
emoji renders, never at import time. While it loads, `Emoji` renders an empty,
`aria-hidden` placeholder of the final size, so the layout does not shift. If
the id is unknown it renders nothing. If the manifest cannot be loaded, it
renders your `fallback` node, or nothing, and retries on the next mount, the
next `preloadEmojis` call or when the browser comes back online.

### Next.js and server components

The published bundle starts with `"use client";`, so you can import `Emoji` from
a server component in the Next.js App Router. Import the stylesheet once, for
example in the root layout. The component renders its placeholder on the server
and the emoji after hydration.

`configureEmojis` and `preloadEmojis` are functions of that same client entry,
so call them from a client module (one with `"use client"`), not from a Server
Component such as the root layout.

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
  `❤` resolves to the heart rather than a variant that reuses the glyph. With a
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

## Migrating from 0.4

- The glyph fallback is the new default: when a sprite sheet fails, `Emoji`
  shows the emoji's native character instead of an empty box. Pass
  `fallback={null}` to restore the 0.4 behaviour.
- `Emoji` now forwards `ref` and any `<span>` attribute to its root span, and
  merges `className` and `style`. Wrappers that relied on those props being
  dropped may need adjusting.
- A failed manifest load no longer sticks: it is retried on the next mount,
  `preloadEmojis` call or `online` event. `onError` now also reports it.
- Autoplay waits for the image, the viewport and a visible tab; see
  [Playback](#playback).
- The runtime reads the versioned asset layout (`/v1/`) with a compact manifest
  that omits default values. If you mirror the asset site, publish that layout
  with the 0.5 pipeline; see the [changelog](CHANGELOG.md),
  [ADR 0010](docs/adr/0010-versioned-asset-layout-and-live-seeding.md) and
  [ADR 0011](docs/adr/0011-compact-slim-manifest-and-hd-frame-cap.md).
- An unknown `id` now renders `fallback` (nothing by default) and warns once in
  development; it never calls `onError`.
- Emojis with more than 81 frames lost their HD sheet and use the standard one.
- `size` also accepts a CSS length string.

Terms such as fallback glyph and asset layout version are defined in
[`CONTEXT.md`](CONTEXT.md).

## Examples

### Basic Usage

```jsx
import { Emoji } from 'animated-fluent-emojis'

import 'animated-fluent-emojis/style.css'

function App() {
  return (
    <div>
      <h1>Hello, Animated Emojis!</h1>
      <Emoji id="1f4af_hundredpointssymbol" />
      <Emoji id="1f92f_explodinghead" size={64} playOnHover />
      <Emoji id="launch" animationIterations={3} alt="Rocket" />
      <Emoji id="fire" alt="" />
    </div>
  )
}

export default App
```

## Emoji Categories 📋

For a complete list of available emojis and their corresponding IDs, Unicode
representations, descriptions, and keywords, please refer to our
[Emoji List](./docs/EMOJI_LIST.md). The emojis are organized into the following
categories:

- [Activities](./docs/EMOJI_LIST_Activities.md)
- [Animals](./docs/EMOJI_LIST_Animals.md)
- [Food](./docs/EMOJI_LIST_Food.md)
- [Hand Gestures](./docs/EMOJI_LIST_Hand_gestures.md)
- [Objects](./docs/EMOJI_LIST_Objects.md)
- [People](./docs/EMOJI_LIST_People.md)
- [Smileys](./docs/EMOJI_LIST_Smilies.md)
- [Symbols](./docs/EMOJI_LIST_Symbols.md)
- [Travel and Places](./docs/EMOJI_LIST_Travel_and_places.md)

## Contributing

We welcome contributions to Animated Fluent Emojis! Read
[CONTRIBUTING](CONTRIBUTING.md) for setup and conventions, and the
[development guide](docs/development.md) for scripts and tooling. To report a
vulnerability, follow [SECURITY](.github/SECURITY.md).

## Support the Project

If you find Animated Fluent Emojis useful, please consider supporting the
project:

- [![GitHub Stars][GitHub Stars]][GitHub-url]
- [![GitHub Follow][GitHub Follow]][GitHub-follow-url]
- [![X Follow][X-follow]][X-url]
- [![Ko-fi][Ko-fi]][Ko-fi-url]

Your support helps maintain and improve Animated Fluent Emojis!

## License 📄

Animated Fluent Emojis is totally free for commercial and personal use, this
software is licensed under the [ISC License](LICENSE).

## Assets and licensing

The manifest and sprite sheets are served from the asset site on Cloudflare
Pages (`animated-fluent-emojis.pages.dev`), generated by `scripts/assets` and
refreshed automatically. Most emojis come from the animated Fluent emoji set
that Microsoft Teams publishes; the rest come from Microsoft's MIT-licensed
[fluentui-emoji-animated][Microsoft Fluent Emojis Animated] repository. The
sprites remain Microsoft's assets: this package's ISC license covers the code
only. The MIT notice for the official repository is published at
`/LICENSE-fluentui-emoji-animated.txt` on the asset site.

## Acknowledgements

- Microsoft for their [Fluent Emoji][Microsoft Fluent Emojis] set
- [Tarikul Islam Anik][Tarikul Islam Anik Profile] for the [Animated Fluent
  Emojis][Tarikul Islam Anik Repo] project, which served as inspiration for this
  library

[React]:
  https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black
[React-url]: https://react.dev/
[TypeScript]:
  https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vite]:
  https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[GitHub Stars]:
  https://img.shields.io/github/stars/andryore/animated-fluent-emojis?style=for-the-badge&logo=github&logoColor=white&labelColor=24292e
[GitHub-url]: https://github.com/andryore/animated-fluent-emojis
[X-follow]:
  https://img.shields.io/badge/X-000000.svg?style=for-the-badge&logo=X&logoColor=white
[X-url]: https://twitter.com/andryore
[GitHub Follow]:
  https://img.shields.io/github/followers/andryore?style=for-the-badge&logo=github&logoColor=white&labelColor=24292e
[GitHub-follow-url]: https://github.com/andryore
[Ko-fi]:
  https://img.shields.io/badge/Kofi-FF5E5B.svg?style=for-the-badge&logo=Ko-fi&logoColor=white
[Ko-fi-url]: https://ko-fi.com/andryore
[Microsoft Fluent Emojis]: https://github.com/microsoft/fluentui-emoji
[Microsoft Fluent Emojis Animated]:
  https://github.com/microsoft/fluentui-emoji-animated
[Tarikul Islam Anik Profile]: https://github.com/Tarikul-Islam-Anik
[Tarikul Islam Anik Repo]:
  https://github.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis
