---
title: Types
sourceHash: fe6ccd1aa3f2d622
---

ルートは `configureEmojis`、`preloadEmojis`、`createEmoji` と、型
`SkinTone`、`EmojiId`、`DiverseEmojiId`、`EmojiController`、`EmojiOptions`、`EmojiFallback`
をエクスポートします。`Emoji` コンポーネントと `EmojiProps`
は 0.7.0 でルートから削除されました。`/react`
からインポートしてください。`/react`、`/vue`、`/svelte` はそれぞれ独自の `Emoji`
と `EmojiProps` をエクスポートします。`/astro` にはデフォルトエクスポートと
`EmojiAstroProps` 型があり、`/element` は `FluentEmojiElement`
型をエクスポートします。`EmojiId`
は公開されているすべての id のユニオンで、カタログから生成されます。`id`
prop の型は `EmojiId | (string & {})`
なので、既知の id はオートコンプリートされ、インストール済みのバージョンより後にカタログへ追加された id もコンパイルできます。
