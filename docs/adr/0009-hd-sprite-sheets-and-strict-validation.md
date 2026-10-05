# 0009: HD sprite sheets, content-hashed etags and strict validation

## Status

Accepted

Date: 2026-10-05

## Context

[ADR 0006](0006-cloudflare-pages-asset-hosting.md) publishes 100px sprite
sheets. They look soft on high-density screens, and the pipeline had weaknesses
that only showed up in the browser:

- Frame rates were rounded to integers, so animations ran slightly fast or slow.
- Etags were derived from source identifiers alone. A change in how sprites are
  converted left the same `?v=` on different bytes, so the immutable cache could
  serve a stale sheet.
- A sheet with the wrong size or frame count was published and only noticed as a
  broken emoji.

## Decision

- **HD sheets from the official repository.** For every catalog emoji, Teams or
  official, whose codepoints match an official emoji, the pipeline builds an
  `@2x` sheet with 200px frames from the official APNG, published next to the
  standard one. The slim manifest flags these emojis with `hd: true` and the
  component adds a `srcSet`. Emojis with no official counterpart stay 1x.
- **Frame parity.** The HD sheet must have exactly the standard sheet's frame
  count, so one animation entry serves both. For a Teams emoji this compares the
  Teams 1x sheet with the official 2x sheet; on a mismatch HD is skipped and
  logged.
- **All tones or none.** An emoji is published with HD only when every skin tone
  has an HD source; otherwise it is skipped, listed in the build summary, and
  stays 1x.
- **Content-hashed etags with a pipeline version.** The etag of every sprite the
  pipeline converts is a hash of `PIPELINE_VERSION` and the source identifiers
  (the blob SHAs of the sources; for HD emojis also each tone's HD source). One
  etag is the `?v=` of both the 1x and the 2x URL. Teams-only emojis without HD
  keep the etag Teams publishes, since their sprites are not converted here.
  Bump `PIPELINE_VERSION` whenever sprite conversion changes so every converted
  URL changes at once.
- **Strict build validation.** Before publishing, `validate.ts` checks every
  animation (`framesCount` an integer of at least 1, `firstFrame` within
  `[1, framesCount]`, a positive `fps`), every URL segment, and every file: not
  empty, one frame wide and `framesCount` frames tall (100px frames, 200px for
  HD), and the same frame count across an official emoji's tones. The `hd` flag
  must match the files. Any problem fails the build with a list of all of them.
- **Exact fps.** `fps` is the ratio reported by ffprobe (for example `143/6`),
  not a rounded integer, with the base rate and then 24 fps as fallbacks.

This amends ADR 0006: sprites are no longer only 100px, and the `?v=` etag is
now a content hash.

### Rejected alternatives

- **Upscaling the 100px sheets**: bigger files with no extra detail.
- **A separate `hd` manifest**: a second request to save a boolean per emoji.
- **Warning instead of failing on invalid sheets**: a warning in a weekly job
  that nobody reads, and the invalid sheet reaches users.
- **Rounding fps to keep the manifest short**: a visible speed error on
  fractional-rate sources.

## Consequences

- The first build with this pipeline changes the etag of every converted sprite,
  so those URLs change once.
- The asset site grows by the HD sheets.
- A catalog problem blocks the weekly publish until a maintainer fixes it, which
  is intended: the previous site stays live.
- Changing conversion code without bumping `PIPELINE_VERSION` can still serve
  stale sprites; reviewers check for it.
