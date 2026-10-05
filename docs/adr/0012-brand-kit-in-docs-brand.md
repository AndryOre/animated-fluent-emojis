# 0012: Brand kit lives in docs/brand

## Status

Accepted

Date: 2026-10-05

## Context

The project had no identity beyond its name: the README led with a feature pitch
and the cover was a screenshot. A brand kit was produced (brief, naming study,
voice, copy, logo, tokens and an HTML brand book) and needs a home, a naming
decision and a few rules that touch existing policy. The ROADMAP rules out
custom artwork, the README and npm page render with the platform's own fonts,
and the repository has about 280 downloads a month, so search matters more than
word of mouth.

## Decision

- **The kit lives in `docs/brand/`.** It is versioned with the code, reviewed in
  pull requests and indexed from `docs/README.md`.
  [`docs/brand/README.md`](../brand/README.md) is its entry point and
  `docs/brand/apply-spec.md` maps it to repository surfaces.
- **The name stays literal.** The brand is "Animated Fluent Emojis" on npm, in
  the repository, the README and on social. The brand is applied as identity
  (mark, voice, palette, motion), not as a new name.
- **Mint palette.** Mint is the brand colour, with a dark surface for the cover
  and social images.
- **Sticker logo, with a generic-face exception.** The mark is a mint squircle
  with a minimal face. This is the one exception to the "no own artwork" rule:
  the face copies no Microsoft emoji and appears only in the mark.
- **Figtree and Geist Mono are scoped to brand assets.** They are used in the
  logo lockup, the cover, the social images and the brand book. The README and
  npm page keep the platform's fonts.
- **Rasters are regenerated only by `bun run brand:export`.** The PNG marks, the
  social preview, the Open Graph image and the README cover are generated from
  the logo SVGs and the copy in the export script, and are never edited by hand.

### Rejected alternatives

- **Renaming to Framemoji**: it scored higher as a pure name, but every
  competitor is literal, the project has no audience yet and a new name has to
  be taught first. It would also need a new package, a deprecation of the old
  one and a repository rename for a small user base. Framemoji stays free and is
  kept open if the project outgrows the Fluent set.
- **Keeping brand docs outside the repository**: they would drift from the
  surfaces they describe, and the generated rasters need the sources next to
  them to be reproducible.

## Consequences

- Brand changes go through pull requests like code, and `bun run lint:docs`
  checks the links in the kit.
- Generated rasters are committed, so a change to a logo SVG or the export copy
  must be followed by `bun run brand:export`.
- The logo is the only place with own artwork; any other custom artwork needs a
  new decision.
- Copy on every surface follows `docs/brand/copy.md`, including the notice that
  the project is not affiliated with or endorsed by Microsoft.
