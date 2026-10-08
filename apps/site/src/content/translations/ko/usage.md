---
title: 개요
sourceHash: 4101ae648cca44fe
---

`animated-fluent-emojis`의 전체 API를 페이지당 하나의 주제로 나누어 설명합니다.
설치와 첫 emoji는 [README](../README.md)에서 시작하세요.

[props](guide/props.md)는 모든 adapter가 공유하며, 각
[프레임워크](guide/frameworks.md) 섹션에서 해당 프레임워크에서의 표기법을
설명합니다. 컴포넌트는 emoji가 처음 렌더링될 때 asset site에서 작은 manifest를
가져오며, import 시점에는 절대 가져오지 않습니다. 로딩 중에는 `Emoji`가 최종
크기의 비어 있는 `aria-hidden` 플레이스홀더를 렌더링하므로 레이아웃이 밀리지
않습니다. id를 알 수 없으면 사용자의 `fallback` 노드를 렌더링하고, 없으면
아무것도 렌더링하지 않습니다. manifest를 불러올 수 없을 때도 `fallback` 노드나
아무것도 렌더링하지 않으며, 다음 마운트, 다음 `preloadEmojis` 호출 또는
브라우저가 다시 온라인이 될 때 재시도합니다.

## 설치

```sh
bun add animated-fluent-emojis
```

## 가이드

- [Frameworks](guide/frameworks.md): React, Vue, Svelte, Astro, 일반 HTML,
  `createEmoji`.
- [Props](guide/props.md): 모든 prop과 타입, 기본값.
- [동작](guide/behavior.md): 호버와 포커스, 동작 줄이기, fallback, 재생.
- [Assets](guide/assets.md): 이미지와 HD sprite sheet, 프리로드, asset site.
- [Lookup](guide/lookup.md): 글리프, 텍스트, 설명으로 emoji 찾기.
- [Types](guide/types.md): 내보내는 타입.
