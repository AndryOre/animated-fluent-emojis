---
title: コードなしで絵文字を使う
sourceHash: 1a25330011d80c02
---

アニメーション付きの Fluent 絵文字を、Slack、Notion、Google
Docs、メール、GitHub の README に入れられます。必要なのはリンクかファイルだけです。ライブラリもインストールも不要です。

すべての絵文字と、すべてのスキントーンは、ファイルサイト上の通常のファイルです。

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

`<slug>` を絵文字の名前に置き換えます。たとえば、これは大きな目で笑う顔です。

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

このようなリンクをブラウザに貼り付けると、絵文字が表示されます。右クリックでファイルを保存できます。

## 名前（スラッグ）を調べる

スラッグは、絵文字の説明を小文字にして、単語の間をダッシュでつないだものです。
`grinning-face-with-big-eyes`、`waving-hand` などです。

スキントーンのある絵文字には、次のいずれかの語尾が付きます。`-light`、`-medium-light`、
`-medium`、`-medium-dark`、`-dark`。たとえば `waving-hand`
はデフォルトの黄色い手、 `waving-hand-medium-dark`
は同じ手を振る絵文字の中濃色版です。

2 つの絵文字が同じ名前になる場合、2 つ目には `-2`（その次は
`-3`）が付きます。スラッグは一度公開されたら変わらないので、リンクは使い続けられます。

すべての名前を見るには、インデックスを開きます。

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## 形式を選ぶ

| 形式 | パス                | 用途                                              |
| ---- | ------------------- | ------------------------------------------------- |
| GIF  | `/gif/<slug>.gif`   | アニメーションするもの全般: Slack、メール、README |
| WebP | `/webp/<slug>.webp` | 滑らかな縁のアニメーション。暗い背景向け          |
| PNG  | `/png/<slug>.png`   | 静止画: Google Docs、スライド                     |

## Slack

1. `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`
   をダウンロードします。
2. Slack で絵文字ピッカーを開き、**絵文字を追加**、続いて
   **画像をアップロード**を選びます。
3. ファイルを選び、名前（たとえば `wave`）を付けて保存します。

メッセージに `:wave:` と入力すると使えます。

## Notion

ページに画像のリンクを貼り付けて **画像として埋め込む**を選ぶか、`/image`
と入力して **リンクを埋め込む**を選び、同じリンクを貼り付けます。

## Google Docs とスライド

Google
Docs とスライドは静止画を表示するので、PNG を使います。**挿入**、**画像**、
**URL 指定**の順に選び、次を貼り付けます。

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## メール

GIF を、ファイルまたはリンクから画像として挿入します。ほとんどのメールアプリは再生します。Outlook のデスクトップ版の一部など、最初のフレームしか表示しないものもあります。

## GitHub の README

Markdown:

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

サイズを指定したい場合は HTML:

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

`alt` テキストは残してください。スクリーンリーダーが読み上げる内容です。

## 暗い背景

GIF の透過は二択です。各ピクセルは完全に透明か完全に不透明のどちらかです。そのため縁が柔らかい部分では、暗い背景に明るい縁取りが出ることがあります。その場合は、縁が滑らかなままの WebP か PNG を使ってください。

## クレジット

絵文字のアートワークは Microsoft のもので、その利用には Microsoft の利用条件が適用されます。このプロジェクトは Microsoft と提携しておらず、Microsoft の承認も受けていません。一部の絵文字は Microsoft の MIT ライセンスのリポジトリに由来します。該当する表示は
`/LICENSE-fluentui-emoji-animated.txt` にあります。帰属表示は `/NOTICE.txt`
にあります。アートワークを自分の作品で使う前に、適用される条件を確認してください。

Web サイトやアプリを作っていますか？ライブラリについては[使い方ガイド](../usage.md)を参照してください。
