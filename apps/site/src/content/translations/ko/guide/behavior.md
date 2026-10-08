---
title: 동작
sourceHash: 1c585e5ee4f3bb6f
---

## 호버와 포커스

`playOnHover`를 사용하면 처음 재생이 끝난 뒤 포인터가 emoji에 들어올 때, 그리고
emoji가 키보드 포커스(`:focus-visible`)를 받는 `<button>`이나 `<a>` 안에 있을
때도 애니메이션이 재생됩니다.

## 동작 줄이기

사용자의 시스템이 동작 줄이기(`prefers-reduced-motion: reduce`)를 요청하면
`autoPlay`는 무시되고 emoji는 애니메이션의 첫 프레임인 poster frame에서 멈춰
있습니다. `playOnHover`는 명시적인 사용자 동작이므로 호버와 포커스에서 여전히
재생됩니다.

## Fallback

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

## 재생

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
