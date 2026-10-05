# 0010: Versioned asset layout and live seeding

## Status

Accepted

Date: 2026-10-05

## Context

[ADR 0006](0006-cloudflare-pages-asset-hosting.md) publishes sprites under a
fixed path and busts the immutable cache with `?v=<etag>`. In practice:

- Cloudflare Pages ignores the query string, so a client holding a manifest
  cached for up to an hour can request `?v=OLD`, receive the new bytes and cache
  them under the old key, with a frame count that no longer matches.
- Every released version of the package reads the same `/manifest.slim.json`, so
  a change to its shape reaches every installed version at once.
- Every sync rebuilds all sprites from source because
  [ADR 0006](0006-cloudflare-pages-asset-hosting.md) forbids carrying build
  state between runs, and the Actions cache was removed for cache-poisoning
  reasons.

## Decision

- **A versioned layout.** The site publishes `/v1/manifest.slim.json`,
  `/v1/version.json` and `/v1/sprites/<category>/<id><tone>.<etag>.png`, plus
  `@2x` files for HD sheets. Sprite file names carry the etag, so a URL is
  immutable and the `?v=` query is dropped.
- **The legacy layout stays.** The unversioned manifest and `?v=` sprite paths
  are still emitted unchanged so installed 0.4.x versions keep working. They are
  removed in a later release, not here.
- **One generation of history.** Sprites of the previous generation whose etag
  changed stay published for one more sync, so a manifest cached just before a
  sync still resolves.
- **Seeding from the live site.** A build downloads the unchanged sprites (same
  etag, all tones and HD together) from the live `/v1/` layout instead of
  converting them again, and reuses their animation data. A missing or invalid
  live file falls back to the source. Every reused file still passes
  [ADR 0009](0009-hd-sprite-sheets-and-strict-validation.md)'s validation.

This amends ADR 0006 (cache busting and build state) and
[ADR 0008](0008-static-keyframes-and-lazy-slim-manifest.md) (the manifest
location).

### Rejected alternatives

- **Keeping `?v=`**: Pages ignores it, which is the defect.
- **The Actions cache**: its poisoning risk is the reason it was removed.
- **R2 as sprite storage**: a new service and credentials for a static site that
  already has a host.
- **A new package-level setting for the layout**: the version is part of the
  published URL, so it needs no configuration.

## Consequences

- The site holds up to three copies of the sprites (legacy, current, previous
  generation). The build fails above 19,000 files, under Pages' 20,000 limit.
- A sync without upstream changes only downloads and validates.
- The seed trusts the live site, the same root of trust as the published site
  itself; a corrupted live file is caught by validation and rebuilt from source.
- The legacy layout adds weight until a later release drops it.
