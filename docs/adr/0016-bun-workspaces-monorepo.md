# 0016: Bun-workspaces monorepo

## Status

Accepted

Date: 2026-10-06

## Context

The repo was one package. Configs, scripts and CI were hardcoded to root paths,
and a single `devDependencies` list served the library, the asset pipeline and
the brand tools. The pipeline imported the library's types by relative path. A
landing and docs site is coming next ([ADR 0015](0015-public-files-site.md)
reserves the domain) and would have been a third consumer of the same root.

## Decision

Use bun workspaces (`apps/*`, `packages/*`) with a bun catalog for the versions
shared across workspaces. The root keeps tooling only.

| Workspace                         | Role                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/animated-fluent-emojis` | The one published package: same name, exports, peers and version as before                  |
| `apps/assets`                     | Private asset pipeline; depends on `animated-fluent-emojis: workspace:*` as a devDependency |

The `workspace:*` edge exists so Turborepo hashes it: a library change
invalidates the pipeline. The pipeline imports the library's manifest types only
as type-only relative imports.

`bunfig.toml` sets `linker = "isolated"` explicitly. It was proven with the
Vitest browser, node and astro projects and needed no fallback. The lockfile was
already `configVersion: 1`, which would have defaulted to isolated silently. If
it ever breaks, the fallback order is a narrow `publicHoistPattern`, then
`hoisted`.

Turborepo orchestrates the tasks:

- Local cache only, and `--affected` on pull requests only.
- Root tasks are never filtered.
- A `transit` task makes a library change invalidate its dependents.
- `bun.lock` is a global dependency.
- `turbo prune` is not used, because it is unreliable with `bun.lock`.

Root scripts keep their names and fan out through turbo, so `bun run check` and
`bun run test` work as before. Releases keep the bare `v*` tags and the root
`CHANGELOG.md`. The tarball is packed from the library directory, where
`prepack` copies the root README and LICENSE in (npm shows the README of the
package directory, not the repo root), and the release verifies the tarball
contents.

### Rejected options

- **One package per framework**: already rejected in
  [ADR 0014](0014-multi-framework-support.md). The release workflow, npm OIDC
  ([ADR 0005](0005-npm-trusted-publishing.md)), size-limit and publint would
  multiply.
- **`bun --filter` alone**: no cache and no affected filtering.
- **Nx**: heavy for one maintainer, and it broke on the bun lockfile v2 in the
  sibling repo snug. moon was rejected for the same weight.
- **Changesets and per-package tags**: there is a single publishable package.
- **`examples/*` workspaces**: the conformance suite and the astro Vitest
  project already cover the adapters. Revisit with the landing.
- **`hoisted` as the default linker**: it permits phantom dependencies.

## Consequences

- A workspace script named like a turbo task (`build`, `check`, `test`) makes
  `turbo run <task>` execute it everywhere, so the pipeline scripts are named
  `sync:*`.
- `bun run --cwd` changes the working directory, so any path passed through must
  be absolute (the sync-assets lists job).
- Root coverage thresholds are 94/95/87/94 (lines/functions/branches/statements)
  because the root report no longer includes the pipeline. The library and
  `apps/assets` keep 95/95/90/95.
- The coverage manifest is `scripts/coverage-manifest.test.ts`, with one
  exemption list keyed by repo-relative paths.
- Agent instructions split into a tooling-only root `AGENTS.md` and one per
  workspace.
- The landing site will be a third workspace later.
- The browser conformance test "shows a sized, hidden placeholder, then the
  ready image" can flake under heavy host load.
