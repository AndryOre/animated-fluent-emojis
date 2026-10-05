# 0008: Static sprite keyframes and a lazy slim manifest

## Status

Accepted

Date: 2026-10-05

## Context

Three runtime problems shared one root: the component did too much per emoji,
and too early.

- Each `Emoji` injected a `<style>` element with a per-`id`/`size` `@keyframes`
  and a `transform: ... !important` rule. That rule overrode the keyframe's own
  `transform`, so the animation never moved: emojis rendered as a still frame.
- The full `manifest.json` (shortcuts, unicode and keywords included) was
  fetched when the module was imported, even in apps that never render an emoji,
  during server rendering, and with no way to retry after a failure. A failed
  fetch left every emoji blank for the page's lifetime.
- The asset site URL was a constant, and `id` was a plain `string`, so a typo
  compiled and rendered nothing.

[ADR 0004](0004-vitest-browser-mode.md) chose browser tests partly because of
the injected `<style>` elements; that rationale is now historical, the other
reasons (real CSS animations, hover and `getComputedStyle`) still hold.

## Decision

- **One static keyframe in the stylesheet.** `Emoji.module.css` defines a single
  `emoji-play` keyframe that goes from `translateY(0)` to `translateY(-100%)`.
  The per-emoji values (`steps(framesCount)`, the duration and the poster-frame
  offset) are inline styles on the image. Nothing is injected into
  `document.head`.
- **A slim manifest, loaded lazily.** The asset site publishes
  `manifest.slim.json` with only the fields the runtime reads. It is fetched the
  first time an `Emoji` renders, memoized, and a failed load clears the memo so
  the next render retries. Importing the package makes no request.
- **A sized placeholder while loading.** `Emoji` renders an empty `aria-hidden`
  span of the final size until the manifest resolves, so the layout does not
  jump. An unknown id or a failed load renders `null`.
- **A configurable asset site.** `configureEmojis({ assetSiteUrl })` replaces
  the default `https://animated-fluent-emojis.pages.dev`, for consumers who
  mirror the assets.
- **A generated, open `EmojiId`.** `bun run assets:lists` writes the union of
  published ids. The `id` prop is `EmojiId | (string & {})`: known ids
  autocomplete, and ids published after a consumer's installed version still
  compile.
- **Reduced motion rests on the poster frame.** Under
  `prefers-reduced-motion: reduce`, `autoPlay` is ignored and the animation name
  is `none`; hover and focus still play.

### Rejected alternatives

- **Keeping the injected `<style>` and removing `!important`**: still one style
  element per emoji and size, and it needs the document at render time, which
  blocks server rendering.
- **Fetching the manifest at import with a retry**: still a request for apps
  that never render an emoji, and a side effect at import.
- **Bundling the manifest into the package**: it changes with every catalog
  refresh, which would turn each refresh into a release.
- **A strict `EmojiId` union for `id`**: a catalog refresh would break compiles
  for consumers who typed a newly published id.

## Consequences

- **Breaking:** an emoji renders a placeholder instead of `null` while loading,
  rests on the poster frame under reduced motion, loads its image lazily, and
  `id` has a new type. See the changelog.
- The stylesheet now carries the keyframes, so the `style.css` import is
  required for animation, not only for hover.
- `configureEmojis` must run before the first render; the manifest is fetched
  once.
- Tests mock the slim manifest with MSW and reset modules to get a fresh load.
- The slim manifest is about a third of the size of the full one, which stays on
  the asset site for the emoji lists.
