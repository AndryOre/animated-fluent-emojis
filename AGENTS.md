# AGENTS.md

Instructions for coding agents working in this repository.

## Stack

A React component library (`Emoji`) that renders Microsoft's Fluent animated
emojis from a CDN. React 18/19 peer dependency, TypeScript (strict), ESM-only,
built with Vite 8 library mode, tested with Vitest Browser Mode, managed with
bun. See [`docs/architecture.md`](docs/architecture.md) for the code map.

## Running scripts

Always use `bun run <script>` — never call the underlying tool directly, and
never use another package manager (this repo uses `bun.lock`). Read
`package.json`'s `scripts` before inventing a command.

- `bun run check` — format, lint, typecheck, knip and package lint. Run this
  after any change.
- `bun run test` — the Vitest suite. Run this after any change.
- `bun run build` — **do not run unless explicitly asked.** It is slow; `check`
  already builds once through `lint:package`.

## Branch and commit conventions

Branches are `<type>/<slug>`. Commits and PR titles are
`type: emoji lowercase subject`, for example `feat: ✨ add confetti emoji`.
Detail:
[`docs/development.md#branch-naming`](docs/development.md#branch-naming),
[`docs/development.md#commit-format`](docs/development.md#commit-format).

## Code comments

Every code comment is a TSDoc block on a non-obvious export. No `//` or
non-JSDoc `/* */` comments, except lint or type directives. Detail:
[`docs/development.md#code-documentation`](docs/development.md#code-documentation),
[ADR 0002](docs/adr/0002-tsdoc-only-code-comments.md).

## Quirks and gotchas

- Tests need Playwright's Chromium installed first:
  [`docs/development.md#testing`](docs/development.md#testing).
- Component and hook tests run in a real browser, pure logic in a `node`
  project; put new tests where the project globs match:
  [`docs/development.md#testing`](docs/development.md#testing).
- The package is ESM-only; never add a CommonJS entry or a `require` condition:
  [`docs/development.md#packaging`](docs/development.md#packaging).
- `style.css` is a separate export consumers must import; keep `sideEffects`
  covering CSS: [`docs/architecture.md#css`](docs/architecture.md#css).
- The emoji manifest is fetched from the CDN at module load, so tests mock it
  with MSW: [`docs/architecture.md#manifest`](docs/architecture.md#manifest).
- Every new source module needs a test or an entry in the exemptions list of
  `src/test/coverage-manifest.test.ts`:
  [`docs/development.md#testing`](docs/development.md#testing).
- Actions are SHA-pinned and workflows are linted; edit them with care:
  [`docs/development.md#ci`](docs/development.md#ci).
- Repository settings are applied by hand, not by code:
  [`docs/development.md#repository-settings`](docs/development.md#repository-settings).
- Releases are tag-driven with npm OIDC; never run `npm publish` locally:
  [`docs/how-to/cut-a-release.md`](docs/how-to/cut-a-release.md).
