# Overview

The full API of `animated-fluent-emojis`, one topic per page. For install and a
first emoji, start with the [README](../README.md).

The [props](guide/props.md) are shared by every adapter; each
[framework](guide/frameworks.md) section says how a prop is spelled there. The
component fetches a small manifest from the asset site the first time an emoji
renders, never at import time. While it loads, `Emoji` renders an empty,
`aria-hidden` placeholder of the final size, so the layout does not shift. If
the id is unknown it renders your `fallback` node, or nothing. If the manifest
cannot be loaded, it renders your `fallback` node, or nothing, and retries on
the next mount, the next `preloadEmojis` call or when the browser comes back
online.

## Install

```sh
bun add animated-fluent-emojis
```

## Guide

- [Frameworks](guide/frameworks.md): React, Vue, Svelte, Astro, plain HTML and
  `createEmoji`.
- [Props](guide/props.md): every prop, its type and its default.
- [Behavior](guide/behavior.md): hover and focus, reduced motion, fallback and
  playback.
- [Assets](guide/assets.md): images and HD sprite sheets, preloading and the
  asset site.
- [Lookup](guide/lookup.md): find emojis by glyph, text or description.
- [Types](guide/types.md): the exported types.
