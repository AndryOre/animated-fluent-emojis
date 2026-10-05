# 0011: Compact slim manifest, HD frame cap and layout-aware sync

## Status

Accepted

Date: 2026-10-05

## Context

[ADR 0010](0010-versioned-asset-layout-and-live-seeding.md) defines the `/v1/`
asset layout, but the live site has never published it, and a third audit of the
core workflow found three problems that are cheap to fix only while it is still
unpublished:

- The sync decides whether to rebuild by comparing the Teams hash and the
  official repository commit. Neither changes when the layout or the pipeline
  version does, so the scheduled sync never publishes `/v1/` on its own.
- The slim manifest is 244 KB (32 KB gzipped) for 1,700 emojis, and most of that
  is repeated defaults: 1,660 emojis have `fps` 24, 1,662 have `firstFrame` 1
  and 1,378 are not `diverse`.
- [ADR 0009](0009-hd-sprite-sheets-and-strict-validation.md) sets no limit on HD
  frames. Ten HD sheets are taller than 16,384 px (the largest is 24,200 px),
  Chromium's maximum texture size, so they are likely to be downscaled and look
  blurry on the screens HD exists for.

## Decision

- **A compact v1 slim manifest.** A v1 entry omits `fps` (24), `firstFrame` (1),
  `diverse` (false) and `hd` (false) when they have their default value. The
  runtime restores them when it parses the manifest. The legacy manifest is not
  touched.
- **An HD frame cap.** An emoji gets an HD sheet only when it has at most 81
  frames, so the sheet stays within 16,200 px. Validation rejects a taller HD
  sheet. Emojis above the cap are served by the standard sheet.
- **A layout-aware sync.** The sync reads `/v1/version.json` and rebuilds when
  it is missing or its pipeline version differs from the build's. Rebuilding and
  bypassing the discovery and removal guards are separate workflow inputs, and
  the v1 smoke test always runs.

This amends [ADR 0009](0009-hd-sprite-sheets-and-strict-validation.md) (no HD
cap) and corrects ADR 0010's consequence that a sync without upstream changes
only downloads and validates: without upstream changes it publishes nothing,
unless the layout or the pipeline version changed.

### Rejected alternatives

- **Sharding the manifest by id**: it needs a store per shard and more code in a
  bundle that is already at its limit, for a file that is 32 KB gzipped.
- **2D sprite grids for tall sheets**: they change the keyframe and the frame
  maths for ten emojis.
- **A runtime fallback to the legacy layout**: it costs bundle size to guard a
  state that the release gate already prevents.
- **Leaving `force` as one input**: publishing the layout would require turning
  off the safety guards.

## Consequences

- The first sync after this change converts every sprite again, because the live
  site has no `/v1/` files to seed from.
- Ten emojis lose their HD sheet and look slightly softer on high-density
  screens.
- Changing `PIPELINE_VERSION` republishes the whole site on the next scheduled
  sync.
- The v1 manifest shape is a contract between the pipeline and the runtime; a
  change that breaks it needs a new layout version.
