---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

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
