# AGENTS.md

Instructions for coding agents working in the library. The root
[`AGENTS.md`](../../AGENTS.md) rules apply here too.

## What this workspace is

The one published package, `animated-fluent-emojis`: the framework-free core and
the React, Vue, Svelte, Astro and `<fluent-emoji>` adapters. The framework peer
dependencies are optional. See
[`docs/architecture.md`](../../docs/architecture.md) for the code map.

## Rules

- Tests need Playwright's Chromium, Firefox and WebKit installed first:
  [`docs/development.md#testing`](../../docs/development.md#testing).
- The `browser` project runs on three engines (`browser (chromium)`,
  `browser (firefox)`, `browser (webkit)`). Coverage is collected on Chromium
  only, because v8 coverage needs it: `test:coverage` runs Chromium, and
  `test:cross-browser` runs Firefox and WebKit (CI runs both). Never use CDP
  (`cdp()`) in tests; use a custom command from `vitest.config.ts`
  (`commands.emulateReducedMotion`) so it works on every engine. A test that
  cannot work on an engine is skipped with the reason in its title and listed in
  the ticket for [ADR 0023](../../docs/adr/0023-practices-parity-with-snug.md).
- Component and hook tests run in a real browser, pure logic in a `node`
  project, and the `.astro` component in an `astro` project; put new tests where
  the project globs match:
  [`docs/development.md#testing`](../../docs/development.md#testing).
- Every new source module needs a test or an entry in the exemptions list of
  `scripts/coverage-manifest.test.ts` at the repo root:
  [`docs/development.md#testing`](../../docs/development.md#testing).
- The slim manifest is fetched lazily on first render, so tests mock it with
  MSW: [`docs/architecture.md#manifest`](../../docs/architecture.md#manifest).
- The package is ESM-only; never add a CommonJS entry or a `require` condition:
  [`docs/development.md#packaging`](../../docs/development.md#packaging).
- `style.css` is a separate export consumers must import; keep `sideEffects`
  covering CSS: [`docs/architecture.md#css`](../../docs/architecture.md#css).
