# 0021: CSS scroll-driven motion

## Status

Accepted

Date: 2026-10-10

## Context

The landing page reveals sections as they enter the viewport and drifts a teaser
strip while the page scrolls. The motion is decorative: it must cost no
JavaScript, stay off the main thread, and never hide content from visitors whose
browser does not support it or who prefer reduced motion.

The first implementation exposed two traps. Lightning CSS folds
`animation-timeline` into the `animation` shorthand, which the Chromium used in
CI rejects. And an ancestor with `overflow` set to `hidden`, `auto` or `scroll`
becomes the scroller for an anonymous `view()` timeline, so the teaser strip,
clipped by its parent link, never moved with the page.

## Decision

Drive the motion with CSS view timelines, as two utilities in
`apps/site/src/styles/global.css`: `scroll-reveal` and `scroll-drift`.

- **View timelines**: each utility animates from a view timeline's progress
  through the viewport, with no script. `scroll-reveal` uses an anonymous
  `view()`; `scroll-drift` consumes the named timeline of its clipping link.
- **Gated**: every rule sits inside `@supports (animation-timeline: view())` and
  `prefers-reduced-motion: no-preference`, so the default state is static and
  fully visible.
- **Longhands**: the animation properties are written separately, never through
  the `animation` shorthand.
- **Named timeline when an ancestor clips**: declare `view-timeline-name` on the
  clipping ancestor and consume it from the child.

Rejected:

- **A JavaScript animation library such as the Motion package**: it adds a
  dependency and client JavaScript for a purely decorative effect, and needs its
  own reduced-motion and fallback handling.
- **IntersectionObserver reveals**: they fire once per threshold instead of
  tracking scroll progress, cannot drift continuously, and need script plus a
  hidden initial state that leaves content invisible if the script fails.

## Consequences

- Zero JavaScript and zero dependencies for scroll motion.
- Firefox, which lacks scroll-driven animations, renders the page static.
- The visual suite runs with reduced motion, so its baselines are unaffected.
- A clipping ancestor needs a named timeline, and new rules must use longhands;
  both live in the convention in
  [`docs/development.md`](../development.md#scroll-driven-motion).
