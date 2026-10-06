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

The package augments the `solid-js` JSX types with the element's kebab-case
attributes. Use `on:` to listen to its events, which Solid attaches to the
element directly:

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
    />
  )
}
```

The JSX types declare attributes only, not `children` or `ref`. A
`<span slot="fallback">` child works at runtime but is rejected by a strict
TypeScript check, so add a local JSX augmentation or suppress that line until
the types cover it.

Attributes, properties and events are listed in the
[usage guide](../usage.md#plain-html).
