# Architecture decision records

Decisions are recorded in
[Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions):
`# NNNN: Title`, then `## Status` with a `Date: YYYY-MM-DD` line, `## Context`,
`## Decision` (with the options that were rejected) and `## Consequences`.
`adr-invariants.test.ts` enforces the header format, unique contiguous numbers,
and that this index lists every ADR.

To add one, copy the next number, write the file, and add a row below. Never
rewrite an accepted ADR; supersede or amend it with a new one and fill the last
column.

| Number | Title                                                                                                          | Status   | Superseded or amended by |
| ------ | -------------------------------------------------------------------------------------------------------------- | -------- | ------------------------ |
| 0001   | [Public repo security posture](0001-public-repo-security-posture.md)                                           | Accepted | -                        |
| 0002   | [TSDoc-only code comments](0002-tsdoc-only-code-comments.md)                                                   | Accepted | -                        |
| 0003   | [ESM-only and Vite 8](0003-esm-only-and-vite-8.md)                                                             | Accepted | -                        |
| 0004   | [Vitest Browser Mode](0004-vitest-browser-mode.md)                                                             | Accepted | 0008                     |
| 0005   | [npm trusted publishing](0005-npm-trusted-publishing.md)                                                       | Accepted | -                        |
| 0006   | [Cloudflare Pages asset hosting](0006-cloudflare-pages-asset-hosting.md)                                       | Accepted | 0007, 0009, 0010         |
| 0007   | [Pinned official emoji ids](0007-pinned-official-emoji-ids.md)                                                 | Accepted | -                        |
| 0008   | [Static sprite keyframes and a lazy slim manifest](0008-static-keyframes-and-lazy-slim-manifest.md)            | Accepted | 0010                     |
| 0009   | [HD sprite sheets, content-hashed etags and strict validation](0009-hd-sprite-sheets-and-strict-validation.md) | Accepted | -                        |
| 0010   | [Versioned asset layout and live seeding](0010-versioned-asset-layout-and-live-seeding.md)                     | Accepted | -                        |
