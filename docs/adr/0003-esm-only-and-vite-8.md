# 0003: ESM-only and Vite 8

## Status

Accepted

Date: 2026-10-04

## Context

The package is a React component library consumed by bundlers. It previously
shipped a mix of formats. Maintaining a CommonJS build doubles the surface that
`publint` and `@arethetypeswrong/cli` have to validate, and every maintained
React toolchain (Vite, Next.js, Remix, modern webpack) consumes ESM.

## Decision

- **ESM only.** `package.json` sets `"type": "module"` and an `exports` map with
  `types` and `import` conditions for `.`, plus `./style.css`. There is no
  `require` condition and no `main` field.
- **Vite 8 library mode** builds a single ES bundle (`formats: ['es']`) with
  `react` and `react-dom` externalized, plus declarations through
  `vite-plugin-dts`.
- **CSS ships separately** as `style.css`, imported by consumers with
  `import 'animated-fluent-emojis/style.css'`. The package declares
  `sideEffects: ["**/*.css"]` so bundlers keep the import.
- **Package correctness is gated** by `publint --strict` and
  `attw --profile esm-only`, run in `bun run lint:package` and in CI.

### Rejected alternatives

- **Dual ESM and CJS**: more surface to verify, and no remaining consumer that
  needs it. Node 22+ can `require()` ESM anyway.
- **Keeping the previous bundler setup**: Vite 8 is already the dev server and
  test runner base, so one toolchain covers all three.
- **Inlining the CSS into JS**: breaks consumers that want to control CSS
  ordering and complicates SSR.

## Consequences

- Consumers on CommonJS-only toolchains must use dynamic `import()`.
- This is a breaking change for any consumer that used a `require` path, and is
  reflected in the changelog.
- Size limits (`bun run size`) apply to the single bundle and the stylesheet.
