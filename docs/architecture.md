# Architecture

A short code map of `animated-fluent-emojis`. The package exports one component,
`Emoji`, the `configureEmojis` and `preloadEmojis` functions, a few types and a
stylesheet. Terms such as fallback glyph, asset layout version and sprite
generation are defined in [`CONTEXT.md`](../CONTEXT.md).

```text
scripts/assets/         builds the manifests and sprites published to Pages
src/
  index.ts              public entry: Emoji, configureEmojis, preloadEmojis, types
  lookup/index.ts       the `animated-fluent-emojis/lookup` entry, no React
  components/
    Emoji.tsx           the component
    Emoji.module.css    the sprite keyframe and hover/focus rules (CSS modules)
  hooks/
    use-emoji-style.ts            resolves an id to its manifest entry
    use-emoji-animation.ts        animation state, playback gating, inline style, image ref
    use-prefers-reduced-motion.ts tracks prefers-reduced-motion
    use-document-hidden.ts        tracks document.hidden
  utils/
    emoji-manifest.ts   manifest store, asset site config, sprite URLs, preload
    visibility-observer.ts  one IntersectionObserver shared by every emoji
    shared-subscription.ts  one listener fanned out to every subscriber
    emoji-id.generated.ts  the generated EmojiId union
    types.ts            manifest and prop types
  test/                 browser setup, fixtures, coverage-manifest guard
playground/main.tsx     manual playground rendered by `bun run dev`
```

## Component

`Emoji` is a `forwardRef` component, so a `ref` reaches the root `<span>` on
React 18 and 19. Besides its own props (`id`, `size`, `playOnHover`,
`animationIterations`, `autoPlay`, `playing`, `onPlaybackEnd`, `skinTone`,
`alt`, `fallback`, `onLoad`, `onError`) it accepts any other `<span>` attribute:
`className` and `style` are merged with the component's own, and `data-*`,
`aria-*` and event handlers go to the root. `id`, `children`, `onLoad` and
`onError` are not forwarded to the span.

It resolves the id through `useEmojiStyle` and drives the animation through
`useEmojiAnimation`. It renders a `<span>` of `size` pixels containing one
`<img>` of the sprite sheet, with `loading="lazy"`, `decoding="async"`, the
sprite `src` and, for emojis with an HD sheet, a width-based `srcSet` (see
[Manifest](#manifest)). A numeric `size` is rounded and anything but a finite
positive number falls back to 100; see [String size](#string-size). No `<style>`
element is injected: everything per-emoji is an inline style on the image.

`useEmojiStyle` returns one of four states:

- `loading`: the manifest is pending. `Emoji` renders an empty `aria-hidden`
  placeholder `<span>` of the final size, so the layout does not shift.
- `ready`: the manifest entry. `Emoji` renders the image.
- `missing`: the id is unknown. `Emoji` renders `fallback` when it is a node and
  `null` otherwise. It warns once per id in development and never calls
  `onError`.
- `error`: the manifest failed to load. `Emoji` renders `fallback` when it is a
  node and `null` otherwise, and calls `onError` once with no event.

`alt` defaults to the manifest description; an empty string also sets
`aria-hidden` on the container so the emoji is decorative.

### String size

`size` is `number | string`. A number is pixels, rounded, with the 100 default
for invalid values. A string is any CSS length (`2rem`, `var(--size)`), used
as-is for the root's `width` and `height`, and the image gets `sizes="auto"`;
the fallback glyph is `calc(<size> * 0.75)`. A numeric string (`"48"`, `"48.5"`)
is treated as the number, and an empty or blank string falls back to 100.
Consumer `style` is spread after the sizing styles, so its `width` and `height`
win.

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
poster frame. Hover and focus still play it. The poster frame also shows while
autoplay is held by the gate below.

### Controlled playback

`playing` is a three-state control. `undefined` keeps the behaviour above.
`true` plays `animationIterations` runs and overrides `autoPlay` and reduced
motion, still waiting for the image, the viewport and a visible tab. `false`
pauses on the current frame. A finished run is not restarted by toggling.

A run that the gate blocks after it started (the tab is hidden, the emoji
scrolls out of view, or `playing` becomes `false`) is paused, not cancelled: it
keeps its animation and resumes from the same frame. Only a run that has not
started yet has its animation removed until the gate opens. `onPlaybackEnd`
fires once when a finite run ends and never for `'infinite'` or when the emoji
unmounts mid-run.

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
- `document.hidden` is read with `useSyncExternalStore` and one shared
  `visibilitychange` listener, with a `false` server snapshot. The
  `prefers-reduced-motion` media query works the same way: a module-level
  listener per signal, attached by `createSharedSubscription` when the first
  emoji subscribes and removed when the last unmounts, instead of one listener
  per emoji.
- Once the initial run has finished the gate no longer applies; `playOnHover`
  replays are driven by hover and focus.

Changing the sprite source (`id` or `skinTone`) resets the load, visibility and
initial-run state, so the new emoji plays its initial run. A sprite that failed
is retried when its source changes and when the browser comes back online,
through the same single shared `online` listener. `onError` fires once per
failure, and not for a failure left by a previous attempt. `animationIterations`
is normalized: `Infinity` means `'infinite'`, and `NaN` or a negative value
means `0`, which disables autoplay.

## Manifest

`utils/emoji-manifest.ts` is a module-level store that fetches
`/v1/manifest.slim.json` from the asset site the first time an emoji needs it,
never at import time. Components subscribe with `useSyncExternalStore`
(`subscribeToManifest`, `getManifestSnapshot`); the server snapshot is always
`loading`, so server and client markup match. The slim manifest keeps what the
runtime needs (`id`, `description`, `etag`, `diverse`, `animation`, `hd` and
`unicode`); the full `manifest.json` stays on the site for the emoji lists. The
categories are flattened into a record keyed by emoji id. The record has no
prototype, so ids such as `constructor` or `__proto__` are ordinary keys. A load
superseded by `configureEmojis` resolves to the current load's result instead of
a stale one.

The v1 manifest is compact: an entry is
`{ id, description, etag, unicode?, animation: { framesCount, fps?, firstFrame? }, diverse?: true, hd?: true }`,
and a field at its default is omitted (`fps` 24, `firstFrame` 1, `diverse` and
`hd` false). The store restores the defaults when it parses the response, so the
rest of the runtime sees full entries. The fetch gives up after 15 seconds
(`AbortSignal.timeout`), which counts as an `error` and is retried like one. An
unknown `skinTone` value resolves to the default sheet.

### HD cap

An emoji gets an HD sheet only when it has at most 81 frames (`HD_MAX_FRAMES` in
`catalog.ts`): 81 frames of 200 px is 16,200 px, under Chromium's 16,384 px
texture limit. `validate.ts` rejects an HD sheet taller than 16,384 px. Emojis
above the cap, ten at the time of writing, use the standard sheet only and have
no `hd` flag. See
[ADR 0011](adr/0011-compact-slim-manifest-and-hd-frame-cap.md).

The store has four statuses:

- `idle`: nothing was requested yet.
- `loading`: a fetch is in flight. Concurrent callers share one promise.
- `ready`: the record is available and never refetched.
- `error`: the fetch or the JSON failed. The error is logged with
  `console.error`; subscribers see `error`.

A store in `error` is retried, never left failed for good: on the next `Emoji`
mount, on the next `preloadEmojis` call, and when the browser fires `online`
(one shared `online` listener for all emojis, not one per emoji). Each retry
goes through `loading` again.

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
`<site>/v1/sprites/<category title>/<id><tone>.<etag>.png`, where the path
segment is the URL-encoded category title, not the category id, and the HD sheet
inserts `@2x` before the extension. `getSpriteSourceSet` returns, for emojis
flagged `hd`, `"<standard> 100w, <hd> 200w"` and `undefined` for the rest. The
image also gets `sizes="<size>px"` for a numeric `size` and `sizes="auto"` for a
string, so the browser picks the sheet by the rendered width and the device
pixel ratio. Tests intercept the manifest request with MSW (`src/test/`), and
the shapes live in `utils/types.ts`.

## Lookup

`animated-fluent-emojis/lookup` (`src/lookup/index.ts`, built to
`dist/lookup.js`) has no React dependency. It calls `loadEmojiManifest` from the
same store as `Emoji`, so the manifest is fetched once and shared through a Vite
chunk. It exports `findEmojiByUnicode`, `extractEmojis` (grapheme segmentation
with `Intl.Segmenter`, so ZWJ sequences stay whole; without it, a code point
grouper keeps ZWJ sequences, variation selectors, skin tones, keycaps and flags
together, so it never rejects) and `searchEmojis` (case-insensitive description
match, 20 results by default; a `limit` that is not a positive number means no
limit, except `0`, which returns nothing). The catalog is indexed by its unicode
without VS16, once per manifest. Text-default symbols such as `©` match only
with VS16 (U+FE0F); mixed skin tones resolve to the base emoji, and a single
tone to `skinTone`. The functions and the functions never reject: they resolve
to `undefined` or `[]` when the manifest cannot be loaded. It has its own
`size-limit` entry.

## Emoji ids

`EmojiId` is generated, not written by hand: `bun run assets:lists` renders
`utils/emoji-id.generated.ts` next to the `docs/EMOJI_LIST_*.md` files from the
built manifest. The `id` prop is typed `EmojiId | (string & {})`, an open union,
so ids added by an asset site refresh compile before the types are regenerated.
The same generator emits `DiverseEmojiId`, the ids that have skin tones, which
types `skinTone` for those ids.

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
- `constants.ts` holds the frame sizes (100 and 200), the skin tone suffixes and
  `indexEmoticons`, shared by every module below.
- `seed.ts` downloads sheets from the live site, seeds the cache with the
  unchanged emoji and retains the previous generation (see below).
- `validate.ts` checks the planned catalog and the generated files before
  anything is published.
- `slim-manifest.ts` reduces the full manifest to the slim manifest, and
  `layout-v1.ts` adds `unicode` and writes the v1 layout.
- `guards.ts` holds the sync guards.
- `build.ts` orchestrates the run: it plans, produces sprites with a cache keyed
  by `etag` and assembles `dist-assets/`. It delegates to `build-context.ts`
  (`BuildContext`, options and cache state), `hd.ts` (HD planning, cache and
  production), `manifest-ops.ts` (diff, animation, HD and prune helpers) and
  `site-writer.ts` (the legacy and v1 copies, manifests, `_headers` and the
  license).
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
emitted for installed 0.4.x versions; its `/sprites/*` files are not
content-addressed, so they are cached for one day only.

`version.json` lists `skippedIds` when an emoji, or only its HD sheet, failed to
build, and `limited` when the build was cut short by `--limit`. Either marks the
published site as unfinished, so the next detect rebuilds. `sync.ts verify-live`
(`bun run assets:verify-live`) fetches `/v1/version.json` without cache and
fails when it is missing, lacks the `v1` layout, is `limited` or has another
pipeline version; `release.yml` runs it before publishing. `validateV1Layout`
checks that every file name's etag matches the manifest and that the v1 manifest
and `version.json` exist.

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
  hash. Bypassed by `bypass_guards`.
- Removals: more than 5% of the previous catalog removed fails the sync, checked
  on the planned catalog before any conversion. Bypassed by `bypass_guards`.
- File count: more than 19,000 files in the output fails the sync, under the
  20,000 Pages limit. Never bypassed, `bypass_guards` or not.

After the deploy, the workflow smoke-tests the legacy layout by fetching the
manifest and one sprite from the live site, and the v1 layout by checking its
`builtAt`, one standard and one `@2x` sprite (always). A failing run opens, or
comments on, a `sync-assets failing` issue through the `report-failure` job. To
undo a bad deployment, see
[how to roll back the asset site](how-to/roll-back-the-asset-site.md).

### Sync inputs and triggers

`sync-assets.yml` detects a `/v1/version.json` that is missing, lacks the `v1`
layout or carries another pipeline version, and builds in that case even when
Teams and the official repository are unchanged. Manual dispatch has two inputs
that replace the old `force`: `rebuild` forces a build, `bypass_guards` skips
the Teams discovery and removal guards. The first sync after 0.5 converts every
sprite again, because the live site has no `/v1/` files to seed from.

## CSS

`Emoji.module.css` holds the `emoji-play` keyframe and the hover rules. With
`playOnHover`, the animation is off until the pointer enters the container, or a
parent `<a>` or `<button>` has `:focus-visible`. Vite emits the CSS as
`dist/style.css`, exported as `animated-fluent-emojis/style.css`; consumers must
import it, and `package.json` marks CSS files as side effects so bundlers keep
the import.

## Build output

Vite 8 library mode builds two ES modules, `dist/animated-fluent-emojis.js` and
`dist/lookup.js`, plus a shared chunk with the manifest store, with `react` and
`react-dom` externalized, and type declarations. `size-limit` measures each
entry together with the shared manifest chunk (brotli), since importing either
subpath loads both: 3.9 kB for the component bundle and 2.3 kB for lookup. The
stylesheet is limited to 170 B. The bundle starts with a `"use client";` banner
so it works from Next.js server components. See
[ADR 0003](adr/0003-esm-only-and-vite-8.md).
