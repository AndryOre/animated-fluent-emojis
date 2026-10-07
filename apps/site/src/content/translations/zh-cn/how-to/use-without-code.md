---
title: 无需代码使用 emoji
sourceHash: 1a25330011d80c02
---

把带动画的 Fluent emoji 放进 Slack、Notion、Google Docs、电子邮件或 GitHub
README。你只需要一个链接或一个文件，无需库，无需安装。

每个 emoji 以及每种肤色，都是文件站点上的一个普通文件：

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

把 `<slug>` 换成 emoji 的名称。例如，下面是大眼笑脸：

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

把这样的链接粘贴到浏览器中，emoji 就会出现。右键点击即可保存文件。

## 查找名称（slug）

slug 是 emoji 的英文描述，全部小写，单词之间用短横线连接：`grinning-face-with-big-eyes`、`waving-hand`。

带肤色的 emoji 会加上以下后缀之一：`-light`、`-medium-light`、`-medium`、`-medium-dark`、`-dark`。因此
`waving-hand` 是默认的黄色手，`waving-hand-medium-dark`
则是中深肤色的同一个挥手。

如果两个 emoji 会重名，第二个会加上 `-2`（再有则是
`-3`）。slug 一经发布就不会改变，所以你的链接会一直有效。

要浏览所有名称，请打开索引：

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## 选择格式

| 格式 | 路径                | 适用场景                                |
| ---- | ------------------- | --------------------------------------- |
| GIF  | `/gif/<slug>.gif`   | 任何需要动画的地方：Slack、邮件、README |
| WebP | `/webp/<slug>.webp` | 边缘平滑的动画，适合深色背景            |
| PNG  | `/png/<slug>.png`   | 静态图片：Google Docs、Slides           |

## Slack

1. 下载
   `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`。
2. 在 Slack 中打开 emoji 选择器，选择 **Add Emoji**，然后选择 **Upload Image**。
3. 选择该文件，为它命名（例如 `wave`）并保存。

在任何消息中输入 `:wave:` 即可使用。

## Notion

把图片链接粘贴到页面中并选择 **Embed as image**，或者输入 `/image`，选择 **Embed
link** 并粘贴同一个链接。

## Google Docs 和 Slides

Google Docs 和 Slides 显示的是静态图片，所以请使用 PNG。依次选择
**Insert**、**Image**、**By URL**，然后粘贴：

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## 电子邮件

把 GIF 作为图片插入，可以选择文件，也可以使用链接。大多数邮件应用都会播放它。少数应用，例如某些桌面版 Outlook，只会显示第一帧。

## GitHub README

Markdown：

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

如果想设置尺寸，可以使用 HTML：

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

请保留 `alt` 文本，屏幕阅读器读出的就是它。

## 深色背景

GIF 的透明度是非此即彼的：每个像素要么完全透明，要么完全不透明。因此柔和的边缘在深色背景上可能出现一圈浅色边。这种情况下请使用 WebP 或 PNG，它们能保持平滑的边缘。

## 署名

emoji 图稿归 Microsoft 所有，其使用须遵守 Microsoft 的条款。本项目与 Microsoft 没有关联，也未获得其认可。部分 emoji 来自 Microsoft 的 MIT 许可仓库；适用于它们的声明位于
`/LICENSE-fluentui-emoji-animated.txt`，署名信息位于
`/NOTICE.txt`。在你自己的作品中使用这些图稿之前，请先查看适用于它们的条款。

在构建网站或应用？[使用指南](../usage.md)介绍了这个库。
