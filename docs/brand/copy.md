# Copy — Animated Fluent Emojis

Draft v1 (2026-10-05). Status: applied; updated for 0.7. Written with
[`voice.md`](voice.md) (README and npm vocabulary, one light line per surface).
Every claim describes what ships today and is checked against the README, the
changelog and `package.json` (see "Claims checked" below). This file covers the
README, npm and GitHub copy; the website's copy lives in `apps/site`.

## Tagline

**Fluent emojis, but they move.**

Plain, a little funny, and it carries the searchable phrase. It names no
framework, as `naming.md` decided. The README says which frameworks are
supported.

## README intro

Replaces the current intro paragraph and the "Exclusive Feature" callout. The
three animated emojis already under the intro stay.

> **Fluent emojis, but they move.**
>
> Drop Microsoft's animated Fluent emojis into a React, Vue, Svelte or Astro
> app, or any page through the `<fluent-emoji>` element: one import, one tag.
> They play on load or on hover, rest on a still frame when someone asks for
> less motion, and hold their space in the layout while they load.
>
> ```jsx
> <Emoji id="1f44b_wavinghand" />
> ```
>
> The artwork belongs to Microsoft. The code is MIT. This project is not
> affiliated with or endorsed by Microsoft. See "Assets and licensing" (a link
> to that README section).

## README features

Replaces the eight bullets under "Features". The headings lose their decorative
emoji (the section headings follow in the apply stage).

- **One component.** `<Emoji id="…" />`, with `size`, `skinTone` and the other
  props, in each supported framework.
- **Plays when you want.** On load, on hover or focus, or driven by `playing`.
- **Rests when asked.** Under reduced motion it stays on its poster frame.
- **Holds its space.** An empty placeholder of the final size keeps the layout
  steady while it loads. The manifest is fetched on first render, never at
  import.
- **Sharp on HD screens.** Emojis with an HD sprite sheet are served at 2x to
  high-density displays.
- **Described by default.** `alt` comes from the emoji's description, and
  `alt=""` marks it decorative.
- **Fails softly.** A sprite sheet that does not load shows the emoji's native
  character, or your own `fallback`.
- **Findable.** `animated-fluent-emojis/lookup` turns a character or a
  description into an id, with no framework.
- **Typed.** TypeScript types, with autocomplete for emoji ids.

## package.json

**description** (144 characters):

> Microsoft's animated Fluent emojis as one component. They play on load or
> hover, rest under reduced motion and hold their space while they load.

The frameworks appear in `peerDependencies`, in the keywords and in the README,
so the description can stay free of a framework name.

**keywords:**

```json
[
  "react",
  "react-component",
  "vue",
  "vue-component",
  "svelte",
  "svelte-component",
  "astro-component",
  "web-component",
  "custom-element",
  "angular",
  "solid",
  "preact",
  "emoji",
  "emojis",
  "animated",
  "animated-emoji",
  "animated-emojis",
  "fluent",
  "fluent-emoji",
  "fluent-emojis",
  "microsoft",
  "animation",
  "emoticons",
  "typescript"
]
```

Dropped from the current list: `icons`, `ui` and `emoji-library`. They describe
a different kind of package and compete with the phrases people search.

## GitHub

**About** (121 characters):

> Fluent emojis, but they move: Microsoft's animated emojis as one component.
> Not affiliated with or endorsed by Microsoft.

**Topics:** `react`, `emoji`, `emojis`, `animated-emojis`, `fluent-emoji`,
`fluent-emojis`, `animation`, `typescript`. Applied by hand in the repository
settings.

## Changelog entry (draft)

For `[Unreleased]`, in the project's candid style:

> ### Changed
>
> - The package description, keywords and README intro describe what the
>   component does today. The "Exclusive Feature" callout is removed.

## Brand choices applied

- **Playful, once:** the tagline is the single joke on each surface. The
  description, features and notice are plain.
- **Precise:** each benefit names its mechanism (placeholder of the final size,
  poster frame, lazy manifest) in place of "lightweight" or "optimized".
- **Honest about scope and license:** the notice says whose artwork it is and
  that there is no affiliation. "Exclusive", "first time" and "official" are
  gone.
- **Plain-spoken:** code first, no "just" or "simply".
- **Considerate:** reduced motion, `alt` text and the fallback are described as
  behavior, with no "accessible" or "a11y" claim.
- **Terminology:** README vocabulary from the glossary (sprite sheet, poster
  frame, manifest, fallback), as `voice.md` sets for README and npm.

## Claims checked

| Claim                                                 | Source                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Plays on load or on hover                             | `README.md` props `autoPlay`, `playOnHover`; Playback                          |
| Rests on a poster frame under reduced motion          | `docs/guide/behavior.md` "Reduced motion"                                      |
| Holds its space while it loads                        | `README.md` intro to the manifest: empty `aria-hidden` placeholder of the size |
| The manifest is fetched on first render               | `README.md`: "never at import time"                                            |
| HD sprite sheets at 2x on high-density screens        | `docs/guide/assets.md` "Images and HD sprite sheets"                           |
| `alt` defaults to the description; `""` is decorative | `README.md` props table, `alt`                                                 |
| Fallback glyph or custom `fallback`                   | `docs/guide/behavior.md` "Fallback"                                            |
| Lookup has no framework                               | `docs/guide/lookup.md` "Lookup"                                                |
| Five adapters, TypeScript, id autocomplete            | `package.json` `exports`; `README.md` props, `id`                              |
| The code is MIT; the artwork is Microsoft's           | `README.md` "License" and "Assets and licensing"                               |

## Brand review (2026-10-05)

Reviewed against `voice.md` and `brief.md` with `marketing:brand-review`. No
high-severity findings and no never-use terms ("exclusive", "official",
"supercharge", "seamless" and the rest) in any block.

| Issue                                                                                           | Severity | Fix applied                                                                                   |
| ----------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| The intro repeated "animated Fluent emojis" in one sentence                                     | Medium   | Rewritten as "Drop Microsoft's animated Fluent emojis into a React app: one import, one tag." |
| The About text said "Fluent emojis" three times and used a shorter notice than the README       | Medium   | Rewritten, and the notice now matches: "Not affiliated with or endorsed by Microsoft."        |
| The "Typed" bullet attached the React versions to TypeScript, and the intro already states them | Low      | Removed from the bullet                                                                       |

Legal and compliance flags:

- **Affiliation:** every surface that names Microsoft carries a non-affiliation
  line, except the npm description, which is one sentence. The npm page shows
  the README, whose intro carries the notice, so this is left as is.
- **"Fluent":** used descriptively, as `naming.md` records. No Microsoft logos.
- **Comparative claims:** none. Competitors are not named in any block.
- **Unsubstantiated claims:** none. Each benefit is in the table above.

## Open items

- The apply stage changes the README's section headings (decorative emoji out),
  so its table-of-contents anchors change with them.
- A catalog size is deliberately absent. It goes in only after it is read from
  the live manifest.
