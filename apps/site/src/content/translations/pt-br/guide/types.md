---
title: Tipos
sourceHash: fe6ccd1aa3f2d622
---

A raiz exporta `configureEmojis`, `preloadEmojis` e `createEmoji`, e os tipos
`SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions` e
`EmojiFallback`. O componente `Emoji` e `EmojiProps` foram removidos da raiz na
0.7.0; importe-os de `/react`. `/react`, `/vue` e `/svelte` exportam cada um o
seu próprio `Emoji` e `EmojiProps`; `/astro` tem uma exportação padrão e o tipo
`EmojiAstroProps`; `/element` exporta o tipo `FluentEmojiElement`. `EmojiId` é a
união de todos os ids publicados e é gerado a partir do catálogo; a prop `id` é
tipada como `EmojiId | (string & {})`, então os ids conhecidos têm autocompletar
e os ids adicionados ao catálogo depois da sua versão instalada continuam
compilando.
