# 0015: Public files site on a second Pages project

## Status

Accepted

Date: 2026-10-06

## Context

The library serves sprite sheets, which only code can play. People who do not
write code want the emojis as ordinary files: an animated GIF to drop into a
chat, an animated WebP for a web page, a PNG for a document. They need stable,
readable URLs they can hotlink or download, one file per emoji and skin tone.

That is about 9,930 files. The asset site
([ADR 0006](0006-cloudflare-pages-asset-hosting.md)) cannot absorb them: it is
laid out for the runtime, and its file count is better kept small. Two hosts
were considered for the new files:

- **Cloudflare R2**: zero egress and no file cap, but it needs a custom domain
  and explicit cache rules before it serves anything usefully, and it adds a
  bucket and credentials to run.
- **A second Cloudflare Pages project**: free, unlimited bandwidth, and 20,000
  files on the Free plan, so about 9,930 fit with room to grow. It deploys the
  same way as the asset site.

## Decision

Publish the files from a second Cloudflare Pages project, the files site, built
by `scripts/assets/files-site.ts` from the output of the asset build and
deployed by `sync-assets.yml` after the asset deploy. R2 is not used. The
builder fails when the file count approaches the Free plan cap.

The three sites live on custom domains:

| Domain                                      | Serves                                        |
| ------------------------------------------- | --------------------------------------------- |
| `animated-fluent-emojis.andryore.dev`       | The landing site, out of scope here           |
| `animated-fluent-emojis-cdn.andryore.dev`   | The asset site, the library's new default URL |
| `animated-fluent-emojis-files.andryore.dev` | The files site                                |

The previous `pages.dev` host of the asset site keeps working, so existing
installs do not break. A consumer with a strict Content Security Policy must
allow the cdn domain.

Public file URLs use a slug, not the catalog id: `/gif/<slug>.gif`,
`/webp/<slug>.webp` and `/png/<slug>.png`, plus `/index.json`, `/version.json`
and the license and notice files. Skin tones add `-light`, `-medium-light`,
`-medium`, `-medium-dark` or `-dark`. Slugs are kebab-case descriptions, frozen
in a committed registry, `scripts/assets/public-slugs.json`. A frozen slug never
changes, a collision gets `-2`, `-3`, and a slug whose emoji disappears stays
reserved, so a URL once published is never pointed at another emoji. Each sync
merges the live public `index.json` into the committed registry through the
lists pull request, not the files build, which reads the committed registry
alone, and a conflict aborts that run.

Files are encoded with sharp from the existing sprite sheets, the HD sheet when
the emoji has one and the 100px sheet otherwise, with deterministic settings so
an unchanged emoji produces identical bytes. The PNG is the poster frame.

Licensing: every emoji is offered for download, together with a license and a
notice file and Microsoft attribution. The artwork is Microsoft's; the project
never describes the files as "free to use" and follows `docs/brand/voice.md`.

## Consequences

- The deploy gains a second project and a second custom domain to maintain, and
  the files site depends on the asset build finishing first.
- Public URLs are a contract: the registry is committed, and changing a slug is
  a breaking change for anyone hotlinking it.
- The library default URL changes to the cdn domain; the CSP note goes in the
  changelog.
- If the catalog outgrows 20,000 files, the builder fails loudly and the
  fallback is R2 or a paid plan, which would supersede this ADR.
- `CONTEXT.md` defines public file, files site, slug and public index.
