# 0007: Pinned official emoji ids

## Status

Accepted

Date: 2026-10-05

## Context

[ADR 0006](0006-cloudflare-pages-asset-hosting.md) publishes the Teams emoticon
catalog and adds the official emojis that Teams lacks. Official ids are derived
from the codepoints and the CLDR name, for example `1f595_middlefinger`.

Teams can later ship an emoji that was official-only. It would arrive under its
own Teams id, and rebuilding the catalog from scratch would drop the official
id. Every consumer who wrote that `id` would silently get a blank emoji after a
catalog refresh, with no change in the library version.

## Decision

- **Published official ids are pinned.** Official entries carry
  `origin: "official"` in the manifest. The build reads the previously published
  manifest and keeps every official id, re-sourced from the official repository
  by codepoints, even when Teams now covers the codepoint. The emoji then
  appears under both ids.
- **A pinned id without a source fails the build.** If the official repository
  no longer has the emoji, the sync stops with a message naming the id, and a
  maintainer decides what to do.
- **The runtime ignores `origin`.** The field is type-only, so the library
  bundle does not change.

### Rejected alternatives

- **An alias map in the manifest**: adds runtime code and a second lookup for
  every emoji to save two entries.
- **Accepting the break**: ids that worked yesterday stop rendering without any
  version bump.

## Consequences

- A few emojis can appear twice in the catalog, once per id, until the pinned id
  is removed by hand.
- The first build after this change has no previous manifest to read; the
  official ids published before it are not marked and are re-derived the same
  way, so they stay stable.
- Removing a pinned id is a deliberate, breaking change to the catalog.
