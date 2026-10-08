---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

| Prop                | Type                   | Default     | Description                                                                      |
| ------------------- | ---------------------- | ----------- | -------------------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | The unique identifier of the emoji; known ids autocomplete                       |
| size                | number or string       | 100         | Pixels, or any CSS length such as `2rem` or `var(--size)`                        |
| playOnHover         | boolean                | false       | Whether to play the animation on hover and on keyboard focus                     |
| animationIterations | number or 'infinite'   | 2           | The number of times to play the animation on load                                |
| autoPlay            | boolean                | true        | Whether to automatically play the animation on mount                             |
| playing             | boolean                | -           | Controls playback; `true` plays, `false` pauses, omitted keeps the default       |
| onPlaybackEnd       | function               | -           | Called once when a finite run of `animationIterations` ends                      |
| skinTone            | SkinTone               | 'default'   | Skin tone for emojis that have variants (see below)                              |
| alt                 | string                 | description | Accessible text; defaults to the emoji description, `""` marks it as decorative  |
| className           | string                 | -           | Class name for the root `<span>`, merged with the component's own                |
| style               | CSSProperties          | -           | Inline style for the root `<span>`; `width` and `height` follow `size`           |
| ref                 | `Ref<HTMLSpanElement>` | -           | Forwarded to the root `<span>`; works on React 18 and 19                         |
| fallback            | ReactNode              | glyph       | Rendered when the image or manifest fails, or the id is unknown; `null`: nothing |
| onLoad              | function               | -           | Called when the sprite sheet loads                                               |
| onError             | function               | -           | Called when the image fails, and with no event when the manifest fails           |

Jedes andere `<span>`-Attribut (`data-*`, `aria-*`, `title`, Event-Handler) wird
an das Root weitergereicht. Eine numerische `size` wird gerundet; alles außer
einer endlichen positiven Zahl fällt auf 100 zurück. Eine `size` als String wird
unverändert an CSS übergeben, sodass `size="2rem"` oder
`size="var(--emoji-size)"` funktionieren. Ein numerischer String wie `"48"` wird
als die Zahl 48 behandelt, und das Bild erhält für andere Strings
`sizes="auto"`; ein `style` mit `width` oder `height` hat Vorrang vor `size`.

`skinTone` ist eines von `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` oder `'dark'`. Es gilt nur für Emojis, die als `diverse`
markiert sind; für jedes andere Emoji oder bei einem unbekannten Wert wird das
Standard-Sheet verwendet. `DiverseEmojiId` listet die IDs auf, die Hauttöne
haben, und `skinTone` wird dagegen typisiert, wenn `id` eine davon ist.
