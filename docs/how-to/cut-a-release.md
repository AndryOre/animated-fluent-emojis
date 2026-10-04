# How to cut a release

Releases are manual and tag-driven. Pushing a signed `v*` tag publishes the
package to npm and creates the GitHub Release.

1. Bump the `version` field in `package.json` to the new version number.

2. In `CHANGELOG.md`, rename the `[Unreleased]` heading content into a new
   `## [x.y.z] - YYYY-MM-DD` section, leave an empty `## [Unreleased]` above it,
   and update the link references at the bottom of the file.

3. Run `bun run check` and `bun run test` to confirm everything passes.

4. Open a PR titled `chore: 🔖 release x.y.z` and merge it.

5. Tag the merge commit with a **signed** tag and push it:
   `git tag -s vX.Y.Z <merge-sha> && git push origin vX.Y.Z`. An unsigned tag is
   not acceptable. Verify a signature at any time with `git tag -v vX.Y.Z`.

## What the workflow does

Pushing the tag triggers `.github/workflows/release.yml`, which runs in the
`npm` GitHub Environment and:

1. Fails unless the tag matches the `package.json` version.
2. Runs `bun ci`, `bun run check`, `bun run test` and `bun run build`.
3. Extracts the `## [x.y.z]` section of `CHANGELOG.md` into `release-notes.md`
   and fails if it is empty.
4. Updates npm to the latest version (trusted publishing needs npm 11.5.1 or
   newer) and runs `npm publish`. Authentication uses OIDC trusted publishing,
   so no token is stored and provenance is generated automatically.
5. Creates the GitHub Release with `gh release create`, using the extracted
   notes.

`bun publish` is not used because it has no OIDC support.

## One-time npm trusted publisher setup

Configure this once on npmjs.com, under the package's **Settings**, **Trusted
Publisher**, **GitHub Actions**:

- Organization or user: `AndryOre`
- Repository: `animated-fluent-emojis`
- Workflow filename: `release.yml`
- Environment name: `npm`

Also create a GitHub Environment named `npm` in the repository settings.
