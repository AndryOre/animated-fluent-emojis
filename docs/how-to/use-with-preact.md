# Use with Preact

There are two ways to use emojis in Preact: the `<fluent-emoji>` element, or the
React adapter through `preact/compat`.

## The element

Import the element entry once. It registers `<fluent-emoji>` and needs no
stylesheet:

```tsx
import 'animated-fluent-emojis/element'
```

The package augments the `preact` JSX types with the element's kebab-case
attributes:

```tsx
export function Greeting() {
  return <fluent-emoji id="1f44b_wavinghand" size={64} play-on-hover />
}
```

The JSX types declare attributes only, not `children` or `ref`. A
`<span slot="fallback">` child works at runtime but is rejected by a strict
TypeScript check, as is a `ref` for calling `addEventListener` on `emoji-load`,
`emoji-error` or `playback-end`. Add a local JSX augmentation or suppress those
lines until the types cover them. Attributes, properties and events are listed
in the [usage guide](../usage.md#plain-html).

## The React adapter

Alias `react` and `react-dom` to `preact/compat` in your bundler, then use the
React adapter as documented in the [usage guide](../usage.md#react).
