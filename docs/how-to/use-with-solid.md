# Use with Solid

Render emojis in Solid through the `<fluent-emoji>` element. There is no native
Solid adapter.

## Register the element

Import the element entry once, for example in your entry module. It registers
`<fluent-emoji>` and needs no stylesheet:

```tsx
import 'animated-fluent-emojis/element'
```

## Use the tag

The package augments the `solid-js` JSX types, so `<fluent-emoji>` is typed with
its kebab-case attributes. Use `on:` to listen to its events, which Solid
attaches to the element directly:

```tsx
export function Greeting() {
  return (
    <fluent-emoji
      id="1f44b_wavinghand"
      size={64}
      play-on-hover
      on:playback-end={() => {
        console.log('done')
      }}
    >
      <span slot="fallback">👋</span>
    </fluent-emoji>
  )
}
```

Attributes, properties and events are listed in the
[usage guide](../usage.md#plain-html).
