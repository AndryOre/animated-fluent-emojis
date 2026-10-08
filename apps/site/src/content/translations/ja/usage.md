---
title: 概要
sourceHash: 4101ae648cca44fe
---

`animated-fluent-emojis`
の API をすべて、1 ページ 1 トピックで紹介します。インストール方法と最初の絵文字については、先に
[README](../README.md) をご覧ください。

[props](guide/props.md)
はすべてのアダプターで共通です。各[フレームワーク](guide/frameworks.md)のセクションでは、そこで prop をどう書くかを説明します。コンポーネントは、絵文字が最初にレンダリングされるときに、asset
site から小さな manifest を取得します。インポート時に取得することはありません。読み込み中、`Emoji`
は最終的なサイズの空の `aria-hidden`
プレースホルダーをレンダリングするため、レイアウトはずれません。id が不明な場合は、`fallback`
ノードをレンダリングします。`fallback`
がなければ何もレンダリングしません。manifest を読み込めない場合も、`fallback`
ノードをレンダリングします（なければ何もレンダリングしません）。そして、次のマウント時、次の
`preloadEmojis`
呼び出し時、またはブラウザーがオンラインに戻ったときに再試行します。

## インストール

```sh
bun add animated-fluent-emojis
```

## ガイド

- [Frameworks](guide/frameworks.md):
  React、Vue、Svelte、Astro、プレーン HTML、`createEmoji`。
- [Props](guide/props.md): すべての prop と、その型・デフォルト値。
- [動作](guide/behavior.md): ホバーとフォーカス、モーションの軽減、フォールバック、再生。
- [アセット](guide/assets.md): 画像と HD sprite sheet、プリロード、asset site。
- [Lookup](guide/lookup.md): グリフ、テキスト、説明から絵文字を検索。
- [Types](guide/types.md): エクスポートされる型。
