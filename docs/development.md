# Development

## Setup

```sh
bun install
bunx playwright install chromium
```

Bun `>=1.4.2` is required (see `engines` in `package.json`). Husky installs the
git hooks on `bun install` through the `prepare` script.

## Scripts

| Script                  | What it does                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `bun run dev`           | Starts the Vite dev server serving the playground.                                                     |
| `bun run build`         | Type-checks (`tsc -b`) and builds the library with Vite. Slow; run only if asked.                      |
| `bun run check`         | Aggregate gate: format:check, lint, typecheck, knip, lint:package.                                     |
| `bun run fix`           | Aggregate autofix: format:write, lint:fix, typecheck.                                                  |
| `bun run format:check`  | Checks formatting with Prettier (no writes).                                                           |
| `bun run format:write`  | Formats the repository with Prettier.                                                                  |
| `bun run lint`          | Runs ESLint with `--max-warnings=0` (cached).                                                          |
| `bun run lint:fix`      | Runs ESLint with `--fix`.                                                                              |
| `bun run typecheck`     | Runs `tsc -b`.                                                                                         |
| `bun run knip`          | Finds unused files, exports and dependencies.                                                          |
| `bun run lint:package`  | Builds, then runs `publint --strict` and `attw --profile esm-only`.                                    |
| `bun run size`          | Checks bundle and stylesheet sizes against `size-limit`. Needs a prior build.                          |
| `bun run test`          | Runs the Vitest suite once (browser and node projects).                                                |
| `bun run test:watch`    | Runs Vitest in watch mode.                                                                             |
| `bun run test:coverage` | Runs Vitest with v8 coverage and enforces the thresholds.                                              |
| `bun run lint:docs`     | Runs lychee over the docs with the same arguments as `lint-docs.yml`.                                  |
| `bun run lint:commits`  | Runs commitlint over the commits since `origin/main`, like the CI job.                                 |
| `bun run assets:detect` | Reports whether the published asset site is out of date (Teams manifest or official repository).       |
| `bun run assets:build`  | Builds the manifest and sprites into `dist-assets/`; needs `ffmpeg`. Add `-- --limit 20` for a sample. |
| `bun run assets:lists`  | Regenerates `docs/EMOJI_LIST_*.md` from `dist-assets/manifest.json`.                                   |
| `bun run ci:local`      | Runs the CI pipeline locally: install, commits, docs, check, coverage, build, size.                    |

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
- **Test**: Vitest browser mode with coverage; uploads a test report.
- **Package**: build, `publint`, `attw`, size limit and a size report.
- **Commitlint**: validates the PR's commit messages.
- **CI passed**: aggregates the jobs above; it is the single required status
  check.

`sync-assets.yml` runs weekly (and on demand) outside the PR pipeline: it
detects new emoji versions, rebuilds and deploys the asset site to Cloudflare
Pages, smoke tests the published manifest and a sprite, and opens a pull request
with the regenerated emoji lists. A failed run opens or updates a single
`sync-assets failing` issue. Setup:
[`how-to/set-up-asset-hosting.md`](how-to/set-up-asset-hosting.md); recovery:
[`how-to/roll-back-the-asset-site.md`](how-to/roll-back-the-asset-site.md).

Other workflows: `lint-docs.yml` (offline link and anchor check with lychee),
`lint-workflows.yml` (workflow linting), `lint-pr.yml` (PR title), `labels.yml`
(label sync), `scorecard.yml` (OpenSSF Scorecard) and `release.yml` (see
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

Vitest has two projects (`vitest.config.ts`):

- **`browser`**: `src/components/**` and `src/hooks/**` tests run in headless
  Chromium through Playwright, with MSW mocking the slim manifest request
  (`src/test/browser-setup.ts`). The manifest is fetched lazily, so a test that
  needs a fresh load resets the module state first. Run
  `bunx playwright install chromium` once.
- **`node`**: `src/utils/**`, `src/test/**`, `eslint-rules/**`, `docs/adr/**`
  and `scripts/**` tests.

`src/test/coverage-manifest.test.ts` fails when a source module has no test and
no documented exemption. Rationale: [ADR 0004](adr/0004-vitest-browser-mode.md).

## Packaging

The package is ESM-only with an `exports` map for the entry and `style.css`.
`bun run lint:package` validates it. Rationale:
[ADR 0003](adr/0003-esm-only-and-vite-8.md).

## Playground

`bun run dev` serves `index.html`, which loads `playground/main.tsx` and imports
the component straight from `src/`. Edit that file to try ids, sizes and props,
with hot reload. The playground is not published and is ignored by knip.

## Repository settings

Settings are applied by hand through the GitHub API, not by code in the repo,
and are recorded in [ADR 0001](adr/0001-public-repo-security-posture.md):
rulesets on `main` and `v*` tags, squash-only merges, linear history, signed
commits, a single `CI passed` required check, private vulnerability reporting,
immutable releases, `sha_pinning_required` and CodeQL default setup. Change the
ADR together with any setting.
