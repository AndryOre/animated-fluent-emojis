---
title: 動作
sourceHash: 1c585e5ee4f3bb6f
---

## Hover and focus

`playOnHover`
を指定すると、最初の再生のあとで、ポインターが絵文字に入ったときに加えて、絵文字が
`<button>` または `<a>`
の中にあり、それがキーボードフォーカス（`:focus-visible`）を受け取ったときにも、アニメーションが再生されます。

## Reduced motion

ユーザーのシステムがモーションの軽減（`prefers-reduced-motion: reduce`）を求めている場合、`autoPlay`
は無視され、絵文字はポスターフレーム、つまりアニメーションの最初のフレームで静止します。`playOnHover`
は、ユーザーが明示的に行う操作であるため、ホバー時とフォーカス時には引き続き再生されます。

## Fallback

sprite sheet の読み込みに失敗すると、`Emoji`
は fallback グリフを表示します。これは絵文字本来の Unicode 文字で、`alt`
のラベルが付きます。代わりに独自のノードをレンダリングするには `fallback`
を渡し、何もレンダリングしないようにするには `fallback={null}` を渡します。

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError`
は、画像が失敗したとき（イベント付き）と、manifest が失敗したとき（イベントなし）に実行されます。fallback グリフには manifest が必要なため、manifest 自体が失敗した場合は、明示的な
`fallback` ノードだけがレンダリングされます。不明な id は `fallback`
ノードをレンダリングし、なければ何もレンダリングしません。`onError`
は呼ばれず、開発時には id ごとに一度だけ警告が出ます。manifest のリクエストは 15 秒であきらめ、ほかの失敗と同様に再試行されます。

## Playback

自動再生は、sprite
sheet が読み込まれ、絵文字が画面内にあり、タブが表示されるまで待機します。そのため、画面外やバックグラウンドの絵文字はアニメーションしません。非表示のタブではすべての絵文字が一時停止し、タブが戻ると再開します。`id`
を変更すると、新しい絵文字の最初の再生が改めて始まります。`animationIterations`
が `0`、負の数、または `NaN` の場合は自動再生が無効になります。`Infinity` は
`'infinite'`
と同じです。自動再生が保留されている間、絵文字はポスターフレームを表示します。

再生を自分で制御するには `playing` を使います。`true` は `animationIterations`
回の再生を行い、`autoPlay`
とモーションの軽減を上書きします（ただし、画像、ビューポート、表示中のタブは引き続き待ちます）。`false`
は現在のフレームで一時停止します。終了した再生は、切り替えても再開されないため、再生し直すには新しい
`key` で再マウントしてください。`onPlaybackEnd`
は有限回の再生が終わったときに一度だけ実行されます。`'infinite'`
の場合や、再生の途中で絵文字がアンマウントされた場合は、実行されません。

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```
