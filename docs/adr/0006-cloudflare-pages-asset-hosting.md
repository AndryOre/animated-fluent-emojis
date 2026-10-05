# 0006: Cloudflare Pages asset hosting

## Status

Accepted

Date: 2026-10-05

## Context

The component loads `manifest.json` and one sprite sheet per emoji at runtime.
They were served from a custom domain backed by an R2 bucket. The domain lapsed,
so every published version stopped rendering emojis.

The project needs a host that costs nothing however much traffic it gets, is
fast through a CDN, and keeps binaries out of the git history (the full catalog
is about 290 MB).

## Decision

- **Cloudflare Pages on `animated-fluent-emojis.pages.dev`.** Static asset
  requests and bandwidth are unmetered on the free plan, there is no domain to
  renew, and a direct upload keeps the sprites out of the repository.
- **The catalog is generated, never committed.** `scripts/assets` builds the
  site: the Teams emoticon manifest is the base, so ids stay stable, and the 40
  emojis that Teams lacks come from the MIT-licensed
  [`microsoft/fluentui-emoji-animated`](https://github.com/microsoft/fluentui-emoji-animated)
  repository, converted to the same sprite layout.
- **Skin tones are part of the catalog.** Teams ships `_s2` to `_s6` variants
  for diverse emojis and the official repository ships the same five tones; both
  are published next to the default sprite and selected with the `skinTone`
  prop.
- **Updates are automatic and stateless.** `sync-assets.yml` runs weekly, probes
  the Teams manifest hashes (known, advertised by the Teams web client and by
  its public config service) and the official repository head, and rebuilds only
  when either differs from the `version.json` published on the site.
- **Sprite URLs carry the emoji `etag`** as `?v=`, so the year-long immutable
  cache never serves a stale sprite after Microsoft updates one.

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
- Renaming the Pages project changes the base URL in
  `src/utils/emoji-manifest.ts` and in `sync-assets.yml`.
- Microsoft only publishes new Teams manifests once or twice a year, so a weekly
  check is enough.
