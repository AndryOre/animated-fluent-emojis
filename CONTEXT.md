# Animated Fluent Emojis

A React component that renders Microsoft's animated Fluent emojis from a
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
once: only id, description, etag, `diverse`, animation and `hd` per emoji.
_Avoid_: Light manifest, mini manifest

**Poster frame**: The frame an emoji rests on when nothing animates: before
playback, with `autoPlay` off, or under reduced motion. It is the animation's
`firstFrame`. _Avoid_: Thumbnail, still, first image

**HD sprite sheet**: The `@2x` sprite sheet with 200px frames, published next to
the standard one for emojis with an official counterpart and served through
`srcSet`. It has the same frame count as the standard sheet. _Avoid_: Retina
sheet, large sprite

**Asset site**: The Cloudflare Pages site that serves the manifest and the
sprite sheets. _Avoid_: CDN, bucket

**Fallback glyph**: The emoji's native unicode character, shown when its sprite
sheet fails to load. _Avoid_: Placeholder (the loading box), alt text

**Asset layout version**: The `/v1/` prefix under which the asset site publishes
its slim manifest and etag-named sprite sheets. A new version is added only when
the shape of the slim manifest breaks. _Avoid_: API version, manifest version

**Sprite generation**: The set of sprite sheets one sync publishes. The asset
site keeps the current generation and the one before it. _Avoid_: Release, build
