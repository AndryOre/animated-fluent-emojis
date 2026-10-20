# 0006: Cloudflare Pages asset hosting

## Status

Accepted

Date: 2026-10-05 Revised: 2026-10-21, host is the cdn custom domain with
`pages.dev` kept, generator lives in `apps/assets`, etag is in the sprite file
name

## Context

The component loads `manifest.json` and one sprite sheet per emoji at runtime.
They were served from a custom domain backed by an R2 bucket. The domain lapsed,
so every published version stopped rendering emojis.

The project needs a host that costs nothing however much traffic it gets, is
fast through a CDN, and keeps binaries out of the git history (the full catalog
is about 290 MB).

## Decision

- **Cloudflare Pages.** The project is served from
  `animated-fluent-emojis.pages.dev` and, as the library's default URL, from the
  custom domain `animated-fluent-emojis-cdn.andryore.dev`
  ([ADR 0015](0015-public-files-site.md)). Static asset requests and bandwidth
  are unmetered on the free plan, and a direct upload keeps the sprites out of
  the repository.
- **The catalog is generated, never committed.** `apps/assets` builds the site:
  the Teams emoticon manifest is the base, so ids stay stable, and the 40 emojis
  that Teams lacks come from the MIT-licensed
  [`microsoft/fluentui-emoji-animated`](https://github.com/microsoft/fluentui-emoji-animated)
  repository, converted to the same sprite layout.
- **Skin tones are part of the catalog.** Teams ships `_s2` to `_s6` variants
  for diverse emojis and the official repository ships the same five tones; both
  are published next to the default sprite and selected with the `skinTone`
  prop.
- **Updates are automatic and stateless.** `sync-assets.yml` runs weekly, probes
  the Teams manifest hashes (known, advertised by the Teams web client and by
  its public config service) and the official repository head, and rebuilds only
  when either differs from the `/v1/version.json` published on the site.
- **Sprite URLs carry the emoji `etag`**, so the year-long immutable cache never
  serves a stale sprite after Microsoft updates one. The etag was first a `?v=`
  query; Pages ignores it, so it is now part of the file name
  ([ADR 0010](0010-versioned-asset-layout-and-live-seeding.md)).

### Rejected alternatives

- **`raw.githubusercontent.com`**: five-minute cache, rate limits and not meant
  for production traffic.
- **jsDelivr over the repository or an npm package**: the 50 MB (GitHub) and 150
  MB (npm) package limits are below the catalog size.
- **Committing the sprites**: a 290 MB repository that grows with every update.
- **Hotlinking the Teams CDN**: undocumented paths that Microsoft can change or
  block without notice.
- **R2 with a custom domain**: a yearly domain cost and a single point of
  failure that already failed once.

## Consequences

- Only the official-repository emojis are MIT licensed; the Teams sprites are
  Microsoft assets with no published license. The README states this, and the
  site ships the MIT notice in `LICENSE-fluentui-emoji-animated.txt`.
- The first deployment and the Cloudflare secrets are set up by hand, as
  documented in
  [`docs/how-to/set-up-asset-hosting.md`](../how-to/set-up-asset-hosting.md).
- Renaming the Pages project changes `--project-name` in `sync-assets.yml`.
  Changing the custom domain changes the default URL in
  `packages/animated-fluent-emojis/src/utils/emoji-manifest.ts` and `SITE_URL`
  in `sync-assets.yml`.
- Microsoft only publishes new Teams manifests once or twice a year, so a weekly
  check is enough.
