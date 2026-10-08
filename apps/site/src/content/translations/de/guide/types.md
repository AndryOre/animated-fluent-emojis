---
title: Typen
sourceHash: fe6ccd1aa3f2d622
---

Der Root exportiert `configureEmojis`, `preloadEmojis` und `createEmoji` sowie
die Typen `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`,
`EmojiOptions` und `EmojiFallback`. Die Komponente `Emoji` und `EmojiProps`
wurden in 0.7.0 aus dem Root entfernt; importiere sie aus `/react`. `/react`,
`/vue` und `/svelte` exportieren jeweils ihr eigenes `Emoji` und `EmojiProps`;
`/astro` hat einen Default-Export und den Typ `EmojiAstroProps`; `/element`
exportiert den Typ `FluentEmojiElement`. `EmojiId` ist die Union aller
veröffentlichten IDs und wird aus dem Katalog generiert; die Prop `id` ist als
`EmojiId | (string & {})` typisiert, sodass bekannte IDs automatisch
vorgeschlagen werden und IDs, die nach deiner installierten Version zum Katalog
hinzugekommen sind, weiterhin kompilieren.
