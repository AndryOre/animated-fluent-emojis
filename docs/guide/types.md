# Types

The root exports `configureEmojis`, `preloadEmojis` and `createEmoji`, and the
types `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions`
and `EmojiFallback`. The `Emoji` component and `EmojiProps` were removed from
the root in 0.7.0; import them from `/react`. `/react`, `/vue` and `/svelte`
each export their own `Emoji` and `EmojiProps`; `/astro` has a default export
and the `EmojiAstroProps` type; `/element` exports the `FluentEmojiElement`
type. `EmojiId` is the union of every published id and is generated from the
catalog; the `id` prop is typed `EmojiId | (string & {})`, so known ids
autocomplete and ids added to the catalog after your installed version still
compile.
