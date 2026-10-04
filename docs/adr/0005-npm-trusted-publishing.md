# 0005: npm trusted publishing

## Status

Accepted

Date: 2026-10-04

## Context

Publishing with a long-lived `NPM_TOKEN` secret leaves a credential that can be
leaked or abused, and produces no verifiable link between a package version and
the source commit that built it.

## Decision

- **Trusted publishing through OIDC.** `.github/workflows/release.yml` runs on a
  pushed signed `v*` tag, in the `npm` GitHub Environment, with
  `id-token: write`. npm authenticates the workflow identity, so no token is
  stored, and provenance is generated automatically.
- **`npm publish`, not `bun publish`**, because bun has no OIDC support. npm is
  upgraded in the job first, since trusted publishing needs npm 11.5.1 or newer.
- **The workflow re-validates before publishing**: tag matches `package.json`
  version, `bun run check`, `bun run test` and `bun run build` pass, and the
  matching `CHANGELOG.md` section is non-empty.
- **The GitHub Release is created by the same workflow** from the changelog
  section, and is immutable (see
  [ADR 0001](0001-public-repo-security-posture.md)).
- **The trusted publisher is configured once** on npmjs.com, as documented in
  [`docs/how-to/cut-a-release.md`](../how-to/cut-a-release.md).

### Rejected alternatives

- **A granular `NPM_TOKEN` secret**: a standing credential with no provenance.
- **Publishing manually from a laptop**: no provenance and not reproducible.
- **`semantic-release` or release-please**: automation the project does not need
  for a hand-curated changelog and a low release cadence.

## Consequences

- Only a signed tag pushed from the protected ruleset path can publish.
- A failed publish after the tag exists is fixed by a new version, since tags
  and releases are immutable.
- Renaming `release.yml` or the `npm` environment requires updating the trusted
  publisher on npmjs.com.
