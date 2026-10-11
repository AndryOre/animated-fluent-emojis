# Development

## Setup

```sh
bun install
bunx playwright install chromium
```

Bun `1.4.2` is required (see `packageManager` in `package.json`). Husky installs
the git hooks on `bun install` through the `prepare` script.

## Workspaces

The repository is a Bun workspaces monorepo
([ADR 0016](adr/0016-bun-workspaces-monorepo.md)) with Turborepo (local cache
only) on top.

| Workspace                         | Package                           | What lives there                                                                                                                                |
| --------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `.` (root)                        | `animated-fluent-emojis-monorepo` | Private host, tooling only: `eslint-rules/`, `scripts/`, `docs/`, the brand kit, `turbo.json`, `bunfig.toml`.                                   |
| `packages/animated-fluent-emojis` | `animated-fluent-emojis`          | The one published package: `src/`, the playground, Vite, Vitest and tsconfig build configs, `size-limit` and `attw`.                            |
| `apps/assets`                     | `@animated-fluent-emojis/assets`  | Private asset pipeline: `sync.ts`, its modules and tests, `public-slugs.json`. Outputs `dist-assets/`, `dist-files/`, `.cache/assets` under it. |
| `apps/site`                       | `@animated-fluent-emojis/site`    | Private website: Astro, Starlight, Tailwind, ten locales, a container deployed through Coolify.                                                 |

Shared dependency versions are in the Bun catalog in the root `package.json`
(`catalog:`). `bunfig.toml` sets `linker = "isolated"` explicitly, and it works
with the Vitest `browser`, `node` and `astro` projects without a fallback. If it
ever breaks one of them, try a narrow `publicHoistPattern` first and
`linker = "hoisted"` only after that.

### Script fan-out

Root scripts keep their names and fan out through `turbo.json`. `check` runs
`turbo run check check:root` and `test` runs `turbo run test test:root`. The
Turborepo tasks are `transit`, `typecheck`, `check`, `test`, `test:coverage`,
`build`, `lint:package` and `size`, plus the root tasks `//#check:root`,
`//#test:root` and `//#test:coverage:root`. `transit` makes a change in the
library invalidate its dependents, such as `apps/assets` through its
`animated-fluent-emojis: workspace:*` devDependency. Format, lint and knip run
once for the whole repository in `check:root`.

A workspace script must not share a name with a Turborepo task unless it is
meant to run in that task: `turbo run build` executes any workspace script
called `build`. That is why the pipeline scripts in `apps/assets` are named
`sync:detect`, `sync:build`, `sync:verify-live`, `sync:lists` and `sync:files`,
and the root `assets:*` scripts call them with
`bun run --cwd apps/assets sync:*`. `--cwd` changes the working directory, so
any path passed through must be absolute.

## Scripts

| Script                       | What it does                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`                | Starts the Vite dev server serving the playground (library workspace).                                                                                                    |
| `bun run build`              | Runs `turbo run build`: type-checks (`tsc -b`) and builds the library with Vite. Slow; run only if asked.                                                                 |
| `bun run check`              | Aggregate gate: `turbo run check check:root` (workspace typecheck and lint:package; repo-wide format:check, lint, typecheck and knip).                                    |
| `bun run fix`                | Aggregate autofix: format:write, lint:fix, typecheck.                                                                                                                     |
| `bun run format:check`       | Checks formatting with Prettier (no writes).                                                                                                                              |
| `bun run format:write`       | Formats the repository with Prettier.                                                                                                                                     |
| `bun run lint`               | Runs ESLint with `--max-warnings=0` (cached).                                                                                                                             |
| `bun run lint:fix`           | Runs ESLint with `--fix`.                                                                                                                                                 |
| `bun run typecheck`          | Runs `turbo run typecheck`, then the root `tsc --noEmit`.                                                                                                                 |
| `bun run knip`               | Finds unused files, exports and dependencies.                                                                                                                             |
| `bun run lint:package`       | Builds the library, then runs `publint --strict` and `attw --profile esm-only`.                                                                                           |
| `bun run size`               | Checks the size (brotli) of the eight `size-limit` entries: ESM, React, Element, Vue, Svelte, Astro client, Lookup and the stylesheet. Needs a build.                     |
| `bun run test`               | Runs `turbo run test test:root`: the library (browser, node and astro projects), `apps/assets` and the root suites.                                                       |
| `bun run test:watch`         | Runs Vitest in watch mode in the library workspace.                                                                                                                       |
| `bun run test:coverage`      | Runs Vitest with v8 coverage in every workspace and enforces the thresholds.                                                                                              |
| `bun run lint:docs`          | Runs lychee over the docs with the same arguments as `lint-docs.yml`.                                                                                                     |
| `bun run lint:commits`       | Runs commitlint over the commits since `origin/main`, like the CI job.                                                                                                    |
| `bun run assets:detect`      | Reports whether the published asset site is out of date (Teams manifest or Microsoft's repository).                                                                       |
| `bun run assets:build`       | Builds the manifest and sprites into `apps/assets/dist-assets/`; needs `ffmpeg`. Add `-- --limit 20` for a sample.                                                        |
| `bun run assets:verify-live` | Checks that the live asset site serves the current v1 layout and pipeline version.                                                                                        |
| `bun run assets:files`       | Builds the files site from `dist-assets/` into `dist-files/` (under `apps/assets`); needs the built asset site. Add `-- --files-out <absolute dir>` to change the output. |
| `bun run assets:lists`       | Regenerates `docs/EMOJI_LIST_*.md` from `apps/assets/dist-assets/manifest.json`.                                                                                          |
| `bun run brand:export`       | Regenerates the brand rasters from the logo SVGs; needs Chromium.                                                                                                         |
| `bun run ci:local`           | Runs the CI pipeline locally: install, commits, docs, check, coverage, build, size.                                                                                       |

### Website

The site scripts live in `apps/site` and run with `bun run --cwd apps/site`,
except `i18n:status`, which also has a root script:

| Script                          | What it does                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `bun run --cwd apps/site dev`   | Starts the Astro dev server.                                                 |
| `bun run --cwd apps/site check` | Runs `astro check` (also part of `bun run check`).                           |
| `bun run --cwd apps/site test`  | Runs the site's Vitest suite (also part of `bun run test`).                  |
| `bun run i18n:status`           | Lists the missing and stale translations of the published docs, with totals. |

`astro build` and `preview` exist but are slow; the container build in
`deploy-site.yml` is the build check. Translating:
[`how-to/translate-the-website.md`](how-to/translate-the-website.md).

### Scroll-driven motion

The landing page reveals and drifts elements with CSS view timelines, defined as
the `scroll-reveal` and `scroll-drift` utilities in
[`apps/site/src/styles/global.css`](../apps/site/src/styles/global.css). The
decision is recorded in [ADR 0021](adr/0021-css-scroll-driven-motion.md). When
adding or changing one:

- **Longhands only**: set `animation-name`, `animation-fill-mode`,
  `animation-timing-function`, `animation-timeline` and `animation-range`
  separately. Lightning CSS folds `animation-timeline` into the `animation`
  shorthand, and the Chromium used in CI rejects the result.
- **Name the timeline when an ancestor clips**: an ancestor with `overflow` set
  to `hidden`, `auto` or `scroll` becomes the scroller for `view()`, so the
  animation never moves with the page. Declare a named view timeline
  (`view-timeline-name`) on that ancestor and consume it from the child with
  `animation-timeline`.
- **Gate every rule**: wrap it in `@supports (animation-timeline: view())` and
  `@media (prefers-reduced-motion: no-preference)`. Unsupported browsers and
  visitors who prefer reduced motion get a static, fully visible page.
- **Verify the computed result**: emulate reduced motion off, scroll, and read
  the element's computed `transform` and `opacity`. The animation name alone can
  be set while the timeline is wrong and nothing moves.

### Theme transition

Choosing a theme from the header menu cross-fades the page for 250ms through a
same-document view transition (`applyThemeAnimated`); initial load and
OS-preference changes apply instantly, as do visitors who prefer reduced motion
or browsers without `document.startViewTransition`.

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

Every PR runs the full `ci.yml` pipeline, docs-only changes included. Jobs check
out with `fetch-depth: 0` and restore the `.turbo` cache. On pull requests the
Turborepo tasks run with `--affected`, so only the workspaces touched by the
change (and their dependents) are checked; on `main` they run in full. The root
tasks (`check:root`, `test:coverage:root`) are never filtered. Job names are
unchanged:

- **Quality**: format check, lint, typecheck, knip.
- **Test**: Vitest browser mode with coverage; uploads a test report when it
  fails.
- **Package**: build, `publint`, `attw`, size limit and a size report.
- **Commitlint**: validates the PR's commit messages.
- **CI passed**: aggregates the jobs above; it is the single required status
  check.

`sync-assets.yml` runs weekly (and on demand) outside the PR pipeline: it
detects new emoji versions, rebuilds and deploys the asset site to Cloudflare
Pages, smoke tests the published manifest and a sprite, builds the files site
into `apps/assets/dist-files/` and deploys it to its own Pages project
(`animated-fluent-emojis-files`), smoke tests it (`version.json`, `index.json`
and one GIF, WebP and PNG from the public index), and opens a pull request with
the regenerated emoji lists. Detection also reports a rebuild when the files
site's `version.json` is missing or stale. A failed run opens or updates a
single `sync-assets failing` issue. It also publishes the `/v1/` layout whenever
`/v1/version.json` is missing, lacks the `v1` layout or carries another pipeline
version. Manual dispatch takes two inputs: `rebuild` forces a build even when
nothing changed, and `bypass_guards` skips the Teams discovery guard and the
catalog removal guard (more than 5% removed, checked on the planned catalog
before any conversion). The file-count guard is never bypassed. The v1 smoke
test always runs. Setup:
[`how-to/set-up-asset-hosting.md`](how-to/set-up-asset-hosting.md); recovery:
[`how-to/roll-back-the-asset-site.md`](how-to/roll-back-the-asset-site.md).

`deploy-site.yml` runs on pushes to `main` that touch `apps/site`, `docs`, the
library or the deploy script. It builds the site container from
`apps/site/Dockerfile` as a build check, then triggers a Coolify deploy through
`.github/scripts/deploy-coolify.sh` and waits for the result. It needs the
`COOLIFY_API_TOKEN` repository secret and the `SITE_COOLIFY_APP_UUID` repository
variable; the script fails with a clear message when either is missing. See
[ADR 0018](adr/0018-website-on-coolify-with-astro-and-starlight.md).

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

The library keeps three Vitest projects in
`packages/animated-fluent-emojis/vitest.config.ts` (paths below are relative to
that workspace):

- **`browser`**: tests under `src/components`, `src/hooks`, `src/react`,
  `src/vanilla`, `src/element` and `src/vue`, plus `src/astro/client.test.ts`
  and the conformance suite, run in headless Chromium through Playwright, with
  MSW mocking the slim manifest request (`src/test/browser-setup.ts`). The
  manifest is fetched lazily, so a test that needs a fresh load resets the
  module state first. Run `bunx playwright install chromium` once.
- **`node`**: tests under `src/core`, `src/utils`, `src/lookup` and `src/test`
  (except the conformance suite), plus `src/astro/markup.test.ts` and
  `src/astro/server.test.ts`.
- **`astro`**: `src/astro/Emoji.test.ts`, which renders the `.astro` component
  through Astro's container API.

`apps/assets` has one `node` project (`apps/assets/vitest.config.ts`). The root
`vitest.config.ts` is a `node` project over `eslint-rules`, `docs/adr`,
`docs/brand/tools` and `scripts`, which includes the workflow invariants and the
coverage manifest tests.

The browser conformance test "shows a sized, hidden placeholder, then the ready
image" can flake under heavy host load; rerun it before suspecting a regression.

### Conformance suite

`packages/animated-fluent-emojis/src/test/conformance/suite.ts` holds one
behavior spec (placeholder, ready, unknown id, manifest error, fallback glyph,
reduced motion, playback gating by image, viewport and hidden tab, `playing`,
and a single `onPlaybackEnd`) that runs in the `browser` project against the
shared MSW manifest fixtures. It observes the rendered DOM only (`span > img`,
the `[role="img"]` glyph, the inline `animation-play-state`), so every adapter
must render the same structure.

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

`bun run test:coverage` measures each workspace and enforces these thresholds
(lines, functions, branches, statements):

| Workspace                         | Measured                                                   | Thresholds  |
| --------------------------------- | ---------------------------------------------------------- | ----------- |
| `packages/animated-fluent-emojis` | `src/**` (including `.svelte`)                             | 95/95/90/95 |
| `apps/assets`                     | `*.ts` (not tests, `test-support.ts` or the Vitest config) | 95/95/90/95 |
| root                              | `scripts/**`, `eslint-rules/**` and `docs/brand/tools/**`  | 94/95/87/94 |

`.astro` files are not reported by v8 (the container render test covers them)
and `docs/brand/tools/export.mjs` needs a real browser, so neither is measured.
Local runs skip the ffmpeg tests when `ffmpeg` is missing; CI always runs them,
so CI numbers are at least as high.

`scripts/coverage-manifest.test.ts` walks the source roots of every workspace
and fails when a source module has no colocated test and no documented
exemption, or when an exemption is stale. One exemption list serves all
workspaces, keyed by repo-relative paths. Rationale:
[ADR 0004](adr/0004-vitest-browser-mode.md).

## Packaging

The published package is `packages/animated-fluent-emojis`. It is ESM-only with
an `exports` map for the entry, `./react`, `./vue`, `./svelte`, `./astro`,
`./element`, `./lookup` and `style.css`. The JavaScript entries import a shared
manifest chunk that stays out of `exports` and ships through `files: ["dist"]`.
A Rolldown `advancedChunks` group in the workspace's `vite.config.ts` names it
`chunks/manifest-[hash].js`, so the `size-limit` globs always match it.
`bun run lint:package` validates the package. `repository.directory` points at
the workspace. A `prepack` script copies the root `README.md` and `LICENSE` into
the workspace (gitignored there), and releases pack with `bun pm pack` from that
directory; the tarball is verified to contain `package.json`, `README.md`,
`LICENSE` and `dist`. The tag `v*` is bare, the version is checked against the
library workspace's `package.json`, and the changelog stays at the root
`CHANGELOG.md`. Publishing to npm through OIDC is unchanged
([how to cut a release](how-to/cut-a-release.md)). Rationale:
[ADR 0003](adr/0003-esm-only-and-vite-8.md).

## Dependency updates

Renovate (`renovate.json5`) opens the update pull requests, on Mondays before
12:00 UTC, and tracks them in the Dependency Dashboard issue. `@types/node` is
held below 25 to match the Node 24 runtime. A custom manager also pins the `npm`
version that the workflows install with `npm install -g npm@<version>`.

## Playground

`bun run dev` serves `index.html`, which loads `playground/main.tsx` and imports
the component straight from `src/` (all in `packages/animated-fluent-emojis`).
The page has controls for an unknown id, `fallback` (glyph, node, `null`),
`skinTone`, `playing`, a string `size` and a bad `configureEmojis` site URL that
shows the error state; edit the file to try other props, with hot reload. To
preview reduced motion, emulate the `prefers-reduced-motion` media feature in
DevTools (Rendering panel). The playground is not published and is ignored by
knip.

## Repository settings

Settings are applied by hand through the GitHub API, not by code in the repo,
and are recorded in [ADR 0001](adr/0001-public-repo-security-posture.md):
rulesets on `main` and `v*` tags, squash-only merges, linear history, signed
commits, a single `CI passed` required check, private vulnerability reporting,
immutable releases, `sha_pinning_required` and CodeQL default setup. Change the
ADR together with any setting.

Two more settings are part of the same posture:

- The `LISTS_BOT_TOKEN` secret, a fine-grained personal access token that lets
  the Sync Assets `emoji-lists` job open a pull request that CI runs on and that
  auto-merges. Setup and rotation:
  [Set up asset hosting](how-to/set-up-asset-hosting.md); rationale:
  [ADR 0017](adr/0017-personal-token-for-the-emoji-lists-pr.md).
- Actions cannot create or approve pull requests
  (`can_approve_pull_request_reviews=false`). Auto-merge stays enabled.
