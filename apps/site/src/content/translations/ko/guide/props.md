---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

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
