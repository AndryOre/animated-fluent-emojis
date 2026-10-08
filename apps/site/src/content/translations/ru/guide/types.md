---
title: Types
sourceHash: fe6ccd1aa3f2d622
---

Корень экспортирует `configureEmojis`, `preloadEmojis` и `createEmoji`, а также
типы `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions`
и `EmojiFallback`. Компонент `Emoji` и `EmojiProps` были удалены из корня в
0.7.0; импортируйте их из `/react`. `/react`, `/vue` и `/svelte` экспортируют
каждый свои `Emoji` и `EmojiProps`; у `/astro` есть экспорт по умолчанию и тип
`EmojiAstroProps`; `/element` экспортирует тип `FluentEmojiElement`. `EmojiId` —
это объединение всех опубликованных id, оно генерируется из каталога; prop `id`
типизирован как `EmojiId | (string & {})`, поэтому известные id дополняются
автоматически, а id, добавленные в каталог после вашей установленной версии, всё
равно компилируются.
