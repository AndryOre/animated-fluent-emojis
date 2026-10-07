---
title: 使用指南
sourceHash: 1c5618d6e3a40904
---

`animated-fluent-emojis` 的完整 API。安装和第一个表情请先阅读
[README](../README.md)。

- [Frameworks](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [纯 HTML](#plain-html)
  - [Angular、Solid 和 Preact](#angular-solid-and-preact)
  - [不使用框架](#without-a-framework)
- [Props](#props)
- [悬停与焦点](#hover-and-focus)
- [减少动态效果](#reduced-motion)
- [Fallback](#fallback)
- [播放](#playback)
- [图片与 HD sprite sheet](#images-and-hd-sprite-sheets)
- [预加载](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Types](#types)

下面的 props 由所有适配器共用，各个框架章节会说明该 prop 在对应框架中的写法。组件在第一次渲染表情时才会从 asset
site 获取一个很小的 manifest，绝不会在导入时获取。加载期间，`Emoji`
会渲染一个最终尺寸的空 `aria-hidden`
占位元素，因此布局不会发生偏移。如果 id 未知，它会渲染你提供的 `fallback`
节点，否则不渲染任何内容。如果无法加载 manifest，它同样会渲染你提供的 `fallback`
节点，否则不渲染任何内容，并在下一次挂载、下一次调用 `preloadEmojis`
或浏览器重新联网时重试。

## Frameworks

一个包，每个框架一个导入路径。`configureEmojis` 和 `preloadEmojis`
与框架无关，仍然从 `animated-fluent-emojis` 导入；参见 [Preloading](#preloading)
和
[Asset site](#asset-site)。所有适配器共用同一个播放核心，并通过同一套一致性测试，因此各处的 props 行为相同。参见
[ADR 0014](adr/0014-multi-framework-support.md)。

React、Vue 和 Svelte 适配器以及 `createEmoji` 从
`animated-fluent-emojis/style.css` 读取关键帧；请只导入一次。`<fluent-emoji>`
和 Astro 组件自带样式。

### React

从 React 子路径导入 `Emoji`：

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

从 0.6 或更早版本迁移：根路径的 `Emoji`
导出在 0.6 中已弃用，并在 0.7 中移除。只需更改导入路径，其他无需改动；props 和行为完全相同。`EmojiProps`
类型也已移至 `animated-fluent-emojis/react`。`configureEmojis` 和
`preloadEmojis` 仍然位于 `animated-fluent-emojis`。支持 React 18 和 19，`react`
和 `react-dom` 是可选的 peer 依赖。

### Vue

需要 Vue 3.3 或更高版本。`Emoji`
接受下面的 props，使用 camelCase 写法。`fallback` 插槽会替换图片，事件有
`load`、`error` 和 `playbackEnd`。其他属性，例如 `class`、 `style` 和
`data-*`，会传给根 span。

```vue
<script setup lang="ts">
import { Emoji } from 'animated-fluent-emojis/vue'

import 'animated-fluent-emojis/style.css'

const handlePlaybackEnd = () => {
  console.log('done')
}
</script>

<template>
  <Emoji
    id="1f44b_wavinghand"
    :size="64"
    play-on-hover
    @playback-end="handlePlaybackEnd"
  >
    <template #fallback><span>👋</span></template>
  </Emoji>
</template>
```

在服务端以及水合（hydration）期间，它会渲染一个最终尺寸的空占位元素，因此可以在 Nuxt 中使用。

### Svelte

需要 Svelte 5。`Emoji` 接受下面的 props；`fallback`
是一个 snippet，`class`、`style` 和 `attributes` 会传给根 span。回调有
`onLoad`、`onError` 和 `onPlaybackEnd`。

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

它在服务端渲染占位元素，水合后再渲染表情，因此可以在 SvelteKit 中使用。该包的 export 带有
`svelte` 条件，指向组件源码。

### Astro

需要 Astro
5 或更高版本。组件在构建时渲染表情的标记，因此在任何脚本运行之前，sprite 就已在 HTML 中，随后一个很小的脚本在浏览器中启动播放。它自带样式，无需导入样式表。当 id 未知或图片加载失败时，会渲染具名插槽
`fallback`。

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

props 与下面列出的相同，但不含回调，并带有 `class` 和字符串类型的
`style`。根 span 以可冒泡的 DOM 事件而不是回调的形式派发
`emoji-load`、`emoji-error` 和 `playback-end`。浏览器脚本也会在
`astro:page-load` 时再次运行，因此视图过渡（view transitions）可以继续正常工作。

### 纯 HTML

导入 `animated-fluent-emojis/element` 会注册
`<fluent-emoji>`。它不需要样式表：关键帧位于其 shadow root 中。

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

属性以 kebab-case 对应各个 props：`id`、`size`、`play-on-hover`、
`animation-iterations`、`auto-play`、`playing`、`skin-tone` 和
`alt`。布尔属性只要其值不是 `false`
就视为开启。元素上也有同名的 camelCase 属性（`element.playOnHover = true`）；设置属性不会改写对应的 attribute。带有
`slot="fallback"` 的元素就是 fallback。该元素以可冒泡且 composed 的事件派发
`emoji-load`、`emoji-error` 和 `playback-end`。

在元素被定义之前，它没有尺寸。请把同一入口导出的 `FLUENT_EMOJI_PRE_UPGRADE_CSS`
添加到页面 CSS 中，以根据 `size` 属性（单位为像素）预留占位空间，避免布局偏移。

### Angular、Solid 和 Preact

它们通过各自的模板语法使用 `<fluent-emoji>`；请参阅 how-to 指南：
[Angular](how-to/use-with-angular.md)、[Solid](how-to/use-with-solid.md) 和
[Preact](how-to/use-with-preact.md)。Lit、Alpine 和 htmx 同理：导入
`animated-fluent-emojis/element`，然后写上该标签即可。

### 不使用框架

`createEmoji`
可以渲染到任意 DOM 节点并返回一个 controller。它是所有适配器的无框架核心。导入它不会触碰 DOM。

```js
import { createEmoji } from 'animated-fluent-emojis'

import 'animated-fluent-emojis/style.css'

const controller = createEmoji(document.querySelector('#slot'), {
  id: '1f44b_wavinghand',
  size: 64,
  fallback: () => document.createTextNode('👋'),
})

controller.update({ playing: false })
controller.destroy()
```

它的选项就是下面的 props，另有用于根 span 的 `className`、`style` 和
`attributes`， `onLoad`、`onError` 和 `onPlaybackEnd` 回调，以及
`fallback`，它可以是一个节点、一个返回节点的函数，或 `null`。

## Props

| Prop                | Type                   | Default     | Description                                                          |
| ------------------- | ---------------------- | ----------- | -------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | 表情的唯一标识符；已知的 id 会自动补全                               |
| size                | number or string       | 100         | 像素值，或任意 CSS 长度，例如 `2rem` 或 `var(--size)`                |
| playOnHover         | boolean                | false       | 是否在悬停和键盘聚焦时播放动画                                       |
| animationIterations | number or 'infinite'   | 2           | 加载时播放动画的次数                                                 |
| autoPlay            | boolean                | true        | 是否在挂载时自动播放动画                                             |
| playing             | boolean                | -           | 控制播放；`true` 播放，`false` 暂停，省略则保持默认行为              |
| onPlaybackEnd       | function               | -           | 在有限次数的 `animationIterations` 播放结束时调用一次                |
| skinTone            | SkinTone               | 'default'   | 有变体的表情所用的肤色（见下文）                                     |
| alt                 | string                 | description | 无障碍文本；默认为表情的描述，`""` 表示其为装饰性内容                |
| className           | string                 | -           | 根 `<span>` 的类名，会与组件自身的类名合并                           |
| style               | CSSProperties          | -           | 根 `<span>` 的内联样式；`width` 和 `height` 跟随 `size`              |
| ref                 | `Ref<HTMLSpanElement>` | -           | 转发到根 `<span>`；适用于 React 18 和 19                             |
| fallback            | ReactNode              | glyph       | 在图片或 manifest 加载失败，或 id 未知时渲染；`null`：不渲染任何内容 |
| onLoad              | function               | -           | 在 sprite sheet 加载完成时调用                                       |
| onError             | function               | -           | 图片加载失败时调用；manifest 加载失败时调用，且不带事件              |

任何其他 `<span>`
属性（`data-*`、`aria-*`、`title`、事件处理函数）都会传给根元素。数值类型的
`size` 会被四舍五入；任何不是有限正数的值都会回退为 100。字符串类型的 `size`
会原样传给 CSS，因此 `size="2rem"` 或 `size="var(--emoji-size)"` 都可以使用。像
`"48"` 这样的数字字符串会被视为数字 48，其他字符串则会让图片获得
`sizes="auto"`；带有 `width` 或 `height` 的 `style` 优先于 `size`。

`skinTone` 取值为 `'default'`、`'light'`、`'medium-light'`、`'medium'`、
`'medium-dark'` 或 `'dark'` 之一。它只适用于标记为 `diverse`
的表情；对于其他表情，或未知的值，会使用默认的 sheet。`DiverseEmojiId`
列出了具有肤色的 id，当 `id` 是其中之一时，`skinTone` 会据此获得类型约束。

### 悬停与焦点

启用 `playOnHover`
后，在初次播放之后，当指针进入表情时会播放动画；当表情位于接收键盘焦点（`:focus-visible`）的
`<button>` 或 `<a>` 内时，同样会播放。

### 减少动态效果

当用户的系统要求减少动态效果（`prefers-reduced-motion: reduce`）时，`autoPlay`
会被忽略，表情停留在其海报帧，即动画的第一帧。`playOnHover`
仍然会在悬停和聚焦时播放，因为这是用户的明确操作。

### Fallback

如果 sprite sheet 加载失败，`Emoji`
会显示 fallback 字形：该表情原生的 Unicode 字符，并以 `alt` 作为标签。传入
`fallback` 可改为渲染你自己的节点，传入 `fallback={null}` 则不渲染任何内容：

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

图片加载失败时（带事件）和 manifest 加载失败时（不带事件）都会运行
`onError`。fallback 字形依赖 manifest，因此当 manifest 本身加载失败时，只有显式提供的
`fallback` 节点会被渲染。未知的 id 会渲染 `fallback`
节点，否则不渲染任何内容；它不会调用
`onError`，在开发环境中，每个 id 只会警告一次。manifest 请求在 15 秒后放弃，并像其他失败一样重试。

### 播放

自动播放会等到 sprite
sheet 加载完成、表情进入屏幕且标签页可见之后才开始，因此屏幕外或后台的表情不会播放动画。隐藏的标签页会暂停所有表情，并在标签页返回时恢复。更改
`id` 会让新表情重新开始初次播放。`animationIterations` 为 `0`、负数或 `NaN`
时会禁用自动播放；`Infinity` 与 `'infinite'`
等效。自动播放被阻止期间，表情显示其海报帧。

使用 `playing` 可以自行控制播放。`true` 会播放 `animationIterations` 次，并覆盖
`autoPlay` 和减少动态效果的设置（仍然会等待图片、视口和可见的标签页）；`false`
会暂停在当前帧。已完成的播放不会因切换而重新开始，因此请使用新的 `key`
重新挂载以重播。`onPlaybackEnd` 在有限次数的播放结束时运行一次；对于
`'infinite'`，或表情在播放中途卸载时，它不会运行。

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

### 图片与 HD sprite sheet

sprite sheet 以 `loading="lazy"` 和 `decoding="async"` 加载。拥有 HD sprite
sheet（200px 帧）的表情还会获得基于宽度的 `srcSet`（`100w` 和 `200w`），其
`sizes` 设为渲染尺寸（字符串类型的 `size` 则为
`auto`），因此浏览器会在高密度显示器上选用 `@2x` sheet。

### 预加载

`preloadEmojis` 会在任何 `Emoji`
渲染之前开始获取 manifest，并且在传入 id 时，于 manifest 就绪后请求它们的 sprite
sheet。它永远不会 reject：

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` 用于为有肤色的表情选择要预热的变体。

### Asset site

默认情况下，manifest 和 sprite sheet 来自
`https://animated-fluent-emojis-cdn.andryore.dev`。之前的地址
`https://animated-fluent-emojis.pages.dev`
仍然可用。若要从你自己的副本提供它们，请在第一个 `Emoji` 渲染之前调用一次
`configureEmojis`：

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` 不依赖 React，并与 `Emoji`
共用 manifest，因此在其旁边添加它的成本很低。每个函数都会加载 manifest，在无法加载时 resolve 为
`undefined` 或空数组，永远不会 reject：

```js
import {
  extractEmojis,
  findEmojiByUnicode,
  searchEmojis,
} from 'animated-fluent-emojis/lookup'

await findEmojiByUnicode('👍🏽') // { id: 'yes', skinTone: 'medium' }
await extractEmojis('Hi 👋 there') // [{ id, text, index, length }]
await searchEmojis('party', { limit: 5 }) // [{ id }]
```

- `findEmojiByUnicode(text)` 解析单个表情，并将单个肤色修饰符映射为
  `skinTone`；混合肤色会解析为基础表情。`©` 或 `™`
  这类符号需要表情变体选择符（U+FE0F）才能匹配，而 ZWJ 序列即使缺少变体选择符也能匹配（minimally
  qualified）。
- 当多个目录条目共用同一个字形时，lookup 会返回规范表情：优先是以该字形码点作为 id 前缀的条目，其次是经过审核的覆盖项，再其次是目录顺序中的第一个条目。例如，
  `❤️`
  会解析为 heart，而不是复用该字形的某个变体。带有肤色时，它会回退到一个具有肤色的同级条目。
- `extractEmojis(text)`
  会找出文本中的每个目录表情，保持 ZWJ 序列完整，并给出其偏移量和长度。没有
  `Intl.Segmenter`
  时，它会回退到按码点分组的实现，且这两个函数都永远不会 reject。
- `searchEmojis(query, { limit })` 匹配描述，忽略大小写；`limit`
  默认为 20；不是正数的 `limit` 表示不限制，但 `0` 除外，它不返回任何结果。

### Types

根路径导出 `configureEmojis`、`preloadEmojis` 和 `createEmoji`，以及类型
`SkinTone`、`EmojiId`、`DiverseEmojiId`、`EmojiController`、`EmojiOptions` 和
`EmojiFallback`。`Emoji` 组件和 `EmojiProps` 已在 0.7.0 中从根路径移除；请从
`/react` 导入。`/react`、`/vue` 和 `/svelte` 各自导出自己的 `Emoji` 和
`EmojiProps`；`/astro` 有一个默认导出和 `EmojiAstroProps` 类型；`/element` 导出
`FluentEmojiElement` 类型。`EmojiId`
是所有已发布 id 的联合类型，由目录生成；`id` prop 的类型为
`EmojiId | (string & {})`，因此已知的 id 会自动补全，而在你安装的版本之后加入目录的 id 仍然可以通过编译。
