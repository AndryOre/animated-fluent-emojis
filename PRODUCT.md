# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

A TypeScript, ESM-only component library with adapters for React, Vue, Svelte
and Astro and a `<fluent-emoji>` element, built with Vite 8 library mode. The
website (`apps/site`) is a static Astro site with Starlight docs, Tailwind CSS
v4 and shadcn on Base UI, deployed as a container on Coolify at
`animated-fluent-emojis.andryore.dev`. Sprite sheets are served from a separate
static asset site on Cloudflare Pages.

## Users

Developers adding expression to a UI: chat and reactions, empty states,
onboarding and marketing pages, in React first and now Vue, Svelte, Astro or any
page through the element. A second audience is developers and creators who want
animated emojis in a README or GitHub profile. The website also receives
non-technical visitors (designers, creators, community managers) who come for
the emoji, not the code. Source: `docs/brand/brief.md`.

Jobs they hire it for:

- Render an animated Fluent emoji with one import and one tag.
- Keep the page fast: no layout shift, lazy manifest, small bundles.
- Respect people who ask for less motion.
- Find the right emoji by unicode, text or description.

## Product Purpose

Animated Fluent Emojis plays Microsoft's animated Fluent emojis on the web from
sprite sheets served by a static asset site. Success is adoption of the npm
package and the website as the maintained home of these emojis. There is no
revenue goal.

## Positioning

The animated Fluent emojis live in repositories and inside Teams, not in a
maintained component. This project is the typed, accessible, lightweight one:
the manifest loads lazily, a placeholder holds the layout, reduced motion shows
a still poster frame, and every emoji ships descriptive `alt` text.

## Operating Context

Visitors arrive from search, npm, GitHub and AI answers. They are deciding
whether the library is allowed, fast and unlikely to break, so the license
split, sizes, CI and OpenSSF Scorecard are answered plainly and early.

## Capabilities and Constraints

- One `<Emoji>` per adapter, or the `<fluent-emoji>` element, reading a small
  manifest fetched lazily on first render.
- Plays on load, on hover or on focus; a still poster frame under reduced
  motion; HD sprite sheets at 2x for high-density screens.
- Lookup helpers resolve unicode, text or a description to an emoji id.
- Self-hostable assets with a documented Content Security Policy.
- The artwork belongs to Microsoft; the code is MIT. The project is not
  affiliated with or endorsed by Microsoft. Never use "official" or "exclusive",
  and never show Microsoft, Teams or Fluent logos.
- The website is available in ten languages, with English at the root.
- No analytics and no third-party scripts, fonts or embeds on the site.

## Brand Commitments

The name is **Animated Fluent Emojis** everywhere. The brand is a cheerful stage
around the emojis: playful in voice, motion and shape, restrained in color (Mint
accent plus tinted neutrals, Figtree and Geist Mono, the Sticker mark). The
source of truth is `docs/brand/`; the site's composition is documented in
`apps/site/DESIGN.md`. Copy claims only what ships today.

## Evidence on Hand

- Open source repository with CI, CodeQL and an OpenSSF Scorecard badge.
- Published package with provenance through npm trusted publishing.
- Verified competitor data in `docs/brand/competitors.md`.

Absent, and not to be fabricated: customer logos, press, case studies and usage
metrics.

## Product Principles

1. The emojis are the protagonist; the interface stages them and never steals
   the scene.
2. Light and careful: lazy loading, held layout, reduced motion and `alt` text
   are defaults, not options.
3. Say plainly what the license allows and what it does not.
4. One component and no setup beyond a stylesheet import.
5. Playful on the surface, serious underneath: the rigor shows in the docs, not
   in the brand.

## Accessibility & Inclusion

Reduced motion shows a still poster frame in the library and a static, fully
visible page on the site. Text meets WCAG AA contrast in light and dark. The
website is localized in ten languages, and layouts never rely on a fixed width.
