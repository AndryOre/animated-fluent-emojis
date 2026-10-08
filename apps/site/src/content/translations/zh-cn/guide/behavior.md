---
title: 行为
sourceHash: 1c585e5ee4f3bb6f
---

<a id="hover-and-focus"></a>

## 悬停与焦点

启用 `playOnHover`
后，在初次播放之后，当指针进入表情时会播放动画；当表情位于接收键盘焦点（`:focus-visible`）的
`<button>` 或 `<a>` 内时，同样会播放。

<a id="reduced-motion"></a>

## 减少动态效果

当用户的系统要求减少动态效果（`prefers-reduced-motion: reduce`）时，`autoPlay`
会被忽略，表情停留在其海报帧，即动画的第一帧。`playOnHover`
仍然会在悬停和聚焦时播放，因为这是用户的明确操作。

## Fallback

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

<a id="playback"></a>

## 播放

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
