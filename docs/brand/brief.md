# Brief — Animated Fluent Emojis

Draft v1 (2026-10-05). Status: applied; updated for 0.7. The name is decided:
`naming.md` keeps Animated Fluent Emojis.

## Category

A component library (ESM only, TypeScript) that renders Microsoft's animated
Fluent emoji on the web. Today it ships adapters for React, Vue, Svelte and
Astro, plus a `<fluent-emoji>` element for everything else (see ADR 0014): one
`<Emoji>` reads a small manifest, fetched lazily on first render, and plays
sprite sheets served from a static asset site. It plays on load, on hover or on
focus, shows a still poster frame under reduced motion, and ships descriptive
`alt` text.

Where it is going, and what the brand has to stretch to without claiming it
today:

- A landing page built with the library itself.
- Animated files ready to embed in a README or GitHub profile. Sprite sheets
  cannot animate in a plain `<img>`, so this needs a new asset type.

Copy written now only claims what ships today.

## Audience

- **Primary today:** React developers (and, from 0.6, Vue, Svelte and Astro
  developers) adding expression to a UI: chat and reactions, empty states,
  onboarding, marketing pages.
- **Planned:** developers and creators who want animated emoji in READMEs and
  GitHub profiles. This is the audience of
  `Tarikul-Islam-Anik/Animated-Fluent-Emojis` (1,102 stars), see
  `competitors.md`.
- **Also on the landing page:** non-technical visitors (designers, creators,
  community managers) who come for the emoji, not for the code. What they can do
  there is not decided yet, so copy stays at the level of "see them move" and
  does not promise a workflow.
- **Constraint:** the visual system and the words have to work for them too: on
  a future landing page, in social posts and in a README header, without
  technical vocabulary where a non-technical reader would meet it.

## Pains

1. Animated Fluent emoji live in repositories and inside Teams, not in a
   maintained web component.
2. Static packs (LobeHub, Iconify) dominate search, so getting the animated ones
   takes manual work.
3. Animated assets are heavy, shift the layout and ignore reduced motion.
4. It is unclear what the license allows, and whether the project is
   Microsoft's.

## Product function

The brand adds no scope. Its job is to make the existing qualities legible:
alive, light and careful.

- One component, no setup beyond a stylesheet import.
- The manifest loads lazily and never at import time. An empty `aria-hidden`
  placeholder of the final size holds the layout while it loads.
- HD sprite sheets are served at 2x to high-density screens.
- Reduced motion shows a still poster frame.
- Lookup helpers resolve unicode, text or a description to an emoji id.

## Emotional promise (internal only — never public copy)

**Make your interface smile.**

It orients decisions and never appears verbatim in the README, the npm page or
UI strings. The voice guide (step 4) will name the words it rules out.

Proposed 2026-10-05 as a playful replacement for the first wording, "Your
interface comes alive, without weight and without fuss".

## Cultural position

- A small, well-made open-source tool, built by a developer for developers.
- Playful on the surface (voice, motion, shape), serious underneath
  (performance, accessibility, tests). The serious part shows in the docs, not
  in the brand.
- The reader is a peer who already has good tools and good judgment. For a
  non-technical visitor, the reader is a guest: welcomed, never talked down to,
  and never shown jargon.

## Trust level

Medium. The questions people bring are "is this allowed?", "will it slow my
app?" and "will it break?". Answer them plainly and early: the license split,
lazy loading and sizes, CI, OpenSSF Scorecard.

## Relationship with Microsoft

- The artwork is Microsoft's. The official set is MIT. Teams sprites have no
  explicit license (ADR 0006). The code is ours, under MIT.
- The project is not affiliated with or endorsed by Microsoft. Say it once,
  clearly, where people decide to use it.
- No Microsoft, Teams or Fluent logos.
- Never use "official" or "exclusive". The README's "Exclusive Feature" callout
  is rewritten in the apply stage.

## Visual world

- The emoji are the protagonist. The brand is a cheerful stage around them: it
  has a personality, but it does not steal the scene.
- One cheerful accent plus neutrals.
- Rounded, chubby shapes that fit the Fluent style without imitating it.
- Must work in light and dark, in README and npm previews, and later on the
  landing page.

### Playfulness

Playful in voice, motion and shape, restrained in color, so the brand never
competes with the 3D emoji.

- **Voice:** light, with warm humor and short sentences. Small jokes are
  welcome, never at the expense of precision.
- **Motion:** the logo and UI elements move, for example a bounce or a
  squash-and-stretch on the landing page or in a GIF.
- **Shape:** rounded, chubby geometry.
- **Color:** one cheerful accent plus neutrals, no rainbow.

### Palette: Mint

Chosen 2026-10-05 (direction A of four: Mint, Violet, Bubblegum, Sunshine). Mint
sits opposite the warm yellows and reds of the emoji, so they pop, and it avoids
the amber and red that Snug and StreamBoss already use. The accent is the only
color. Everything else is a tinted neutral.

| Role                    | Light     | Dark      |
| ----------------------- | --------- | --------- |
| Accent (fills, markers) | `#2EC4A0` | `#2EC4A0` |
| Label on accent         | `#0E1F1B` | `#0E1F1B` |
| Link ink                | `#0B7A63` | `#2EC4A0` |
| Ground                  | `#F7FAF9` | `#0D1715` |
| Surface                 | `#FFFFFF` | `#14211E` |
| Text                    | `#10201C` | `#EAF4F1` |
| Muted text              | `#4B5F5A` | `#9AB0AA` |
| Border                  | `#DCE6E3` | `#25362F` |

Contrast, computed by script (WCAG AA needs 4.5:1 for normal text):

| Pair               | Light  | Dark   |
| ------------------ | ------ | ------ |
| Text on ground     | 16.1:1 | 16.3:1 |
| Muted on ground    | 6.5:1  | 8.0:1  |
| Label on accent    | 7.7:1  | 7.7:1  |
| Link ink on ground | 5.0:1  | 8.3:1  |

Rules:

- The accent fill never carries text in its own color. On light ground, text and
  links use the link ink, since `#2EC4A0` on `#F7FAF9` is below 3:1.
- Labels on an accent fill are the dark label color, never white.
- The risk is that mint is common in developer tools. The Sticker mark and the
  motion carry the distinctiveness, not the color.

### Logo: Sticker

Chosen 2026-10-05 after four rounds (film and frame shapes, grid and page
derivatives, then faces). A chubby mint squircle with a minimal face and a
curled corner: an emoji on a page you can flip.

- **Why it won:** it says emoji, frame and flipbook in one shape, and the
  squircle is a stage, so it does not compete with the real emoji the way a
  round smiley would. The curl is ownable. Wink (a plain disc) was the runner-up
  and is better at 16 px, but it reads as one more emoji.
- **Construction:** viewBox 64×64, one filled path for the body, flat fills, no
  strokes on the body. The face is two dots and a smile, with a wink arc in the
  animation. The curl is a darker mint (`#0B7A63`).
- **Animation:** a 3 s loop. The body squashes and hops, one eye swaps to a wink
  arc, and the curled corner pulls back. Under reduced motion it stays on the
  open-eyed pose, as the library does.
- **Files (`logo/`):** `mark.svg`, `mark-black.svg`, `mark-white.svg` and
  `mark-animated.svg`, plus the two lockups described under Typography.
- **Known weakness:** at 16 px the face shrinks to two dots and a hint of a
  smile, and the mark reads mostly as a mint square with a corner. It is legible
  in `logo/png/mark-16.png`, but a favicon with a simplified face stays an
  option if it looks weak in a real tab.

### Typography: Figtree and Geist Mono

Chosen 2026-10-05, from the shadcn create font picker only (verified against
`apps/v4/lib/font-definitions.ts` in the shadcn/ui repo: 17 sans, 2 mono, 7
serif). Candidates were Figtree, DM Sans, Nunito Sans and Manrope. Space Grotesk
(Snug) and Outfit (StreamBoss) were left out so the brand stays independent.

- **Figtree 800:** the wordmark and headlines, tracked at -0.03em. Its open,
  round shapes echo the squircle in the mark, and the same family carries body
  text at 400 and 500, so the system has one typeface. Both weights are OFL.
- **Geist Mono:** code, such as `<Emoji id="1f44b_wavinghand" />`. JetBrains
  Mono, the list's only other mono, was not needed.
- **Lockups:** the wordmark is outlined to paths in `logo/lockup-horizontal.svg`
  (dark text, for light grounds) and `logo/lockup-horizontal-dark.svg` (light
  text, for dark grounds), so no file depends on the font.
- **Scope:** the README and npm page keep the platform's own fonts. Figtree
  applies to the brand assets (cover, social preview, OG image), the brandbook
  and any future landing page.

## Symbolic metaphor

**A frame strip** is the recommendation. Animation is a strip of frames, which
is exactly what the library ships as sprite sheets. It is ownable, it ties to
the product, and it animates naturally: the strip scrolls from frame to frame.

Rejected:

- **Sparkles:** overused, especially in AI branding.
- **Stage or spotlight:** passive, and hard to read at 16 px.

## What to avoid

- Microsoft's visual language: Fluent icons, Segoe, Microsoft blue, the
  four-square logo.
- Our own emoji or mascot artwork. The ROADMAP rules out custom artwork. One
  exception, decided 2026-10-05: the logo may use a generic face, since a mark
  that never says "emoji" did not connect with the name. The face copies no
  Microsoft emoji and appears only in the mark.
- Generic "fun" clichés: neon, rainbow gradients, confetti everywhere, sparkles.
- Overpromising a catalog size or a feature that does not ship.

## Closed decisions

- English only.
- The kit lives in `docs/brand/`.
- Scope follows Snug's process without YouTube, store tiles or app settings.
- The landing page and README-embeddable files are not part of this work.
- Nothing is published to npm, the repository is not renamed and no domain is
  bought without an explicit OK.

## Out of scope

- Native adapters beyond React, Vue, Svelte, Astro and the `<fluent-emoji>`
  element, such as Angular, Solid, Qwik or Ember, until there is demand.
- Original emoji artwork.
- Domain purchase.
