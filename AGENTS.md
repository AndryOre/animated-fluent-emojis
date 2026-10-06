# AGENTS.md

Instructions for coding agents working in this repository.

## Stack

A bun-workspaces monorepo ([ADR 0016](docs/adr/0016-bun-workspaces-monorepo.md))
orchestrated by Turborepo. TypeScript (strict), ESM-only, managed with bun. The
root holds tooling only:

- [`packages/animated-fluent-emojis`](packages/animated-fluent-emojis/AGENTS.md):
  the published component library, with adapters for React, Vue, Svelte, Astro
  and a `<fluent-emoji>` element. Built with Vite 8 library mode, tested with
  Vitest Browser Mode.
- [`apps/assets`](apps/assets/AGENTS.md): the private asset pipeline.
- [`apps/site`](apps/site/AGENTS.md): the private static website (Astro,
  Starlight, Tailwind).

See [`docs/architecture.md`](docs/architecture.md) for the code map.

## Running scripts

Always use `bun run <script>` — never call the underlying tool directly, and
never use another package manager (this repo uses `bun.lock`). Read
`package.json`'s `scripts` before inventing a command.

- `bun run check` — format, lint, typecheck, knip and package lint. Run this
  after any change.
- `bun run test` — the Vitest suite. Run this after any change.
- `bun run brand:export` — regenerates the brand rasters. Run it after changing
  a logo SVG or the export copy; never edit the generated rasters by hand.
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

- Library rules (test projects and Playwright, MSW manifest mocking, ESM-only,
  `style.css`, and the coverage manifest requirement for new modules) live in
  [`packages/animated-fluent-emojis/AGENTS.md`](packages/animated-fluent-emojis/AGENTS.md).
- The coverage manifest is `scripts/coverage-manifest.test.ts`, with one
  exemption list keyed by repo-relative paths.
- The asset pipeline lives in `apps/assets`, with its own rules:
  [`apps/assets/AGENTS.md`](apps/assets/AGENTS.md).
- Actions are SHA-pinned and workflows are linted; edit them with care:
  [`docs/development.md#ci`](docs/development.md#ci).
- Repository settings are applied by hand, not by code:
  [`docs/development.md#repository-settings`](docs/development.md#repository-settings).
- Releases are tag-driven with npm OIDC; never run `npm publish` locally:
  [`docs/how-to/cut-a-release.md`](docs/how-to/cut-a-release.md).
