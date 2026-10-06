# Animated Fluent Emojis

A component library, with adapters for React, Vue, Svelte, Astro and a
`<fluent-emoji>` element, that renders Microsoft's animated Fluent emojis from a
generated, automatically refreshed catalog hosted on a static site.

## Language

**Catalog**: The full set of emojis the asset site publishes, each with a stable
id. _Avoid_: Library, collection, emoji list

**Teams emoji**: An emoji whose id and sprite sheet come from the Teams emoticon
catalog. _Avoid_: Microsoft emoji, base emoji

**Official emoji**: An emoji from the MIT-licensed
`microsoft/fluentui-emoji-animated` repository, published only when Teams lacks
it or its id was already published. _Avoid_: MIT emoji, extra emoji

**Pinned id**: The id of an official emoji that was published once and is kept
forever, even when Teams later ships the same emoji. _Avoid_: Legacy id, alias

**Sprite sheet**: A vertical stack of animation frames, one image per emoji and
skin tone. _Avoid_: Spritesheet, atlas, animation file

**Manifest**: The `manifest.json` the asset pipeline generates, with every
emoji's shortcuts, unicode and keywords. Only the pipeline and the emoji lists
read it. _Avoid_: Catalog file, index

**Slim manifest**: The `manifest.slim.json` the runtime fetches, lazily and
once: only id, description, etag, `unicode`, `diverse`, animation and `hd` per
emoji, with every field at its default value omitted. _Avoid_: Light manifest,
mini manifest

**Poster frame**: The frame an emoji rests on when nothing animates: before
playback, with `autoPlay` off, or under reduced motion. It is the animation's
`firstFrame`. _Avoid_: Thumbnail, still, first image

**HD sprite sheet**: The `@2x` sprite sheet with 200px frames, published next to
the standard one for emojis with an official counterpart and at most 81 frames,
so the sheet stays within 16,384 px, and served through `srcSet`. It has the
same frame count as the standard sheet. _Avoid_: Retina sheet, large sprite

**Asset site**: The Cloudflare Pages site that serves the manifest and the
sprite sheets. _Avoid_: CDN, bucket

**Fallback glyph**: The emoji's native unicode character, shown when its sprite
sheet fails to load. _Avoid_: Placeholder (the loading box), alt text

**Asset layout version**: The `/v1/` prefix under which the asset site publishes
its slim manifest and etag-named sprite sheets. A new version is added only when
the shape of the slim manifest breaks. _Avoid_: API version, manifest version

**Sprite generation**: The set of sprite sheets one sync publishes. The asset
site keeps the current generation and the one before it. _Avoid_: Release, build

**Lookup**: Resolving text (a unicode emoji, a string containing emojis or a
description query) to catalog emojis without rendering them. _Avoid_: Search
API, finder, resolver

**Skipped emoji**: An emoji the sync failed to build because of an error
(download, decode, conversion). It is left out of the catalog, recorded in
`version.json`, and the next sync rebuilds it. An HD sheet whose frame count
does not match the standard one is not a skipped emoji: the emoji ships without
HD. _Avoid_: Dropped emoji, missing emoji

**Canonical emoji**: The catalog entry a glyph resolves to when several entries
share it: the official id prefixed with its code points, otherwise a reviewed
override, otherwise the first one in catalog order. _Avoid_: Primary emoji,
default variant

**Pipeline version**: The version of the build rules; a change republishes every
sprite even when no upstream source changed. _Avoid_: Build version, schema
version

**Core**: The framework-free layer: size and iteration normalization, the pure
playback-gate state machine that produces plain CSS style, image wiring and the
environment signals (reduced motion, visibility, document hidden). Every adapter
is a thin layer over it. _Avoid_: Engine, shared code, base

**Adapter**: A framework's entry point to the library, published as a subpath
export (`/react`, `/vue`, `/svelte`, `/astro`, `/element`) and built on the
core. A native adapter uses the framework's own idioms, such as slots. _Avoid_:
Wrapper, binding, plugin

**Element**: The `<fluent-emoji>` Web Component exported from `/element`, for
frameworks with no native adapter and for plain HTML. _Avoid_: Custom tag, web
component (when the specific element is meant)
