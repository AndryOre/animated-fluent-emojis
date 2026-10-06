# 0004: Vitest Browser Mode

## Status

Accepted

Date: 2026-10-04

## Context

The `Emoji` component depends on real browser behavior: injected `<style>`
elements, `CSS.escape`, CSS animations, hover states and `getComputedStyle`. A
simulated DOM cannot verify these faithfully, and the component's value is in
how it renders.

## Decision

- **Vitest 5 Browser Mode with Playwright (headless Chromium)** runs component
  and hook tests (`src/components/**`, `src/hooks/**`) in a real browser, with
  `vitest-browser-react` for rendering.
- **A second, `node` project** runs pure-logic tests (`src/utils/**`,
  `src/test/**`, `eslint-rules/**`, `docs/adr/**`) without a browser.
- **MSW in `worker-only` mode** mocks the CDN manifest in the browser project.
- **Accessibility** is checked with `axe-core` in `Emoji.a11y.test.tsx`.
- **Coverage** uses the v8 provider over `src/**` (including `.svelte`),
  `scripts/**`, `eslint-rules/**` and `docs/brand/tools/**`, with thresholds
  (95% lines, functions and statements, 90% branches) enforced by
  `bun run test:coverage` in CI. `.astro` files are not reported by v8 and stay
  covered by the container render test, and the brand export CLI
  (`docs/brand/tools/export.mjs`) needs a real browser, so both are left out.

### Rejected alternatives

- **jsdom or happy-dom**: no layout, no real CSS animation state, and
  `CSS.escape` and computed-style behavior differ from browsers.
- **Playwright Test as a separate runner**: a second runner and config for tests
  that Vitest can already run next to the code.
- **Cypress component testing**: heavier, and a third toolchain.

## Consequences

- Contributors need Playwright's Chromium (`bunx playwright install chromium`)
  before `bun run test` works locally.
- CI installs the browser and uploads a test report artifact.
- Tests cost more per run than jsdom, which is accepted for fidelity.
