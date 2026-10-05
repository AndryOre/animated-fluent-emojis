# Architecture

A short code map of `animated-fluent-emojis`. The package exports one component,
`Emoji`, the `configureEmojis` and `preloadEmojis` functions, a few types and a
stylesheet. Terms such as fallback glyph, asset layout version and sprite
generation are defined in [`CONTEXT.md`](../CONTEXT.md).

```text
scripts/assets/         builds the manifests and sprites published to Pages
src/
  index.ts              public entry: Emoji, configureEmojis, preloadEmojis, types
  components/
    Emoji.tsx           the component
    Emoji.module.css    the sprite keyframe and hover/focus rules (CSS modules)
  hooks/
    use-emoji-style.ts            resolves an id to its manifest entry
    use-emoji-animation.ts        animation state, playback gating, inline style, image ref
    use-prefers-reduced-motion.ts tracks prefers-reduced-motion
  utils/
    emoji-manifest.ts   manifest store, asset site config, sprite URLs, preload
    visibility-observer.ts  one IntersectionObserver shared by every emoji
    emoji-id.generated.ts  the generated EmojiId union
    types.ts            manifest and prop types
  test/                 browser setup, fixtures, coverage-manifest guard
playground/main.tsx     manual playground rendered by `bun run dev`
```

## Component

`Emoji` is a `forwardRef` component, so a `ref` reaches the root `<span>` on
React 18 and 19. Besides its own props (`id`, `size`, `playOnHover`,
`animationIterations`, `autoPlay`, `skinTone`, `alt`, `fallback`, `onLoad`,
`onError`) it accepts any other `<span>` attribute: `className` and `style` are
merged with the component's own, and `data-*`, `aria-*` and event handlers go to
the root. `id`, `children`, `onLoad` and `onError` are not forwarded to the
span.

It resolves the id through `useEmojiStyle` and drives the animation through
`useEmojiAnimation`. It renders a `<span>` of `size` pixels containing one
`<img>` of the sprite sheet, with `loading="lazy"`, `decoding="async"`, the
sprite `src` and, for emojis with an HD sheet, a width-based `srcSet` (see
[Manifest](#manifest)). `size` is rounded; anything but a finite positive number
falls back to 100. No `<style>` element is injected: everything per-emoji is an
inline style on the image.

`useEmojiStyle` returns one of four states:

- `loading`: the manifest is pending. `Emoji` renders an empty `aria-hidden`
  placeholder `<span>` of the final size, so the layout does not shift.
- `ready`: the manifest entry. `Emoji` renders the image.
- `missing`: the id is unknown. `Emoji` renders `null`.
- `error`: the manifest failed to load. `Emoji` renders `fallback` when it is a
  node and `null` otherwise, and calls `onError` once with no event.

`alt` defaults to the manifest description; an empty string also sets
`aria-hidden` on the container so the emoji is decorative.

### Fallback

When the image fails to load, `Emoji` calls `onError` with the event and swaps
the image for the `fallback`:

- `fallback` omitted: the fallback glyph, the emoji's `unicode` character from
  the slim manifest, in a `role="img"` span labelled with `alt` (or the
  description). When the manifest entry has no `unicode`, nothing is rendered.
- `fallback` set to a node: that node, inside the same root span.
- `fallback={null}`: nothing, the 0.4 behaviour.

The fallback glyph needs the manifest, so it never shows when the manifest
itself failed: there is no entry to read the character from. Only an explicit
`fallback` node renders in that case. A different sprite source (new `id` or
`skinTone`) gets a fresh attempt.

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

### Playback gating

Autoplay, including looping, is held (`animation-play-state: paused`) until all
of these are true: the image has loaded, the emoji intersects the viewport, and
the document is visible. The first two hold off the initial run so it is not
spent on an image that is not decoded or not on screen; the third pauses every
animation while the tab is hidden and resumes it when the tab comes back.

- The load flag comes from the image `load` event, or from an already-`complete`
  image when the visibility callback fires.
- Visibility comes from `utils/visibility-observer.ts`, one shared
  `IntersectionObserver` created on first use for all emojis. Where
  `IntersectionObserver` does not exist, an emoji is reported visible so
  playback is never blocked.
- `document.hidden` is read with `useSyncExternalStore` and the
  `visibilitychange` event, with a `false` server snapshot.
- Once the initial run has finished the gate no longer applies; `playOnHover`
  replays are driven by hover and focus.

Changing the emoji `id` resets the load, visibility and initial-run state, so
the new emoji plays its initial run. `animationIterations` is normalized:
`Infinity` means `'infinite'`, and `NaN` or a negative value means `0`, which
disables autoplay.

## Manifest

`utils/emoji-manifest.ts` is a module-level store that fetches
`/v1/manifest.slim.json` from the asset site the first time an emoji needs it,
never at import time. Components subscribe with `useSyncExternalStore`
(`subscribeToManifest`, `getManifestSnapshot`); the server snapshot is always
`loading`, so server and client markup match. The slim manifest keeps what the
runtime needs (`id`, `description`, `etag`, `diverse`, `animation`, `hd` and
`unicode`); the full `manifest.json` stays on the site for the emoji lists. The
categories are flattened into a record keyed by emoji id.

The store has four statuses:

- `idle`: nothing was requested yet.
- `loading`: a fetch is in flight. Concurrent callers share one promise.
- `ready`: the record is available and never refetched.
- `error`: the fetch or the JSON failed. The error is logged with
  `console.error`; subscribers see `error`.

A store in `error` is retried, never left failed for good: on the next `Emoji`
mount, on the next `preloadEmojis` call, and when the browser fires `online`
(one listener at a time). Each retry goes through `loading` again.

`configureEmojis({ assetSiteUrl })` replaces the default asset site
(`https://animated-fluent-emojis.pages.dev`). Call it before the first `Emoji`
renders. A later change to another site bumps an internal generation so an
in-flight response from the old site is dropped, resets the store, refetches
while components are subscribed, and in development warns that a fetch had
already started.

`preloadEmojis(ids?, { skinTone })` starts the manifest load before any
component renders and, when given ids, requests those sprite sheets once the
manifest is ready, each only once. It never rejects: failures stay in the store
and are retried as above.

The sprite URL names the file by etag, so it is immutable:
`getSpriteUrl(emoji, skinTone)` builds
`<site>/v1/sprites/<category>/<id><tone>.<etag>.png`, and the HD sheet inserts
`@2x` before the extension. `getSpriteSourceSet` returns, for emojis flagged
`hd`, `"<standard> 100w, <hd> 200w"` and `undefined` for the rest. The image
also gets `sizes="<size>px"`, so the browser picks the sheet by the rendered
width and the device pixel ratio. Tests intercept the manifest request with MSW
(`src/test/`), and the shapes live in `utils/types.ts`.

## Emoji ids

`EmojiId` is generated, not written by hand: `bun run assets:lists` renders
`utils/emoji-id.generated.ts` next to the `docs/EMOJI_LIST_*.md` files from the
built manifest. The `id` prop is typed `EmojiId | (string & {})`, an open union,
so ids added by an asset site refresh compile before the types are regenerated.

## Asset site

`scripts/assets` generates the site behind the asset site URL and
`.github/workflows/sync-assets.yml` publishes it; nothing it produces is
committed. See [ADR 0006](adr/0006-cloudflare-pages-asset-hosting.md),
[ADR 0009](adr/0009-hd-sprite-sheets-and-strict-validation.md) and
[ADR 0010](adr/0010-versioned-asset-layout-and-live-seeding.md).

- `teams.ts` finds the newest Teams emoticon manifest by probing candidate
  hashes and comparing `Last-Modified`.
- `mit.ts` indexes the official `fluentui-emoji-animated` repository.
- `http.ts` wraps `fetch` with up to five attempts, exponential backoff, the
  `Retry-After` header and a 60 second timeout per attempt.
- `catalog.ts` merges both by Unicode codepoints, plans every sprite, including
  skin tones and the HD sheets, and derives the content-hashed etags together
  with `PIPELINE_VERSION`.
- `sprites.ts` converts the official APNGs into vertical sprite sheets (100px
  frames, 200px for HD) with ffmpeg and sharp, keeping the exact fps. Each
  official source is decoded once, whatever the number of sizes.
- `seed.ts` downloads sheets from the live site (see below).
- `validate.ts` checks the planned catalog and the generated files before
  anything is published.
- `slim-manifest.ts` reduces the full manifest to the slim manifest, and
  `layout-v1.ts` adds `unicode` and writes the v1 layout.
- `guards.ts` holds the sync guards.
- `build.ts` runs the plan, caches by `etag` and writes `dist-assets/`.
- `sync.ts` is the CLI behind `assets:detect`, `assets:build` and
  `assets:lists`.

### Asset layout v1

The site publishes the asset layout version `v1`:

```text
/v1/manifest.slim.json                           slim manifest, with unicode
/v1/version.json                                 layout marker
/v1/sprites/<category>/<id><tone>.<etag>.png     sprite sheet
/v1/sprites/<category>/<id><tone>.<etag>@2x.png  HD sprite sheet
```

The etag is part of the file name, so a URL never changes meaning. The
`_headers` file caches `/v1/sprites/*` as `immutable` for a year,
`/v1/manifest.slim.json` for an hour, and `/v1/version.json` with `no-cache`.
The legacy layout (`/manifest.slim.json` and `?v=<etag>` sprite paths) is still
emitted unchanged for installed 0.4.x versions. `validateV1Layout` checks that
every file name's etag matches the manifest and that the v1 manifest and
`version.json` exist.

### Seeding and the previous generation

A sync does not convert every sprite again. For an emoji whose etag, tones and
HD status are unchanged, `seed.ts` downloads all of its sheets from the live
`/v1/` site and reuses the animation data of the previous manifest. It is all or
nothing per emoji; a missing, unreadable or invalid file sends that emoji back
to the source. Reused files go through the same validation as built ones.

For an emoji whose etag changed, `retainFromLive` also downloads the sheets of
the old sprite generation under their old etag file names, so a slim manifest
cached just before a sync still resolves. The asset site therefore keeps the
current sprite generation and the one before it. Retention is skipped for emojis
that would not fit the file budget, and retained sheets are validated against
their own frame counts. Only one extra generation is kept: the next sync drops
it.

### Sync guards

`guards.ts` stops a bad sync before it deploys:

- Teams discovery: when neither the web client bundle nor ECS advertises a
  metadata hash, the sync fails instead of silently using the newest pinned
  hash. Bypassed by `force`.
- Removals: more than 5% of the previous catalog removed fails the sync.
  Bypassed by `force`.
- File count: more than 19,000 files in the output fails the sync, under the
  20,000 Pages limit. Never bypassed, `force` or not.

After the deploy, the workflow smoke-tests the legacy layout by fetching the
manifest and one sprite from the live site (the v1 smoke test runs when the
`smoke_v1` input is set). A failing run opens, or comments on, a
`sync-assets failing` issue through the `report-failure` job. To undo a bad
deployment, see
[how to roll back the asset site](how-to/roll-back-the-asset-site.md).

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
