# AGENTS.md

Instructions for coding agents working in the library. The root
[`AGENTS.md`](../../AGENTS.md) rules apply here too.

## What this workspace is

The one published package, `animated-fluent-emojis`: the framework-free core and
the React, Vue, Svelte, Astro and `<fluent-emoji>` adapters. The framework peer
dependencies are optional. See
[`docs/architecture.md`](../../docs/architecture.md) for the code map.

## Rules

- Tests need Playwright's Chromium installed first:
  [`docs/development.md#testing`](../../docs/development.md#testing).
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
