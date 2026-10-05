# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-10-05

### Added

- `className` and `style` on `Emoji`, merged with the component's own, and any
  other `<span>` attribute (`data-*`, `aria-*`, event handlers), passed to the
  root span.
- `ref` on `Emoji`, forwarded to the root span, on React 18 and 19.
- `fallback` prop: a node rendered when the sprite sheet or the manifest fails
  to load. `fallback={null}` renders nothing.
- `onLoad` and `onError` props. `onError` also runs, without an event, when the
  manifest fails to load.
- `preloadEmojis(ids?, { skinTone })` starts the manifest load before the first
  render and warms the sprite sheets of the given ids.
- The slim manifest carries `unicode` for every emoji, used as the fallback
  glyph.
- The asset site publishes asset layout version `v1`: `/v1/manifest.slim.json`,
  `/v1/version.json` and etag-named sprite sheets under `/v1/sprites/`, with
  immutable caching. The legacy layout is still published for 0.4.x.
- The asset site keeps the previous sprite generation for one more sync, so a
  manifest cached just before a sync still resolves.
- Sync guards: the sync fails when Teams discovery fails on both advertised
  sources, when more than 5% of the catalog would be removed (both bypassed by
  `force`), and always above 19,000 output files. A post-deploy smoke test, a
  `sync-assets failing` issue and a
  [rollback how-to](docs/how-to/roll-back-the-asset-site.md) back them up.

- `playing` prop: `true` plays and overrides `autoPlay` and reduced motion,
  `false` pauses, `undefined` keeps the default. `onPlaybackEnd` fires once when
  a finite run ends.
- `size` accepts any CSS length string (`2rem`, `var(--size)`) as well as a
  number.
- `animated-fluent-emojis/lookup`: `findEmojiByUnicode`, `extractEmojis` and
  `searchEmojis`, with no React and the manifest shared with `Emoji`.
- `DiverseEmojiId`, generated with `EmojiId`, and a `skinTone` typed against it.
- Sync inputs `rebuild` and `bypass_guards`, a layout-aware trigger that
  publishes `/v1/` when it is missing or the pipeline version changed, and a v1
  smoke test that always runs.

### Changed

- **Behavior change:** when a sprite sheet fails to load, `Emoji` now shows the
  fallback glyph, the emoji's Unicode character, instead of nothing. Pass
  `fallback={null}` to restore the previous behavior.
- The runtime reads `/v1/manifest.slim.json` and etag-named sprite sheets
  instead of the unversioned paths and the `?v=<etag>` query.
- `srcSet` is width-based (`100w`, `200w`) with `sizes` set to the rendered
  size.
- Autoplay waits until the image has loaded, the emoji is on screen (one shared
  `IntersectionObserver`) and the tab is visible; hidden tabs pause playback.
- `size` is rounded, and anything but a finite positive number falls back
  to 100. `animationIterations` is normalized: `Infinity` is `'infinite'`, and
  `NaN` or a negative value disables autoplay.
- The v1 slim manifest is compact: defaults (`fps` 24, `firstFrame` 1, `diverse`
  and `hd` false) are omitted and restored by the runtime. The legacy manifest
  is unchanged.
- **Behavior change:** only emojis with at most 81 frames get an HD sheet, so
  the sheet stays under Chromium's 16,384 px limit; validation rejects a taller
  one. Ten emojis lose their HD sheet and use the standard one.
- An unknown `id` renders `fallback` (nothing by default) instead of always
  `null`, warns once in development and never calls `onError`.
- While autoplay is held, the emoji shows its poster frame.
- Visibility and reduced-motion listeners are shared at module level instead of
  one per emoji.
- The sync replaces `force` with `rebuild` and `bypass_guards`. The removal
  guard runs on the planned catalog before conversion; the file-count guard is
  never bypassed.
- The release workflow is split into a `verify` job (`contents: read`) and a
  `publish` job (`id-token: write`, no dependency install) that skips when the
  version already exists, and it checks that `/v1/version.json` is live.
- `build.ts` is split into deep modules, with no behaviour change.
- **First sync:** the first sync after this change converts every sprite again,
  because the live site has no `/v1/` files to seed from, and publishes the
  whole `/v1/` layout.
- The asset build downloads unchanged sprite sheets from the live site instead
  of converting them again, decodes each official source once, and fetches with
  retries, backoff and a 60 second timeout.

### Fixed

- Changing the `id` of a mounted `Emoji` resets its animation state, so the new
  emoji plays its initial run.
- A manifest that failed to load is retried on the next mount, on
  `preloadEmojis` and when the browser comes back online, instead of only on the
  next render.

- The manifest request times out after 15 seconds instead of waiting forever.
- State resets when the sprite changes, not only when the `id` does, and a
  failed sprite is retried on a source change or when the browser goes online.
- An unknown `skinTone` falls back to the default sheet.

### Security

- The release workflow gives `id-token: write` only to the job that publishes,
  which installs nothing and runs no repository scripts.
- Pipeline validation rejects undecodable or oversized sprites, and the removal
  guard stops a sync that would drop more than 5% of the catalog before any
  conversion.

### Migration

- If you relied on an empty box when a sprite sheet fails, pass
  `fallback={null}`.
- An unknown `id` now renders `fallback`; it still renders nothing by default.
- If you mirror the asset site, publish the `v1` layout with the 0.5 pipeline;
  see [ADR 0010](docs/adr/0010-versioned-asset-layout-and-live-seeding.md).

## [0.4.0] - 2026-10-05

### Added

- `alt` prop on `Emoji`: accessible text, defaulting to the emoji description;
  an empty string marks the emoji as decorative.
- `configureEmojis({ assetSiteUrl })` to serve the manifest and sprite sheets
  from your own asset site.
- HD (`@2x`, 200px) sprite sheets for every emoji with an official counterpart,
  served through `srcSet`.
- `playOnHover` also plays when the emoji sits inside a focused `<button>` or
  `<a>`.
- `EmojiId`, `EmojiProps` and `SkinTone` are exported from the package.
- The bundle starts with `"use client";`, so `Emoji` works from Next.js server
  components.

### Changed

- **Breaking:** while the manifest loads, `Emoji` renders an empty `aria-hidden`
  placeholder of the final size instead of `null`. It still renders `null` for
  an unknown id or a failed load.
- **Breaking:** under `prefers-reduced-motion: reduce`, `autoPlay` is ignored
  and the emoji rests on its poster frame; with `playOnHover`, hover and focus
  still play it.
- **Breaking:** images are rendered with `loading="lazy"` and
  `decoding="async"`, so offscreen emojis load when they approach the viewport.
- **Breaking:** the `id` prop is typed `EmojiId | (string & {})` instead of
  `string`. Known ids autocomplete; any string still compiles.
- **Breaking:** the runtime fetches `manifest.slim.json` instead of
  `manifest.json`, on first render instead of at import. Asset sites that mirror
  the catalog must publish the slim manifest.
- Etags of converted sprites are content hashes that include a pipeline version,
  and the animation frame rate is exact instead of rounded.
- The asset build validates every animation and sprite sheet and fails on any
  problem.

### Fixed

- Emojis animate again: no per-emoji `<style>` with a
  `transform: ... !important` rule overrides the keyframe anymore.
- A failed manifest fetch is retried on the next render instead of leaving every
  emoji blank.

### Migration

- Make sure `animated-fluent-emojis/style.css` is imported: it carries the
  animation keyframes.
- If you styled or tested around `null` while loading, handle the placeholder
  `<span aria-hidden="true">` instead.
- If you mirror the asset site, publish `manifest.slim.json` and, optionally,
  the `@2x` sheets, and call `configureEmojis` before the first render.
- To get type checking against published ids, type your ids as `EmojiId`; plain
  `string` values keep compiling.

## [0.3.0] - 2026-10-05

### Added

- `skinTone` prop on `Emoji` to pick a skin tone for emojis with variants.
- The 40 official Fluent animated emojis that Teams does not ship, such as
  flags, 😀, 🖕 and the "facing right" variants.
- Sprite URLs carry the emoji `etag` so updated sprites are never served stale.

### Changed

- The manifest and sprites are served from
  `https://animated-fluent-emojis.pages.dev` and refreshed automatically each
  week.

### Fixed

- Emojis no longer fail to load now that `cdn.animated-fluent-emojis.com` no
  longer exists.

## [0.2.0] - 2026-10-05

### Added

- `animated-fluent-emojis/style.css` export for importing the component styles.
- React 19 support in the `react` and `react-dom` peer dependency ranges.

### Changed

- **Breaking:** the package is now ESM-only. The UMD and CommonJS builds were
  removed.

### Fixed

- `sideEffects` now declares the stylesheet so bundlers no longer drop the
  component styles during tree shaking.

## [0.1.2] - 2024-09-02

### Changed

- Version bump with no source changes since 0.1.1.

## [0.1.1] - 2024-08-22

### Added

- Emoji list and preview images in the documentation.

### Changed

- Package metadata in `package.json` (description, keywords, repository, bugs
  and homepage links, `sideEffects`).
- Renamed the `lib` directory to `src` and removed demo code.

### Fixed

- Emoji image source URL.
- Type declarations are now included in the build output.
- CSS classes of the emoji container.

## [0.1.0] - 2024-08-21

### Added

- Initial release of the animated Fluent emoji React components.

[Unreleased]:
  https://github.com/AndryOre/animated-fluent-emojis/compare/v0.5.0...HEAD
[0.5.0]:
  https://github.com/AndryOre/animated-fluent-emojis/compare/v0.4.0...v0.5.0
[0.4.0]:
  https://github.com/AndryOre/animated-fluent-emojis/compare/v0.3.0...v0.4.0
[0.3.0]:
  https://github.com/AndryOre/animated-fluent-emojis/compare/v0.2.0...v0.3.0
[0.2.0]:
  https://github.com/AndryOre/animated-fluent-emojis/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/AndryOre/animated-fluent-emojis/releases/tag/v0.1.2
[0.1.1]: https://github.com/AndryOre/animated-fluent-emojis/releases/tag/v0.1.1
[0.1.0]: https://github.com/AndryOre/animated-fluent-emojis/releases/tag/v0.1.0
