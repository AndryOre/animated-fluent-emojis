---
title: 사용 가이드
sourceHash: 1c5618d6e3a40904
---

`animated-fluent-emojis`의 전체 API입니다. 설치와 첫 emoji는
[README](../README.md)에서 시작하세요.

- [Frameworks](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [일반 HTML](#plain-html)
  - [Angular, Solid, Preact](#angular-solid-and-preact)
  - [프레임워크 없이](#without-a-framework)
- [Props](#props)
- [호버와 포커스](#hover-and-focus)
- [동작 줄이기](#reduced-motion)
- [Fallback](#fallback)
- [재생](#playback)
- [이미지와 HD sprite sheet](#images-and-hd-sprite-sheets)
- [프리로드](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Types](#types)

아래 props는 모든 adapter가 공유하며, 각 프레임워크 섹션에서 해당
프레임워크에서의 표기법을 설명합니다. 컴포넌트는 emoji가 처음 렌더링될 때 asset
site에서 작은 manifest를 가져오며, import 시점에는 절대 가져오지 않습니다. 로딩
중에는 `Emoji`가 최종 크기의 비어 있는 `aria-hidden` 플레이스홀더를 렌더링하므로
레이아웃이 밀리지 않습니다. id를 알 수 없으면 사용자의 `fallback` 노드를
렌더링하고, 없으면 아무것도 렌더링하지 않습니다. manifest를 불러올 수 없을 때도
`fallback` 노드나 아무것도 렌더링하지 않으며, 다음 마운트, 다음 `preloadEmojis`
호출 또는 브라우저가 다시 온라인이 될 때 재시도합니다.

## Frameworks

패키지 하나에 프레임워크별 import 경로가 하나씩 있습니다. `configureEmojis`와
`preloadEmojis`는 프레임워크와 무관하며 `animated-fluent-emojis`에 그대로
있습니다. [프리로드](#preloading)와 [Asset site](#asset-site)를 참고하세요. 모든
adapter는 하나의 재생 코어를 공유하고 하나의 conformance suite를 통과하므로
props는 어디서나 똑같이 동작합니다.
[ADR 0014](adr/0014-multi-framework-support.md)를 참고하세요.

React, Vue, Svelte adapter와 `createEmoji`는 키프레임을
`animated-fluent-emojis/style.css`에서 읽으므로 한 번 import해야 합니다.
`<fluent-emoji>`와 Astro 컴포넌트는 자체 스타일을 포함합니다.

### React

React 하위 경로에서 `Emoji`를 import하세요.

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

0.6 이하에서 마이그레이션하는 경우: 루트 `Emoji` export는 0.6에서 더 이상
사용되지 않게(deprecated) 되었고 0.7에서 제거되었습니다. import 경로만 바꾸면
되며, props와 동작은 동일합니다. `EmojiProps` 타입도
`animated-fluent-emojis/react`로 옮겨졌습니다. `configureEmojis`와
`preloadEmojis`는 `animated-fluent-emojis`에 그대로 있습니다. React 18과 19를
지원하며, `react`와 `react-dom`은 선택적 peer입니다.

### Vue

Vue 3.3 이상이 필요합니다. `Emoji`는 아래 props를 camelCase로 받습니다.
`fallback` 슬롯은 이미지를 대체하며, 이벤트는 `load`, `error`,
`playbackEnd`입니다. `class`, `style`, `data-*` 같은 다른 속성은 루트 span에
전달됩니다.

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

서버와 하이드레이션 중에는 최종 크기의 빈 플레이스홀더를 렌더링하므로 Nuxt에서도
동작합니다.

### Svelte

Svelte 5가 필요합니다. `Emoji`는 아래 props를 받으며, `fallback`은 snippet이고
`class`, `style`, `attributes`는 루트 span에 전달됩니다. 콜백은 `onLoad`,
`onError`, `onPlaybackEnd`입니다.

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

서버에서는 플레이스홀더를, 하이드레이션 이후에는 emoji를 렌더링하므로
SvelteKit에서도 동작합니다. 패키지 export에는 컴포넌트 소스를 가리키는 `svelte`
조건이 있습니다.

### Astro

Astro 5 이상이 필요합니다. 컴포넌트는 빌드 시점에 emoji 마크업을 렌더링하므로
스크립트가 실행되기 전에 이미 sprite sheet가 HTML에 들어 있고, 작은 스크립트가
브라우저에서 재생을 시작합니다. 자체 스타일을 포함하므로 import할 스타일시트가
없습니다. id를 알 수 없거나 이미지가 실패하면 `fallback` 이름 있는 슬롯이
렌더링됩니다.

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

props는 아래에 나온 것과 같지만 콜백은 없고, `class`와 문자열 `style`이
추가됩니다. 루트 span은 콜백 대신 `emoji-load`, `emoji-error`, `playback-end`를
버블링되는 DOM 이벤트로 발생시킵니다. 브라우저 스크립트는
`astro:page-load`에서도 다시 실행되므로 뷰 전환(view transitions)도 계속
동작합니다.

### 일반 HTML

`animated-fluent-emojis/element`를 import하면 `<fluent-emoji>`가 등록됩니다.
스타일시트는 필요 없으며, 키프레임은 shadow root 안에 있습니다.

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

속성은 props를 kebab-case로 그대로 반영합니다. `id`, `size`, `play-on-hover`,
`animation-iterations`, `auto-play`, `playing`, `skin-tone`, `alt`입니다.
boolean 속성은 값이 `false`가 아니면 켜진 것입니다. 같은 이름이 요소의 camelCase
프로퍼티로도 있으며(`element.playOnHover = true`), 프로퍼티를 설정해도 속성은
다시 쓰이지 않습니다. `slot="fallback"`이 있는 요소가 fallback입니다. 요소는
`emoji-load`, `emoji-error`, `playback-end`를 버블링되고 composed 되는 이벤트로
발생시킵니다.

요소가 정의되기 전에는 크기가 없습니다. 같은 진입점에서 export되는
`FLUENT_EMOJI_PRE_UPGRADE_CSS`를 페이지 CSS에 추가하면 `size` 속성(픽셀)으로
공간을 확보해 레이아웃 시프트를 피할 수 있습니다.

### Angular, Solid, Preact

이들은 각자의 템플릿 문법으로 `<fluent-emoji>`를 사용합니다.
[Angular](how-to/use-with-angular.md), [Solid](how-to/use-with-solid.md),
[Preact](how-to/use-with-preact.md) how-to 가이드를 참고하세요. Lit, Alpine,
htmx도 마찬가지로 `animated-fluent-emojis/element`를 import하고 태그를 작성하면
됩니다.

### 프레임워크 없이

`createEmoji`는 임의의 DOM 노드에 렌더링하고 컨트롤러를 반환합니다. 모든
adapter의 프레임워크 독립 코어입니다. import해도 DOM을 건드리지 않습니다.

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

옵션은 아래 props에 더해, 루트 span을 위한 `className`, `style`, `attributes`,
`onLoad`, `onError`, `onPlaybackEnd` 콜백, 그리고 노드, 노드를 반환하는 함수
또는 `null`인 `fallback`입니다.

## Props

| Prop                | Type                   | Default     | Description                                                                                      |
| ------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| id                  | `EmojiId` or string    | -           | emoji의 고유 식별자. 알려진 id는 자동 완성됩니다                                                 |
| size                | number or string       | 100         | 픽셀 또는 `2rem`, `var(--size)` 같은 모든 CSS 길이                                               |
| playOnHover         | boolean                | false       | 호버와 키보드 포커스에서 애니메이션을 재생할지 여부                                              |
| animationIterations | number or 'infinite'   | 2           | 로드 시 애니메이션을 재생할 횟수                                                                 |
| autoPlay            | boolean                | true        | 마운트 시 애니메이션을 자동으로 재생할지 여부                                                    |
| playing             | boolean                | -           | 재생을 제어합니다. `true`는 재생, `false`는 일시 정지, 생략하면 기본 동작을 유지합니다           |
| onPlaybackEnd       | function               | -           | `animationIterations`의 유한한 재생이 끝나면 한 번 호출됩니다                                    |
| skinTone            | SkinTone               | 'default'   | 피부색 변형이 있는 emoji의 피부색 (아래 참고)                                                    |
| alt                 | string                 | description | 접근성 텍스트. 기본값은 emoji 설명이며, `""`는 장식용으로 표시합니다                             |
| className           | string                 | -           | 루트 `<span>`의 클래스 이름. 컴포넌트 자체 클래스와 병합됩니다                                   |
| style               | CSSProperties          | -           | 루트 `<span>`의 인라인 스타일. `width`와 `height`는 `size`를 따릅니다                            |
| ref                 | `Ref<HTMLSpanElement>` | -           | 루트 `<span>`으로 전달됩니다. React 18과 19에서 동작합니다                                       |
| fallback            | ReactNode              | glyph       | 이미지나 manifest가 실패하거나 id를 알 수 없을 때 렌더링됩니다. `null`: 아무것도 렌더링하지 않음 |
| onLoad              | function               | -           | sprite sheet가 로드되면 호출됩니다                                                               |
| onError             | function               | -           | 이미지가 실패하면 호출되고, manifest가 실패하면 이벤트 없이 호출됩니다                           |

다른 모든 `<span>` 속성(`data-*`, `aria-*`, `title`, 이벤트 핸들러)은 루트에
전달됩니다. 숫자 `size`는 반올림되며, 유한한 양수가 아닌 값은 100으로
돌아갑니다. 문자열 `size`는 그대로 CSS에 전달되므로 `size="2rem"`이나
`size="var(--emoji-size)"`도 동작합니다. `"48"` 같은 숫자 문자열은 숫자 48로
취급되고, 그 외의 문자열에서는 이미지에 `sizes="auto"`가 설정됩니다. `width`나
`height`가 있는 `style`이 `size`보다 우선합니다.

`skinTone`은 `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'`, `'dark'` 중 하나입니다. `diverse`로 표시된 emoji에만 적용되며,
다른 emoji이거나 알 수 없는 값이면 기본 sheet가 사용됩니다. `DiverseEmojiId`는
피부색이 있는 id를 나열하며, `id`가 그중 하나일 때 `skinTone`은 이에 맞춰 타입이
지정됩니다.

### 호버와 포커스

`playOnHover`를 사용하면 처음 재생이 끝난 뒤 포인터가 emoji에 들어올 때, 그리고
emoji가 키보드 포커스(`:focus-visible`)를 받는 `<button>`이나 `<a>` 안에 있을
때도 애니메이션이 재생됩니다.

### 동작 줄이기

사용자의 시스템이 동작 줄이기(`prefers-reduced-motion: reduce`)를 요청하면
`autoPlay`는 무시되고 emoji는 애니메이션의 첫 프레임인 poster frame에서 멈춰
있습니다. `playOnHover`는 명시적인 사용자 동작이므로 호버와 포커스에서 여전히
재생됩니다.

### Fallback

sprite sheet를 불러오지 못하면 `Emoji`는 fallback glyph를 표시합니다. emoji
고유의 네이티브 Unicode 문자이며 `alt`로 레이블이 지정됩니다. 대신 직접 만든
노드를 렌더링하려면 `fallback`을 전달하고, 아무것도 렌더링하지 않으려면
`fallback={null}`을 전달하세요.

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError`는 이미지가 실패할 때(이벤트와 함께)와 manifest가 실패할 때(이벤트
없이) 실행됩니다. fallback glyph는 manifest가 필요하므로, manifest 자체가
실패했다면 명시적인 `fallback` 노드만 렌더링됩니다. 알 수 없는 id는 `fallback`
노드를 렌더링하거나 아무것도 렌더링하지 않으며, `onError`를 호출하지 않고 개발
모드에서 id당 한 번 경고합니다. manifest 요청은 15초 후 포기하며 다른 실패와
마찬가지로 재시도됩니다.

### 재생

자동 재생은 sprite sheet가 로드되고, emoji가 화면에 보이며, 탭이 보이는 상태가
될 때까지 기다리므로 화면 밖이나 백그라운드의 emoji는 애니메이션되지 않습니다.
숨겨진 탭은 모든 emoji를 일시 정지하고 탭이 돌아오면 재개합니다. `id`를 바꾸면
새 emoji의 첫 재생이 다시 시작됩니다. `animationIterations`가 `0`, 음수 또는
`NaN`이면 자동 재생이 비활성화되고, `Infinity`는 `'infinite'`와 같습니다. 자동
재생이 보류되는 동안 emoji는 poster frame을 표시합니다.

`playing`으로 재생을 직접 제어하세요. `true`는 `animationIterations`만큼
재생하며 `autoPlay`와 동작 줄이기를 무시합니다(이미지, 뷰포트, 보이는 탭은
여전히 기다립니다). `false`는 현재 프레임에서 일시 정지합니다. 끝난 재생은 값을
전환해도 다시 시작되지 않으므로, 다시 재생하려면 새 `key`로 다시 마운트하세요.
`onPlaybackEnd`는 유한한 재생이 끝날 때 한 번 실행되며, `'infinite'`이거나 재생
도중 emoji가 언마운트되면 실행되지 않습니다.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

### 이미지와 HD sprite sheet

sprite sheet는 `loading="lazy"`와 `decoding="async"`로 로드됩니다. HD sprite
sheet(200px 프레임)가 있는 emoji에는 너비 기반 `srcSet`(`100w`와 `200w`)도
추가되며 `sizes`는 렌더링된 크기(문자열 `size`는 `auto`)로 설정되므로,
브라우저는 고밀도 디스플레이에서 `@2x` sheet를 선택합니다.

### 프리로드

`preloadEmojis`는 어떤 `Emoji`가 렌더링되기 전에 manifest 가져오기를 시작하고,
id가 주어지면 준비되는 즉시 해당 sprite sheet를 요청합니다. reject되지 않습니다.

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone`은 피부색이 있는 emoji에서 미리 준비할 변형을 선택합니다.

### Asset site

기본적으로 manifest와 sprite sheet는
`https://animated-fluent-emojis-cdn.andryore.dev`에서 가져옵니다. 이전 주소인
`https://animated-fluent-emojis.pages.dev`도 계속 동작합니다. 자체 사본에서
제공하려면 첫 `Emoji`가 렌더링되기 전에 `configureEmojis`를 한 번 호출하세요.

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup`은 React에 의존하지 않으며 manifest를 `Emoji`와
공유하므로, 함께 추가해도 부담이 적습니다. 모든 함수는 manifest를 로드하며,
로드할 수 없으면 reject하지 않고 `undefined`나 빈 배열로 resolve합니다.

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

- `findEmojiByUnicode(text)`는 emoji 하나를 찾고 단일 피부색 modifier를
  `skinTone`으로 매핑합니다. 서로 다른 피부색이 섞이면 기본 emoji로
  resolve됩니다. `©`나 `™` 같은 기호는 일치하려면 emoji variation
  selector(U+FE0F)가 필요하지만, ZWJ 시퀀스는 variation selector가 없어도
  일치합니다(minimally qualified).
- 여러 catalog 항목이 같은 glyph를 공유하면 lookup은 대표 emoji를 반환합니다.
  glyph의 코드 포인트가 접두사로 붙은 id, 없으면 검토된 override, 그것도 없으면
  catalog 순서의 첫 항목입니다. 예를 들어 `❤️`는 같은 glyph를 재사용하는 변형이
  아니라 하트로 resolve됩니다. 피부색이 있으면 피부색이 있는 형제 항목으로
  돌아갑니다.
- `extractEmojis(text)`는 텍스트에서 catalog의 모든 emoji를 ZWJ 시퀀스를 온전히
  유지한 채 오프셋과 길이와 함께 찾습니다. `Intl.Segmenter`가 없으면 코드 포인트
  그룹화로 대체하며, 두 함수 모두 reject하지 않습니다.
- `searchEmojis(query, { limit })`는 대소문자를 무시하고 설명과 일치시킵니다.
  `limit`의 기본값은 20이며, 양수가 아닌 `limit`은 제한 없음을 의미하지만 `0`은
  아무것도 반환하지 않습니다.

### Types

루트는 `configureEmojis`, `preloadEmojis`, `createEmoji`와 타입 `SkinTone`,
`EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions`,
`EmojiFallback`을 export합니다. `Emoji` 컴포넌트와 `EmojiProps`는 0.7.0에서
루트에서 제거되었으므로 `/react`에서 import하세요. `/react`, `/vue`, `/svelte`는
각자의 `Emoji`와 `EmojiProps`를 export하고, `/astro`는 기본 export와
`EmojiAstroProps` 타입을, `/element`는 `FluentEmojiElement` 타입을 export합니다.
`EmojiId`는 게시된 모든 id의 유니온이며 catalog에서 생성됩니다. `id` prop의
타입은 `EmojiId | (string & {})`이므로 알려진 id는 자동 완성되고, 설치된 버전
이후 catalog에 추가된 id도 계속 컴파일됩니다.
