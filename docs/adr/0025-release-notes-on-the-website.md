# 0025: Release notes on the website

## Status

Accepted

Date: 2026-10-19

## Context

`CHANGELOG.md` is the single record of what changed in every release. It is
written by hand and by `sync-assets.yml`, which adds entries under
`[Unreleased]`. Readers of the site had no way to see it without going to
GitHub. Snug publishes its changelog on the site, built from the file with a
parser that fails the build when the file is malformed (its ADR 0019).

## Decision

Build a `/changelog/` page from `CHANGELOG.md`, with the file as the only
source.

- **Parser and validator**: `src/docs/release-notes.ts` parses the Keep a
  Changelog format. A heading must be `## [x.y.z] - YYYY-MM-DD` with a real
  date, or `## [Unreleased]`. A `###` section must be one of Added, Changed,
  Deprecated, Fixed, Migration, Removed or Security. A repeated version is an
  error. Every error names the offending line.
- **The build fails on a bad file**: the docs content loader reads the file on
  every build, so a file that does not parse stops `astro build`, and the unit
  tests parse the real file too.
- **Links**: footer link references (`[x.y.z]: url`) become the link on each
  version heading. Relative links in entries go through the docs link rewriter.
- **`[Unreleased]` is validated but not shown**: unreleased work appears on the
  site when it ships. This is Snug's choice, and the page never shows text that
  may still change.
- **Default layout**: the page is a Starlight docs entry with a sidebar item and
  a sitemap entry, not a custom screen.
- **English only**: release notes are not translated. Other locales render the
  English text with the missing-translation notice, like an untranslated doc.

Rejected:

- **Hand-written page**: it drifts from `CHANGELOG.md`.
- **Showing `[Unreleased]` labelled**: its entries are written before a version
  and a number exist, and `sync-assets.yml` edits them.
- **Translating release notes**: the cost is high and the text is short lived.

## Consequences

- A malformed `CHANGELOG.md` blocks the site build with a line number, so the
  release workflow cannot ship a broken page.
- Adding a section kind means editing `RELEASE_SECTIONS`.
- The changelog is the only generated entry in the docs collection; it is kept
  out of the translation status report.
