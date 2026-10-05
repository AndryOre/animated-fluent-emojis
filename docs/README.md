# Documentation index

An index of every document in this repository.

## Core

- [`README.md`](../README.md): user-facing portal with install and usage.
- [`usage.md`](usage.md): the full API: props, playback, fallback, preloading,
  asset site, lookup and types.
- [`troubleshooting.md`](troubleshooting.md): fixes for common problems, by
  symptom.
- [`CHANGELOG.md`](../CHANGELOG.md): release notes, newest first.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md): contribution setup, branch and commit
  format, merging and CI.
- [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md): community standards.
- [`GOVERNANCE.md`](../GOVERNANCE.md): decision process and project continuity.
- [`ROADMAP.md`](../ROADMAP.md): project direction.
- [`SECURITY.md`](../.github/SECURITY.md): how to report vulnerabilities.
- [`security.md`](security.md): the security design and assurance case.
- [`AGENTS.md`](../AGENTS.md): instructions for coding agents (`CLAUDE.md`
  imports it).

## Development

- [`development.md`](development.md): setup, scripts, git hooks, CI,
  conventions, testing, playground and repository settings.
- [`architecture.md`](architecture.md): code map of the component, hooks,
  manifest, animation, asset pipeline and CSS.
- [`how-to/cut-a-release.md`](how-to/cut-a-release.md): releasing and the npm
  trusted publisher setup.
- [`how-to/set-up-asset-hosting.md`](how-to/set-up-asset-hosting.md): creating
  the Cloudflare Pages project and the secrets behind the asset site.
- [`how-to/roll-back-the-asset-site.md`](how-to/roll-back-the-asset-site.md):
  restoring an earlier asset site deployment.

## How-to guides

- [`how-to/README.md`](how-to/README.md): index of the how-to guides.
- [`how-to/self-host-the-assets.md`](how-to/self-host-the-assets.md): serving
  the asset site from your own origin, with the CSP.
- [`how-to/use-with-nextjs.md`](how-to/use-with-nextjs.md): the client boundary,
  stylesheet and preloading in Next.js.
- [`how-to/preload-for-a-picker.md`](how-to/preload-for-a-picker.md): warming
  the manifest and sprite sheets for an emoji picker.

## Architecture decision records

- [`adr/README.md`](adr/README.md): ADR index and status table.
- [`adr/0001-public-repo-security-posture.md`](adr/0001-public-repo-security-posture.md)
- [`adr/0002-tsdoc-only-code-comments.md`](adr/0002-tsdoc-only-code-comments.md)
- [`adr/0003-esm-only-and-vite-8.md`](adr/0003-esm-only-and-vite-8.md)
- [`adr/0004-vitest-browser-mode.md`](adr/0004-vitest-browser-mode.md)
- [`adr/0005-npm-trusted-publishing.md`](adr/0005-npm-trusted-publishing.md)
- [`adr/0006-cloudflare-pages-asset-hosting.md`](adr/0006-cloudflare-pages-asset-hosting.md)
- [`adr/0007-pinned-official-emoji-ids.md`](adr/0007-pinned-official-emoji-ids.md)
- [`adr/0008-static-keyframes-and-lazy-slim-manifest.md`](adr/0008-static-keyframes-and-lazy-slim-manifest.md)
- [`adr/0009-hd-sprite-sheets-and-strict-validation.md`](adr/0009-hd-sprite-sheets-and-strict-validation.md)
- [`adr/0010-versioned-asset-layout-and-live-seeding.md`](adr/0010-versioned-asset-layout-and-live-seeding.md)
- [`adr/0011-compact-slim-manifest-and-hd-frame-cap.md`](adr/0011-compact-slim-manifest-and-hd-frame-cap.md)
- [`adr/0012-brand-kit-in-docs-brand.md`](adr/0012-brand-kit-in-docs-brand.md)
- [`adr/0013-relicense-to-mit.md`](adr/0013-relicense-to-mit.md)

## Brand

- [`brand/README.md`](brand/README.md): the brand kit, with the brief, naming,
  voice, copy, logo, tokens and brand book.

## Agent workflow

- [`agents/domain.md`](agents/domain.md): domain docs layout.
- [`agents/issue-tracker.md`](agents/issue-tracker.md): the Linear tracker.
- [`agents/triage-labels.md`](agents/triage-labels.md): triage label vocabulary.
- [`agents/forge.md`](agents/forge.md): `/forge` operational specifics.

## Emoji reference

- [`EMOJI_LIST.md`](EMOJI_LIST.md): index of all emojis, linking one list per
  category.
