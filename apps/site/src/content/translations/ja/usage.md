---
title: 使い方ガイド
sourceHash: 1c5618d6e3a40904
---

`animated-fluent-emojis`
の API をすべて紹介します。インストール方法と最初の絵文字については、先に
[README](../README.md) をご覧ください。

- [フレームワーク](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [プレーン HTML](#plain-html)
  - [Angular、Solid、Preact](#angular-solid-and-preact)
  - [フレームワークなし](#without-a-framework)
- [Props](#props)
- [ホバーとフォーカス](#hover-and-focus)
- [モーションの軽減](#reduced-motion)
- [Fallback](#fallback)
- [再生](#playback)
- [画像と HD sprite sheet](#images-and-hd-sprite-sheets)
- [プリロード](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Types](#types)

以下の props はすべてのアダプターで共通です。各フレームワークのセクションでは、そこで prop をどう書くかを説明します。コンポーネントは、絵文字が最初にレンダリングされるときに、asset
site から小さな manifest を取得します。インポート時に取得することはありません。読み込み中、`Emoji`
は最終的なサイズの空の `aria-hidden`
プレースホルダーをレンダリングするため、レイアウトはずれません。id が不明な場合は、`fallback`
ノードをレンダリングします。`fallback`
がなければ何もレンダリングしません。manifest を読み込めない場合も、`fallback`
ノードをレンダリングします（なければ何もレンダリングしません）。そして、次のマウント時、次の
`preloadEmojis`
呼び出し時、またはブラウザーがオンラインに戻ったときに再試行します。

## Frameworks

パッケージは 1 つで、フレームワークごとにインポートパスが 1 つあります。`configureEmojis`
と `preloadEmojis` はフレームワークに依存せず、`animated-fluent-emojis`
に置かれています。[Preloading](#preloading) と [Asset site](#asset-site)
を参照してください。すべてのアダプターは 1 つの再生コアを共有し、1 つの適合性スイートに合格しているため、props はどこでも同じように動作します。[ADR 0014](adr/0014-multi-framework-support.md)
を参照してください。

React、Vue、Svelte のアダプターと `createEmoji` は、キーフレームを
`animated-fluent-emojis/style.css`
から読み込みます。一度だけインポートしてください。`<fluent-emoji>`
と Astro コンポーネントは、独自のスタイルを内包しています。

### React

React のサブパスから `Emoji` をインポートします。

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

0.6 以前からの移行：ルートの `Emoji`
エクスポートは 0.6 で非推奨となり、0.7 で削除されました。インポートパスを変更するだけで、ほかに変更は不要です。props と動作は同一です。`EmojiProps`
型も `animated-fluent-emojis/react` に移動しました。`configureEmojis` と
`preloadEmojis` は `animated-fluent-emojis` に残っています。React
18 と 19 に対応しており、`react` と `react-dom` はオプションの peer です。

### Vue

Vue 3.3 以降が必要です。`Emoji`
は、以下の props を camelCase で受け取ります。`fallback`
スロットは画像を置き換え、イベントは `load`、`error`、`playbackEnd`
です。`class`、`style`、`data-*`
などのその他の属性は、ルートの span に渡されます。

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

サーバー上とハイドレーション中は、最終的なサイズの空のプレースホルダーをレンダリングするため、Nuxt でも動作します。

### Svelte

Svelte 5 が必要です。`Emoji` は以下の props を受け取ります。`fallback`
は snippet で、`class`、`style`、`attributes`
はルートの span に渡されます。コールバックは
`onLoad`、`onError`、`onPlaybackEnd` です。

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

サーバーではプレースホルダーを、ハイドレーション後には絵文字をレンダリングするため、SvelteKit でも動作します。パッケージのエクスポートには、コンポーネントのソースを指す
`svelte` condition があります。

### Astro

Astro
5 以降が必要です。コンポーネントはビルド時に絵文字のマークアップをレンダリングするため、スクリプトが実行される前から sprite が HTML に含まれます。そして、小さなスクリプトがブラウザーで再生を開始します。独自のスタイルを内包しているので、インポートするスタイルシートはありません。`fallback`
という名前付きスロットは、id が不明な場合や画像の読み込みに失敗した場合にレンダリングされます。

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

props は以下のものからコールバックを除いたもので、`class` と文字列の `style`
があります。ルートの span は、コールバックの代わりに
`emoji-load`、`emoji-error`、`playback-end`
を、バブリングする DOM イベントとしてディスパッチします。ブラウザースクリプトは
`astro:page-load`
でも再実行されるため、ビュートランジションも引き続き動作します。

### Plain HTML

`animated-fluent-emojis/element` をインポートすると、`<fluent-emoji>`
が登録されます。スタイルシートは不要で、キーフレームはシャドウルートの中にあります。

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

属性は props をケバブケースで反映したものです。`id`、`size`、`play-on-hover`、`animation-iterations`、`auto-play`、`playing`、`skin-tone`、`alt`
があります。真偽値の属性は、値が `false`
でない限りオンです。同じ名前が、要素の camelCase プロパティとしても存在します（`element.playOnHover = true`）。プロパティを設定しても、属性は書き換えられません。`slot="fallback"`
を持つ要素が fallback になります。要素は
`emoji-load`、`emoji-error`、`playback-end`
を、バブリングし composed なイベントとしてディスパッチします。

要素が定義されるまでは、サイズがありません。同じエントリーからエクスポートされている
`FLUENT_EMOJI_PRE_UPGRADE_CSS` をページの CSS に追加すると、`size`
属性（ピクセル単位）から占有領域を確保でき、レイアウトシフトを防げます。

### Angular, Solid and Preact

これらは、それぞれのテンプレート構文を通じて `<fluent-emoji>`
を使います。[Angular](how-to/use-with-angular.md)、[Solid](how-to/use-with-solid.md)、[Preact](how-to/use-with-preact.md)
のハウツーガイドを参照してください。Lit、Alpine、htmx も同様で、`animated-fluent-emojis/element`
をインポートしてタグを書きます。

### Without a framework

`createEmoji`
は任意の DOM ノードにレンダリングし、コントローラーを返します。これはすべてのアダプターに共通する、フレームワーク非依存のコアです。インポートしても DOM には一切触れません。

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

オプションは以下の props に加えて、ルートの span 用の
`className`、`style`、`attributes`、`onLoad`、`onError`、`onPlaybackEnd`
のコールバック、そしてノード、ノードを返す関数、または `null` のいずれかを取る
`fallback` です。

## Props

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

### Hover and focus

`playOnHover`
を指定すると、最初の再生のあとで、ポインターが絵文字に入ったときに加えて、絵文字が
`<button>` または `<a>`
の中にあり、それがキーボードフォーカス（`:focus-visible`）を受け取ったときにも、アニメーションが再生されます。

### Reduced motion

ユーザーのシステムがモーションの軽減（`prefers-reduced-motion: reduce`）を求めている場合、`autoPlay`
は無視され、絵文字はポスターフレーム、つまりアニメーションの最初のフレームで静止します。`playOnHover`
は、ユーザーが明示的に行う操作であるため、ホバー時とフォーカス時には引き続き再生されます。

### Fallback

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

### Playback

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

### Images and HD sprite sheets

sprite sheet は `loading="lazy"` と `decoding="async"` で読み込まれます。HD
sprite sheet（200px フレーム）を持つ絵文字には、幅ベースの `srcSet`（`100w` と
`200w`）も付き、`sizes` にはレンダリングされるサイズが設定されます（文字列の
`size` の場合は `auto`）。これにより、高密度ディスプレイではブラウザーが `@2x`
のシートを選びます。

### Preloading

`preloadEmojis` は、どの `Emoji`
がレンダリングされるよりも前に manifest の取得を開始し、id が渡された場合は、準備ができた時点でそれらの sprite
sheet をリクエストします。reject されることはありません。

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone`
は、スキントーンを持つ絵文字について、ウォームアップするバリエーションを選びます。

### Asset site

デフォルトでは、manifest と sprite sheet は
`https://animated-fluent-emojis-cdn.andryore.dev`
から取得されます。以前のアドレスである
`https://animated-fluent-emojis.pages.dev`
も引き続き使えます。独自のコピーから配信するには、最初の `Emoji`
がレンダリングされる前に、`configureEmojis` を一度だけ呼び出します。

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` は React に依存せず、`Emoji`
と manifest を共有するため、`Emoji`
と併せて追加しても軽量です。すべての関数は manifest を読み込み、読み込めない場合は
`undefined` または空の配列で解決され、reject されることはありません。

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

- `findEmojiByUnicode(text)` は 1 つの絵文字を解決し、単一のスキントーン修飾子を
  `skinTone`
  にマッピングします。異なるトーンが混在する場合は、基本の絵文字に解決されます。`©`
  や `™`
  などの記号は、一致させるために絵文字バリエーションセレクター（U+FE0F）が必要ですが、ZWJ シーケンスは、バリエーションセレクターがなくても一致します（minimally
  qualified）。
- 複数のカタログエントリーが同じグリフを共有している場合、lookup は正規の絵文字を返します。つまり、グリフのコードポイントを接頭辞とする id、それがなければレビュー済みのオーバーライド、それもなければカタログ順で最初のエントリーです。たとえば
  `❤️`
  は、そのグリフを再利用しているバリアントではなく、ハートに解決されます。スキントーンを指定した場合は、トーンを持つ兄弟エントリーにフォールバックします。
- `extractEmojis(text)`
  は、テキスト内のカタログにあるすべての絵文字を、ZWJ シーケンスを分割せずに、オフセットと長さとともに見つけます。`Intl.Segmenter`
  がない場合は、コードポイントのグルーパーにフォールバックし、どちらの関数も reject されることはありません。
- `searchEmojis(query, { limit })`
  は、大文字と小文字を区別せずに説明文に一致させます。`limit`
  のデフォルトは 20 で、正の数でない `limit` は無制限を意味しますが、`0`
  だけは何も返しません。

### Types

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
