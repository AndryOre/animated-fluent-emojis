# 0001: Public repo security posture

## Status

Accepted

Date: 2026-10-04

## Context

`animated-fluent-emojis` is a published npm library maintained by one person.
The repository is moving from private to public, and its supply chain (GitHub
Actions, npm publishing, dependencies) is the main attack surface. The settings
below follow the OpenSSF SCM best-practices guide and OpenSSF Scorecard checks,
and mirror the posture of the sibling `snug` repository.

The settings are applied once by the maintainer through the GitHub API (ticket
AO-1195) after the workflows and docs land, not by a committed script.

## Decision

### Adopted

- **Repository rulesets** on `main` (no bypass actors) and on `v*` tags, instead
  of classic branch protection. The `main` ruleset blocks deletion and
  force-pushes, requires a pull request, linear history, signed commits and the
  `CI passed` status check. The `v*` ruleset blocks tag deletion, updates and
  non-fast-forward changes, so a published tag cannot be moved.
- **0 required approvals** on the pull-request rule. A solo maintainer cannot
  approve their own PR, and 1+ approvals would force a bypass actor, which
  Scorecard's Branch-Protection check counts as admins not being enforced.
- **Squash-only merges** with linear history. The PR title becomes the commit
  message, which keeps `main` readable and the changelog derivable.
- **Signed commits.** GitHub signs squash merges made on the web, and release
  tags are signed locally (`git tag -s`).
- **A single required check, `CI passed`**, the aggregator job in `ci.yml`.
  Adding or renaming CI jobs never requires touching the ruleset.
- **Every PR runs the full CI gate**, including docs-only changes (no
  `paths-ignore`).
- **Private vulnerability reporting (PVR)** enabled, as described in
  [`SECURITY.md`](../../.github/SECURITY.md).
- **Immutable releases**, so a published GitHub Release and its assets cannot be
  edited or replaced.
- **`sha_pinning_required`** in the Actions settings, so every `uses:` must
  reference a full commit SHA. Renovate keeps the pins current.
- **Restrictive fork-PR workflow approval**, and read-only default
  `GITHUB_TOKEN` permissions.
- **CodeQL default setup** for `javascript-typescript`, enabled in the
  repository security settings rather than through a workflow file. Findings
  surface in code scanning and are not a required check.
- **OpenSSF Scorecard** on a schedule and on push to `main`
  (`.github/workflows/scorecard.yml`), published with a README badge. Not a
  required check.

### Rejected

- **CodeQL advanced setup (a custom workflow)**: the default setup covers this
  codebase, and a workflow file is one more pinned action to maintain.
- **`actions/dependency-review-action`**: GitHub's dependency graph does not
  parse `bun.lock`, so it would only see ranges from `package.json`.
- **`step-security/harden-runner`**: a third-party root-level agent in every
  job, for a repository with no runtime secrets and already-pinned actions.
- **A merge queue**: unavailable on personal-account repositories and
  unnecessary for a solo maintainer.
- **Required code-owner review**: no benefit with a single owner.
- **Dependabot alerts and security updates**: Renovate is the single source of
  dependency updates.
- **Classic branch protection**: cannot express tag rules, and rulesets are the
  supported replacement.

## Consequences

- A solo maintainer can still merge their own PRs, but only through a PR. Direct
  pushes to `main` are blocked for everyone, admin included.
- Scorecard's score is expected to land around 5-7/10. Checks that need a second
  reviewer or contributor (Code-Review, Contributors, Fuzzing) are inherent to
  the solo constraint and are not treated as work items.
- Docs-only PRs spend CI minutes on the full pipeline. This is deliberate.
- Because releases are immutable and tags are protected, a bad release is fixed
  by publishing a new version, never by editing the old one.
- See
  [`docs/development.md#repository-settings`](../development.md#repository-settings)
  for the operational summary.
