# Architecture

A short code map of `animated-fluent-emojis`. The package exports one component,
`Emoji`, a `configureEmojis` function, a few types and a stylesheet.

```text
scripts/assets/         builds the manifests and sprites published to Pages
src/
  index.ts              public entry: Emoji, configureEmojis, public types
  components/
    Emoji.tsx           the component
    Emoji.module.css    the sprite keyframe and hover/focus rules (CSS modules)
  hooks/
    use-emoji-style.ts            resolves an id to its manifest entry
    use-emoji-animation.ts        animation state, inline animation style, image ref
    use-prefers-reduced-motion.ts tracks prefers-reduced-motion
  utils/
    emoji-manifest.ts   lazy manifest loading, asset site config, sprite URLs
    emoji-id.generated.ts  the generated EmojiId union
    types.ts            manifest and prop types
  test/                 browser setup, fixtures, coverage-manifest guard
playground/main.tsx     manual playground rendered by `bun run dev`
```

## Component

`Emoji` takes `id`, `size`, `playOnHover`, `animationIterations`, `autoPlay`,
`skinTone` and `alt`. It resolves the id through `useEmojiStyle` and drives the
animation through `useEmojiAnimation`. It renders a `<span>` of `size` pixels
containing one `<img>` of the sprite sheet, with `loading="lazy"`,
`decoding="async"`, the sprite `src` and, for emojis with an HD sheet, a
`srcSet`. No `<style>` element is injected: everything per-emoji is an inline
style on the image.

`useEmojiStyle` returns one of three states:

- `loading`: the manifest is pending. `Emoji` renders an empty `aria-hidden`
  placeholder `<span>` of the final size, so the layout does not shift.
- `ready`: the manifest entry. `Emoji` renders the image.
- `missing`: the id is unknown or the manifest failed to load (the error is
  logged). `Emoji` renders `null`.

`alt` defaults to the manifest description; an empty string also sets
`aria-hidden` on the container so the emoji is decorative.

## Animation

The sprite sheet is a vertical stack of frames. `Emoji.module.css` holds one
static `@keyframes emoji-play` that moves the image from `translateY(0)` to
`translateY(-100%)`; the stylesheet is the only place the keyframes exist, which
is why consumers must import `style.css`. Everything that depends on the emoji
is set inline by `useEmojiAnimation`:

- `animationDuration` is `framesCount / fps` seconds, with the exact, possibly
  fractional, fps from the manifest.
- `animationTimingFunction` is `steps(framesCount)`.
- `animationIterationCount` is the `animationIterations` prop, or `infinite`
  once the initial run is over and `playOnHover` is set.
- `transform` offsets the image to the poster frame (`firstFrame`), the frame
  the emoji rests on whenever no animation runs.

`usePrefersReducedMotion` wraps the `prefers-reduced-motion: reduce` media query
with `useSyncExternalStore` (and a `false` server snapshot). While it is true,
`autoPlay` is ignored, the animation name is `none` and the emoji rests on the
poster frame. Hover and focus still play it.

## Manifest

`utils/emoji-manifest.ts` fetches `manifest.slim.json` from the asset site the
first time an emoji needs it, never at import time. The promise is memoized; a
failed load clears it so the next render retries. The slim manifest keeps only
what the runtime needs (`id`, `description`, `etag`, `diverse`, `animation` and
`hd`); the full `manifest.json` stays on the site for the emoji lists. The
categories are flattened into a record keyed by emoji id.

`configureEmojis({ assetSiteUrl })` replaces the default asset site
(`https://animated-fluent-emojis.pages.dev`). It must run before the first
`Emoji` renders, because the manifest is fetched once.

`getSpriteUrl(emoji, skinTone)` builds
`<site>/sprites/<category>/<id><tone>.png?v=<etag>`. `getSpriteSourceSet`
returns the `srcSet` (`1x` plus the `@2x` HD sheet) for emojis flagged `hd`, and
`undefined` for the rest. Tests intercept the manifest request with MSW
(`src/test/`), and the shapes live in `utils/types.ts`.

## Emoji ids

`EmojiId` is generated, not written by hand: `bun run assets:lists` renders
`utils/emoji-id.generated.ts` next to the `docs/EMOJI_LIST_*.md` files from the
built manifest. The `id` prop is typed `EmojiId | (string & {})`, an open union,
so ids added by an asset site refresh compile before the types are regenerated.

## Asset site

`scripts/assets` generates the site behind the asset site URL and
`.github/workflows/sync-assets.yml` publishes it; nothing it produces is
committed. See [ADR 0006](adr/0006-cloudflare-pages-asset-hosting.md) and
[ADR 0009](adr/0009-hd-sprite-sheets-and-strict-validation.md).

- `teams.ts` finds the newest Teams emoticon manifest by probing candidate
  hashes and comparing `Last-Modified`.
- `mit.ts` indexes the official `fluentui-emoji-animated` repository.
- `catalog.ts` merges both by Unicode codepoints, plans every sprite, including
  skin tones and the HD sheets, and derives the content-hashed etags together
  with `PIPELINE_VERSION`.
- `sprites.ts` converts the official APNGs into vertical sprite sheets (100px
  frames, 200px for HD) with ffmpeg and sharp, keeping the exact fps.
- `validate.ts` checks the planned catalog and the generated files before
  anything is published.
- `slim-manifest.ts` reduces the full manifest to the published
  `manifest.slim.json`.
- `build.ts` runs the plan, caches by `etag` and writes `dist-assets/`.
- `sync.ts` is the CLI behind `assets:detect`, `assets:build` and
  `assets:lists`.

## CSS

`Emoji.module.css` holds the `emoji-play` keyframe and the hover rules. With
`playOnHover`, the animation is off until the pointer enters the container, or a
parent `<a>` or `<button>` has `:focus-visible`. Vite emits the CSS as
`dist/style.css`, exported as `animated-fluent-emojis/style.css`; consumers must
import it, and `package.json` marks CSS files as side effects so bundlers keep
the import.

## Build output

Vite 8 library mode builds one ES module (`dist/animated-fluent-emojis.js`) with
`react` and `react-dom` externalized, plus type declarations. The bundle starts
with a `"use client";` banner so it works from Next.js server components. See
[ADR 0003](adr/0003-esm-only-and-vite-8.md).
