# Architecture

A short code map of `animated-fluent-emojis`. The package exports one component,
`Emoji`, plus the hooks and utilities behind it, and a stylesheet.

```text
src/
  index.ts              public entry: re-exports Emoji
  components/
    Emoji.tsx           the component
    Emoji.module.css    animation and hover styles (CSS modules)
  hooks/
    use-emoji-style.ts      resolves an id to its manifest entry and category
    use-emoji-animation.ts  animation state, hover handlers, image ref
  utils/
    emoji-manifest.ts   fetches and indexes the CDN manifest, builds styles
    types.ts            manifest and prop types
  test/                 browser setup, fixtures, coverage-manifest guard
playground/main.tsx     manual playground rendered by `bun run dev`
```

## Component

`Emoji` takes `id`, `size`, `playOnHover`, `animationIterations` and `autoPlay`.
It looks the emoji up through `useEmojiStyle`, drives the animation through
`useEmojiAnimation`, injects a per-`id`/`size` `<style>` element into
`document.head` (removed on unmount), and renders a `<span>` containing the
animated image. It returns `null` when the id is not in the manifest.

## Hooks

- `useEmojiStyle(id)` returns the manifest entry and its category folder.
- `useEmojiAnimation(...)` tracks whether the initial animation finished, builds
  the inline animation style, and exposes mouse handlers and the image ref used
  for play-on-hover.

Both are re-exported from `src/hooks/index.ts`.

## Manifest

`utils/emoji-manifest.ts` fetches `manifest.json` from
`https://cdn.animated-fluent-emojis.com` once, flattens its categories into a
record keyed by emoji id, and exposes `generateEmojiStyle(id, size)`, which
builds the sprite-stepping `@keyframes` for one emoji. The request happens at
module load, so tests intercept it with MSW (`src/test/`), and the shapes live
in `utils/types.ts`.

## CSS

`Emoji.module.css` holds the hover rules: animation is paused until the pointer
enters the container when `playOnHover` is set. Vite emits the CSS as
`dist/style.css`, exported as `animated-fluent-emojis/style.css`; consumers must
import it, and `package.json` marks CSS files as side effects so bundlers keep
the import.

## Build output

Vite 8 library mode builds one ES module (`dist/animated-fluent-emojis.js`) with
`react` and `react-dom` externalized, plus type declarations. See
[ADR 0003](adr/0003-esm-only-and-vite-8.md).
