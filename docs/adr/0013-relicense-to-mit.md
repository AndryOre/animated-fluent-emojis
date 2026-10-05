# 0013: Relicense to MIT

## Status

Accepted

Date: 2026-10-06

## Context

The code was licensed under ISC because that is the default `npm init` writes,
not because anyone chose it. No ADR records it. Andry Orellana is the sole
author, so no other copyright holder has to agree. ISC and MIT grant the same
permissions; MIT is the license people recognize on sight, and the sister
repositories snug and streamboss already use it.

## Decision

Relicense the code from ISC to MIT, starting with the next release. `LICENSE`
holds the MIT text and `package.json` declares `"license": "MIT"`.

Versions up to and including 0.5.2 stay under ISC, as published. Keeping ISC and
adding a dual license was rejected: it adds a second notice for no extra
permission.

The artwork is unaffected. It remains Microsoft's, as described in
[ADR 0006](0006-cloudflare-pages-asset-hosting.md).

## Consequences

- One license across the author's repositories.
- Consumers of 0.5.2 and earlier keep the ISC grant they received.
- Docs and brand copy say "MIT"; the competitors snapshot keeps its dated ISC
  line with a note.
