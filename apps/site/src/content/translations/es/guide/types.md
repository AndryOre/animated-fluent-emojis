---
title: Tipos
sourceHash: fe6ccd1aa3f2d622
---

La raíz exporta `configureEmojis`, `preloadEmojis` y `createEmoji`, y los tipos
`SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions` y
`EmojiFallback`. El componente `Emoji` y `EmojiProps` se eliminaron de la raíz
en la 0.7.0; impórtalos desde `/react`. `/react`, `/vue` y `/svelte` exportan
cada uno su propio `Emoji` y `EmojiProps`; `/astro` tiene una exportación por
defecto y el tipo `EmojiAstroProps`; `/element` exporta el tipo
`FluentEmojiElement`. `EmojiId` es la unión de todos los ids publicados y se
genera a partir del catalog; la prop `id` se tipa como
`EmojiId | (string & {})`, por lo que los ids conocidos se autocompletan y los
ids agregados al catalog después de tu versión instalada siguen compilando.
