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

**Asset site**: The Cloudflare Pages site that serves the manifest and the
sprite sheets. _Avoid_: CDN, bucket
