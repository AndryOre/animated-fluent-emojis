---
title: 코드 없이 emoji 사용하기
sourceHash: 040399c5bc04b224
---

Slack, Notion, Google Docs, 이메일, GitHub README에 움직이는 Fluent emoji를 넣어
보세요. 링크나 파일만 있으면 됩니다. 라이브러리도, 설치도 필요 없습니다.

모든 emoji와 모든 스킨 톤은 files site의 일반 파일입니다.

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

`<slug>`를 emoji의 이름으로 바꾸세요. 예를 들어 다음은 큰 눈으로 웃는
얼굴입니다.

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

이런 링크를 브라우저에 붙여 넣으면 emoji가 나타납니다. 마우스 오른쪽 버튼으로
클릭해 파일을 저장하세요.

## 이름(slug) 찾기

slug는 emoji의 설명을 소문자로 쓰고 단어 사이를 대시로 이은 것입니다.
`grinning-face-with-big-eyes`, `waving-hand` 같은 형태입니다.

스킨 톤이 있는 emoji에는 다음 접미사 중 하나가 붙습니다. `-light`,
`-medium-light`, `-medium`, `-medium-dark`, `-dark`. 따라서 `waving-hand`는 기본
노란색 손이고, `waving-hand-medium-dark`는 같은 손 흔들기를 중간 어두운 톤으로
표현한 것입니다.

두 emoji의 이름이 겹치게 되면 두 번째 emoji에는 `-2`가 붙고, 그다음에는 `-3`이
붙습니다. slug는 한 번 게시되면 바뀌지 않으므로 링크가 계속 동작합니다.

모든 이름을 둘러보려면 index를 여세요.

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## 형식 고르기

| 형식 | 경로                | 용도                                           |
| ---- | ------------------- | ---------------------------------------------- |
| GIF  | `/gif/<slug>.gif`   | 움직이는 모든 곳: Slack, 이메일, README        |
| WebP | `/webp/<slug>.webp` | 어두운 배경에서 가장자리가 부드러운 애니메이션 |
| PNG  | `/png/<slug>.png`   | 정지 이미지: Google Docs, Slides               |

## Slack

1. `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`를
   다운로드합니다.
2. Slack에서 emoji 피커를 열고 **Add Emoji**, **Upload Image**를 차례로
   선택합니다.
3. 파일을 고르고 이름을 지정한 뒤(예: `wave`) 저장합니다.

아무 메시지에서나 `:wave:`를 입력하면 사용할 수 있습니다.

## Notion

페이지에 이미지 링크를 붙여 넣고 **Embed as image**를 선택하거나, `/image`를
입력한 뒤 **Embed link**를 선택하고 같은 링크를 붙여 넣으세요.

## Google Docs와 Slides

Google Docs와 Slides는 정지 이미지를 보여 주므로 PNG를 사용하세요. **Insert**,
**Image**, **By URL**을 차례로 선택하고 다음을 붙여 넣습니다.

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## 이메일

GIF를 파일로 또는 링크로 이미지로 삽입하세요. 대부분의 이메일 앱은 재생합니다.
일부 데스크톱 버전 Outlook처럼 첫 프레임만 보여 주는 앱도 있습니다.

## GitHub README

Markdown:

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

크기를 지정하고 싶다면 HTML:

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

`alt` 텍스트는 유지하세요. 스크린 리더가 읽어 주는 내용입니다.

## 어두운 배경

GIF의 투명도는 전부 아니면 전무입니다. 각 픽셀이 완전히 투명하거나 완전히
불투명합니다. 그래서 부드러운 가장자리는 어두운 배경에서 밝은 테두리가 보일 수
있습니다. 그런 경우에는 가장자리가 부드럽게 유지되는 WebP나 PNG를 사용하세요.

## 크레딧

emoji 아트워크는 Microsoft의 것이며, 사용에는 Microsoft의 약관이 적용됩니다. 이
프로젝트는 Microsoft와 제휴하거나 Microsoft의 보증을 받지 않았습니다. 일부
emoji는 Microsoft의 MIT 라이선스 저장소에서 가져왔으며, 해당 emoji에 적용되는
고지는 `/LICENSE-fluentui-emoji-animated.txt`에 있습니다. 출처 표기는
`/NOTICE.txt`에 있습니다. 아트워크를 자신의 작업에 사용하기 전에 적용되는 약관을
확인하세요.

웹사이트나 앱을 만들고 있나요? 라이브러리는 [사용 가이드](../usage.md)에서
다룹니다.
