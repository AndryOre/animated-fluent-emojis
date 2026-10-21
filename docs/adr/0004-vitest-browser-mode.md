# 0004: Vitest Browser Mode

## Status

Accepted

Date: 2026-10-04

Revised: 2026-10-21, browser projects run chromium, firefox and webkit; coverage
moved to the root and each workspace with its own thresholds.

## Context

The `Emoji` component depends on real browser behavior: injected `<style>`
elements, `CSS.escape`, CSS animations, hover states and `getComputedStyle`. A
simulated DOM cannot verify these faithfully, and the component's value is in
how it renders.

## Decision

- **Vitest 5 Browser Mode with Playwright (headless Chromium, Firefox and
  WebKit)** runs component and hook tests (`src/components/**`, `src/hooks/**`)
  in a real browser, with `vitest-browser-react` for rendering.
- **A second, `node` project** runs pure-logic tests (`src/utils/**`,
  `src/test/**`, `eslint-rules/**`, `docs/adr/**`) without a browser.
- **MSW in `worker-only` mode** mocks the CDN manifest in the browser project.
- **Accessibility** is checked with `axe-core` in `Emoji.a11y.test.tsx`.
- **Coverage** uses the v8 provider and is configured per workspace, plus at the
  root. The library covers `src/**` (including `.svelte`) and the root covers
  `scripts/**`, `eslint-rules/**` and `docs/brand/tools/**`
  ([ADR 0016](0016-bun-workspaces-monorepo.md) lists the thresholds). The
  browser project runs only Chromium during coverage runs.
  `bun run test:coverage` enforces the thresholds in CI. `.astro` files are not
  reported by v8 and stay covered by the container render test, and the brand
  export CLI (`docs/brand/tools/export.mjs`) needs a real browser, so both are
  left out.

### Rejected alternatives

- **jsdom or happy-dom**: no layout, no real CSS animation state, and
  `CSS.escape` and computed-style behavior differ from browsers.
- **Playwright Test as a separate runner**: a second runner and config for tests
  that Vitest can already run next to the code.
- **Cypress component testing**: heavier, and a third toolchain.

## Consequences

- Contributors need Playwright's browsers
  (`bunx playwright install chromium firefox webkit`) before `bun run test`
  works locally.
- CI installs the browser and uploads a test report artifact.
- Tests cost more per run than jsdom, which is accepted for fidelity.
