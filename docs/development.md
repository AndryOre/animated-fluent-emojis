# Development

## Setup

```sh
bun install
bunx playwright install chromium
```

Bun `1.4.2` is required (see `packageManager` in `package.json`). Husky installs
the git hooks on `bun install` through the `prepare` script.

## Scripts

| Script                       | What it does                                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`                | Starts the Vite dev server serving the playground.                                                                                                    |
| `bun run build`              | Type-checks (`tsc -b`) and builds the library with Vite. Slow; run only if asked.                                                                     |
| `bun run check`              | Aggregate gate: format:check, lint, typecheck, knip, lint:package.                                                                                    |
| `bun run fix`                | Aggregate autofix: format:write, lint:fix, typecheck.                                                                                                 |
| `bun run format:check`       | Checks formatting with Prettier (no writes).                                                                                                          |
| `bun run format:write`       | Formats the repository with Prettier.                                                                                                                 |
| `bun run lint`               | Runs ESLint with `--max-warnings=0` (cached).                                                                                                         |
| `bun run lint:fix`           | Runs ESLint with `--fix`.                                                                                                                             |
| `bun run typecheck`          | Runs `tsc -b`.                                                                                                                                        |
| `bun run knip`               | Finds unused files, exports and dependencies.                                                                                                         |
| `bun run lint:package`       | Builds, then runs `publint --strict` and `attw --profile esm-only`.                                                                                   |
| `bun run size`               | Checks the size (brotli) of the eight `size-limit` entries: ESM, React, Element, Vue, Svelte, Astro client, Lookup and the stylesheet. Needs a build. |
| `bun run test`               | Runs the Vitest suite once (browser, node and astro projects).                                                                                        |
| `bun run test:watch`         | Runs Vitest in watch mode.                                                                                                                            |
| `bun run test:coverage`      | Runs Vitest with v8 coverage and enforces the thresholds.                                                                                             |
| `bun run lint:docs`          | Runs lychee over the docs with the same arguments as `lint-docs.yml`.                                                                                 |
| `bun run lint:commits`       | Runs commitlint over the commits since `origin/main`, like the CI job.                                                                                |
| `bun run assets:detect`      | Reports whether the published asset site is out of date (Teams manifest or Microsoft's repository).                                                   |
| `bun run assets:build`       | Builds the manifest and sprites into `dist-assets/`; needs `ffmpeg`. Add `-- --limit 20` for a sample.                                                |
| `bun run assets:verify-live` | Checks that the live asset site serves the current v1 layout and pipeline version.                                                                    |
| `bun run assets:lists`       | Regenerates `docs/EMOJI_LIST_*.md` from `dist-assets/manifest.json`.                                                                                  |
| `bun run brand:export`       | Regenerates the brand rasters from the logo SVGs; needs Chromium.                                                                                     |
| `bun run ci:local`           | Runs the CI pipeline locally: install, commits, docs, check, coverage, build, size.                                                                   |

### Brand assets

`bun run brand:export` regenerates the PNG marks, the social preview, the Open
Graph image and the README cover from the logo SVGs and the export copy. Run it
after changing either, and never edit the generated rasters by hand. See
[`brand/README.md`](brand/README.md).

## Git hooks

Hooks live in `.husky/`:

- **`pre-commit`** runs `lint-staged`: Prettier and ESLint on staged code files,
  Prettier alone on staged `json`, `md`, `css` and `yml` files
  (`lint-staged.config.mjs`).
- **`commit-msg`** runs `commitlint` with `@commitlint/config-conventional`. It
  enforces the Conventional Commits shape and type list, not the emoji.
- **`pre-push`** rejects a push whose branch name does not match `<type>/<slug>`
  (or `main`, `renovate/*`).

## CI

Every PR runs the full `ci.yml` pipeline, docs-only changes included:

- **Quality**: format check, lint, typecheck, knip.
- **Test**: Vitest browser mode with coverage; uploads a test report when it
  fails.
- **Package**: build, `publint`, `attw`, size limit and a size report.
- **Commitlint**: validates the PR's commit messages.
- **CI passed**: aggregates the jobs above; it is the single required status
  check.

`sync-assets.yml` runs weekly (and on demand) outside the PR pipeline: it
detects new emoji versions, rebuilds and deploys the asset site to Cloudflare
Pages, smoke tests the published manifest and a sprite, and opens a pull request
with the regenerated emoji lists. A failed run opens or updates a single
`sync-assets failing` issue. It also publishes the `/v1/` layout whenever
`/v1/version.json` is missing, lacks the `v1` layout or carries another pipeline
version. Manual dispatch takes two inputs: `rebuild` forces a build even when
nothing changed, and `bypass_guards` skips the Teams discovery guard and the
catalog removal guard (more than 5% removed, checked on the planned catalog
before any conversion). The file-count guard is never bypassed. The v1 smoke
test always runs. Setup:
[`how-to/set-up-asset-hosting.md`](how-to/set-up-asset-hosting.md); recovery:
[`how-to/roll-back-the-asset-site.md`](how-to/roll-back-the-asset-site.md).

Other workflows: `lint-docs.yml` (offline link and anchor check with lychee),
`lint-workflows.yml` (workflow linting), `lint-pr.yml` (PR title), `labels.yml`
(label sync), `scorecard.yml` (OpenSSF Scorecard) and `release.yml` (which waits
for the `CI passed` check of the tagged commit to succeed before publishing; see
[`how-to/cut-a-release.md`](how-to/cut-a-release.md) and
[ADR 0005](adr/0005-npm-trusted-publishing.md)). All third-party actions are
pinned to a commit SHA.

## Branch naming

`<type>/<slug>`, where type is one of `feat`, `fix`, `docs`, `style`,
`refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert` and the slug is
lowercase kebab-case, for example `feat/add-confetti-emoji`.

## Commit format

`type: emoji lowercase subject`, for example `feat: ✨ add confetti emoji`, with
a bulleted body when it helps. PRs are squash-merged, so the PR title follows
the same format. The hook does not enforce the emoji; it is a convention.

## Code documentation

Comments are TSDoc blocks only, on non-obvious exports. A local ESLint rule
(`eslint-rules/no-non-doc-comments.mjs`) rejects `//` and plain `/* */`
comments. Rationale: [ADR 0002](adr/0002-tsdoc-only-code-comments.md).

## Testing

Vitest has three projects (`vitest.config.ts`):

- **`browser`**: tests under `src/components`, `src/hooks`, `src/react`,
  `src/vanilla`, `src/element` and `src/vue`, plus `src/astro/client.test.ts`
  and the conformance suite, run in headless Chromium through Playwright, with
  MSW mocking the slim manifest request (`src/test/browser-setup.ts`). The
  manifest is fetched lazily, so a test that needs a fresh load resets the
  module state first. Run `bunx playwright install chromium` once.
- **`node`**: tests under `src/core`, `src/utils`, `src/lookup`, `src/test`
  (except the conformance suite), `eslint-rules`, `docs/adr`, `docs/brand/tools`
  and `scripts`, plus `src/astro/markup.test.ts` and `src/astro/server.test.ts`.
- **`astro`**: `src/astro/Emoji.test.ts`, which renders the `.astro` component
  through Astro's container API.

### Conformance suite

`src/test/conformance/suite.ts` holds one behavior spec (placeholder, ready,
unknown id, manifest error, fallback glyph, reduced motion, playback gating by
image, viewport and hidden tab, `playing`, and a single `onPlaybackEnd`) that
runs in the `browser` project against the shared MSW manifest fixtures. It
observes the rendered DOM only (`span > img`, the `[role="img"]` glyph, the
inline `animation-play-state`), so every adapter must render the same structure.

An adapter plugs in with a driver, about 15 lines of glue in
`src/test/conformance/<adapter>.conformance.test.ts(x)`:

```ts
defineConformanceSuite('my-adapter', () => ({
  mount: (container, options) => {},
  update: (options) => {},
  unmount: () => {},
}))
```

- `mount(container, options)` renders the emoji into `container`, forwarding
  `ConformanceOptions` (`id`, `size`, `animationIterations`, `autoPlay`,
  `playing`, `alt`, `onPlaybackEnd`, `onError`) unchanged, and may be async.
- `update(options)` re-renders with `options` replacing the previous ones.
- `unmount()` removes the emoji and releases everything it holds.

The factory is called once per test, so keep state inside the closure. The
contract lives in `src/test/conformance/driver.ts`.

`bun run test:coverage` measures `src/**` (including `.svelte`), `scripts/**`,
`eslint-rules/**` and `docs/brand/tools/**` and enforces 95% lines, functions
and statements and 90% branches. `.astro` files are not reported by v8 (the
container render test covers them) and `docs/brand/tools/export.mjs` needs a
real browser, so neither is measured. Local runs skip the ffmpeg tests when
`ffmpeg` is missing; CI always runs them, so CI numbers are at least as high.

`src/test/coverage-manifest.test.ts` walks all four roots and fails when a
source module has no colocated test and no documented exemption, or when an
exemption is stale. Rationale: [ADR 0004](adr/0004-vitest-browser-mode.md).

## Packaging

The package is ESM-only with an `exports` map for the entry, `./react`, `./vue`,
`./svelte`, `./astro`, `./element`, `./lookup` and `style.css`. The JavaScript
entries import a shared manifest chunk that stays out of `exports` and ships
through `files: ["dist"]`. A Rolldown `advancedChunks` group in `vite.config.ts`
names it `chunks/manifest-[hash].js`, so the `size-limit` globs always match it.
`bun run lint:package` validates the package. Rationale:
[ADR 0003](adr/0003-esm-only-and-vite-8.md).

## Dependency updates

Renovate (`renovate.json5`) opens the update pull requests, on Mondays before
12:00 UTC, and tracks them in the Dependency Dashboard issue. `@types/node` is
held below 25 to match the Node 24 runtime. A custom manager also pins the `npm`
version that the workflows install with `npm install -g npm@<version>`.

## Playground

`bun run dev` serves `index.html`, which loads `playground/main.tsx` and imports
the component straight from `src/`. The page has controls for an unknown id,
`fallback` (glyph, node, `null`), `skinTone`, `playing`, a string `size` and a
bad `configureEmojis` site URL that shows the error state; edit the file to try
other props, with hot reload. To preview reduced motion, emulate the
`prefers-reduced-motion` media feature in DevTools (Rendering panel). The
playground is not published and is ignored by knip.

## Repository settings

Settings are applied by hand through the GitHub API, not by code in the repo,
and are recorded in [ADR 0001](adr/0001-public-repo-security-posture.md):
rulesets on `main` and `v*` tags, squash-only merges, linear history, signed
commits, a single `CI passed` required check, private vulnerability reporting,
immutable releases, `sha_pinning_required` and CodeQL default setup. Change the
ADR together with any setting.
