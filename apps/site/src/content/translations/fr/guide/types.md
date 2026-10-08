---
title: Types
sourceHash: fe6ccd1aa3f2d622
---

La racine exporte `configureEmojis`, `preloadEmojis` et `createEmoji`, ainsi que
les types `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`,
`EmojiOptions` et `EmojiFallback`. Le composant `Emoji` et `EmojiProps` ont été
supprimés de la racine dans la 0.7.0 ; importez-les depuis `/react`. `/react`,
`/vue` et `/svelte` exportent chacun leurs propres `Emoji` et `EmojiProps` ;
`/astro` a un export par défaut et le type `EmojiAstroProps` ; `/element`
exporte le type `FluentEmojiElement`. `EmojiId` est l'union de tous les ids
publiés et est généré à partir du catalog ; la prop `id` est typée
`EmojiId | (string & {})`, si bien que les ids connus sont autocomplétés et que
les ids ajoutés au catalog après votre version installée continuent de compiler.
