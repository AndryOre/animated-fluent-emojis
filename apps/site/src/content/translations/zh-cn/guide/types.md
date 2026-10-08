---
title: Types
sourceHash: fe6ccd1aa3f2d622
---

根路径导出 `configureEmojis`、`preloadEmojis` 和 `createEmoji`，以及类型
`SkinTone`、`EmojiId`、`DiverseEmojiId`、`EmojiController`、`EmojiOptions` 和
`EmojiFallback`。`Emoji` 组件和 `EmojiProps` 已在 0.7.0 中从根路径移除；请从
`/react` 导入。`/react`、`/vue` 和 `/svelte` 各自导出自己的 `Emoji` 和
`EmojiProps`；`/astro` 有一个默认导出和 `EmojiAstroProps` 类型；`/element` 导出
`FluentEmojiElement` 类型。`EmojiId`
是所有已发布 id 的联合类型，由目录生成；`id` prop 的类型为
`EmojiId | (string & {})`，因此已知的 id 会自动补全，而在你安装的版本之后加入目录的 id 仍然可以通过编译。
