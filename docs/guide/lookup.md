# Lookup

`animated-fluent-emojis/lookup` has no React and shares the manifest with
`Emoji`, so it is cheap to add next to it. Every function loads the manifest and
resolves to `undefined` or an empty array, never rejects, when it cannot:

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

- `findEmojiByUnicode(text)` resolves one emoji and maps a single skin tone
  modifier to `skinTone`; mixed tones resolve to the base emoji. Symbols such as
  `©` or `™` need the emoji variation selector (U+FE0F) to match, while ZWJ
  sequences match even when the variation selector is missing (minimally
  qualified).
- When several catalog entries share a glyph, lookup returns the canonical
  emoji: the id prefixed with the glyph's code points, otherwise a reviewed
  override, otherwise the first entry in catalog order. For example, `❤️`
  resolves to the heart rather than a variant that reuses the glyph. With a skin
  tone, it falls back to a sibling entry that has tones.
- `extractEmojis(text)` finds every catalog emoji in a text, keeping ZWJ
  sequences whole, with its offset and length. Without `Intl.Segmenter` it falls
  back to a code point grouper, and neither function ever rejects.
- `searchEmojis(query, { limit })` matches descriptions, ignoring case; `limit`
  defaults to 20; a `limit` that is not a positive number means no limit, except
  `0`, which returns nothing.
