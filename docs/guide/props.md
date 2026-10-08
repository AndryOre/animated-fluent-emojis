# Props

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

Any other `<span>` attribute (`data-*`, `aria-*`, `title`, event handlers) is
passed to the root. A numeric `size` is rounded; anything but a finite positive
number falls back to 100. A string `size` is passed to CSS as-is, so
`size="2rem"` or `size="var(--emoji-size)"` work. A numeric string such as
`"48"` is treated as the number 48, and the image gets `sizes="auto"` for other
strings; a `style` with `width` or `height` wins over `size`.

`skinTone` is one of `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` or `'dark'`. It only applies to emojis marked `diverse`; for any
other emoji, or an unknown value, the default sheet is used. `DiverseEmojiId`
lists the ids that have skin tones, and `skinTone` is typed against it when `id`
is one of them.
