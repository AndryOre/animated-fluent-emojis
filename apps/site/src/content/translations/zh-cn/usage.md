---
title: 使用指南
sourceHash: 4101ae648cca44fe
---

`animated-fluent-emojis` 的完整 API，每页一个主题。安装和第一个表情请先阅读
[README](../README.md)。

下面的 props 由所有适配器共用，各个框架章节会说明该 prop 在对应框架中的写法。组件在第一次渲染表情时才会从 asset
site 获取一个很小的 manifest，绝不会在导入时获取。加载期间，`Emoji`
会渲染一个最终尺寸的空 `aria-hidden`
占位元素，因此布局不会发生偏移。如果 id 未知，它会渲染你提供的 `fallback`
节点，否则不渲染任何内容。如果无法加载 manifest，它同样会渲染你提供的 `fallback`
节点，否则不渲染任何内容，并在下一次挂载、下一次调用 `preloadEmojis`
或浏览器重新联网时重试。

## 安装

```sh
bun add animated-fluent-emojis
```

## 指南

- [Frameworks](guide/frameworks.md)：React、Vue、Svelte、Astro、纯 HTML 和
  `createEmoji`。
- [Props](guide/props.md)：每个 prop、它的类型和默认值。
- [行为](guide/behavior.md)：悬停与焦点、减少动态效果、fallback 和播放。
- [Assets](guide/assets.md)：图片与 HD sprite sheet、预加载和 asset site。
- [Lookup](guide/lookup.md)：按字形、文本或描述查找表情。
- [Types](guide/types.md)：导出的类型。
