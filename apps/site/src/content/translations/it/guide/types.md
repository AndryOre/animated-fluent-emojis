---
title: Tipi
sourceHash: fe6ccd1aa3f2d622
---

La radice esporta `configureEmojis`, `preloadEmojis` e `createEmoji`, oltre ai
tipi `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions`
e `EmojiFallback`. Il componente `Emoji` e `EmojiProps` sono stati rimossi dalla
radice nella 0.7.0; importali da `/react`. `/react`, `/vue` e `/svelte`
esportano ciascuno i propri `Emoji` e `EmojiProps`; `/astro` ha un export di
default e il tipo `EmojiAstroProps`; `/element` esporta il tipo
`FluentEmojiElement`. `EmojiId` è l'unione di tutti gli id pubblicati ed è
generato a partire dal catalog; la prop `id` è tipizzata
`EmojiId | (string & {})`, così gli id noti hanno l'autocompletamento e gli id
aggiunti al catalog dopo la tua versione installata continuano a compilare.
