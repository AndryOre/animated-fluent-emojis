---
title: Types
sourceHash: fe6ccd1aa3f2d622
---

루트는 `configureEmojis`, `preloadEmojis`, `createEmoji`와 타입 `SkinTone`,
`EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions`,
`EmojiFallback`을 export합니다. `Emoji` 컴포넌트와 `EmojiProps`는 0.7.0에서
루트에서 제거되었으므로 `/react`에서 import하세요. `/react`, `/vue`, `/svelte`는
각자의 `Emoji`와 `EmojiProps`를 export하고, `/astro`는 기본 export와
`EmojiAstroProps` 타입을, `/element`는 `FluentEmojiElement` 타입을 export합니다.
`EmojiId`는 게시된 모든 id의 유니온이며 catalog에서 생성됩니다. `id` prop의
타입은 `EmojiId | (string & {})`이므로 알려진 id는 자동 완성되고, 설치된 버전
이후 catalog에 추가된 id도 계속 컴파일됩니다.
