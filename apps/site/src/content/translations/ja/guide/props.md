---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

| Prop                | Type                   | Default     | Description                                                                                                       |
| ------------------- | ---------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | 絵文字の一意の識別子。既知の id はオートコンプリートされます                                                      |
| size                | number or string       | 100         | ピクセル、または `2rem` や `var(--size)` などの任意の CSS 長さ                                                    |
| playOnHover         | boolean                | false       | ホバー時およびキーボードフォーカス時にアニメーションを再生するかどうか                                            |
| animationIterations | number or 'infinite'   | 2           | 読み込み時にアニメーションを再生する回数                                                                          |
| autoPlay            | boolean                | true        | マウント時にアニメーションを自動再生するかどうか                                                                  |
| playing             | boolean                | -           | 再生を制御します。`true` で再生、`false` で一時停止、省略するとデフォルトのままです                               |
| onPlaybackEnd       | function               | -           | `animationIterations` による有限回の再生が終わったときに一度だけ呼ばれます                                        |
| skinTone            | SkinTone               | 'default'   | バリエーションを持つ絵文字のスキントーン（後述）                                                                  |
| alt                 | string                 | description | アクセシブルなテキスト。デフォルトは絵文字の説明で、`""` は装飾用であることを示します                             |
| className           | string                 | -           | ルートの `<span>` のクラス名。コンポーネント自身のクラス名とマージされます                                        |
| style               | CSSProperties          | -           | ルートの `<span>` のインラインスタイル。`width` と `height` は `size` に従います                                  |
| ref                 | `Ref<HTMLSpanElement>` | -           | ルートの `<span>` に転送されます。React 18 と 19 で動作します                                                     |
| fallback            | ReactNode              | glyph       | 画像や manifest の読み込みに失敗した場合、または id が不明な場合にレンダリングされます。`null` は何も表示しません |
| onLoad              | function               | -           | sprite sheet が読み込まれたときに呼ばれます                                                                       |
| onError             | function               | -           | 画像の読み込みに失敗したときに呼ばれ、manifest が失敗した場合はイベントなしで呼ばれます                           |

その他の `<span>`
属性（`data-*`、`aria-*`、`title`、イベントハンドラー）は、ルートに渡されます。数値の
`size` は丸められ、有限の正の数以外は 100 にフォールバックします。文字列の
`size` はそのまま CSS に渡されるので、`size="2rem"` や
`size="var(--emoji-size)"` が使えます。`"48"`
のような数字の文字列は数値の 48 として扱われ、それ以外の文字列では画像に
`sizes="auto"` が付きます。`width` または `height` を含む `style` は `size`
より優先されます。

`skinTone` は
`'default'`、`'light'`、`'medium-light'`、`'medium'`、`'medium-dark'`、`'dark'`
のいずれかです。`diverse`
とマークされた絵文字にのみ適用され、それ以外の絵文字や不明な値の場合は、デフォルトのシートが使われます。`DiverseEmojiId`
はスキントーンを持つ id の一覧で、`id` がそのいずれかである場合、`skinTone`
はそれに対して型付けされます。
