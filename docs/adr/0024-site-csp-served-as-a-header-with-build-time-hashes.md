# 0024: Site CSP served as a header with build-time hashes

## Status

Accepted

Date: 2026-10-19

## Context

The site's real Content-Security-Policy was Astro's `<meta>` CSP, while nginx
sent only `frame-ancestors` and `upgrade-insecure-requests` as a header. A meta
policy cannot express `frame-ancestors`, applies only after the parser reaches
it, and cannot carry `require-trusted-types-for`. The hashes of Starlight's
inline scripts were also copied by hand into `astro.config.ts`, guarded only by
the distribution audit test, so a Starlight upgrade could break the site until
the audit ran.

Snug, the sibling project, serves the policy as a header with hashes rendered
from its build output.

## Decision

Serve the whole policy as an HTTP header whose script hashes are rendered from
`dist` during the Docker build.

- **Astro still emits the hashes**: `security.csp` stays in `astro.config.ts` as
  the source of truth for Astro-managed scripts, the theme init script and
  Starlight's inline scripts. The Starlight hashes are computed from the
  installed package by `src/docs/starlight-inline-hashes.ts`, with no hard-coded
  values.
- **Render step**: `src/scripts/render-security-headers.ts` reads every built
  page, hashes every executable inline script, fails the build when one is not
  in the hashes Astro declared, writes `docker/security-headers.conf` with the
  `__SCRIPT_HASHES__` placeholder filled, and strips the CSP `<meta>` from the
  pages. The unhashed-script rule lives in `src/scripts/security-headers.ts` and
  is covered by unit tests. It is generic over every inline script, so later
  inline scripts need no list edit.
- **Trusted Types**: the header adds `require-trusted-types-for 'script'`, and
  the docs header registers a `default` policy
  (`src/docs/search-trusted-types.ts`) that lets only `<mark>` markup and the
  same-origin Pagefind worker through.
- **Per-path CORP**: `Cross-Origin-Resource-Policy` is `same-origin` except for
  `/og/`, which social crawlers and other sites embed.
- **security.txt**: `/.well-known/security.txt` is built from the repository URL
  and `.github/SECURITY.md` (RFC 9116), with a 180 day expiry set at build time.
- The container smoke test asserts the header, the absence of a meta policy, the
  Trusted Types directive, the CORP split and `security.txt`.

Rejected:

- **Keep the meta CSP**: it cannot enforce `frame-ancestors` or Trusted Types.
- **`unsafe-inline` for scripts**: it defeats the policy.
- **Hash list by hand in nginx**: it drifts from the build output.

## Consequences

- The built `dist` still contains the meta CSP, so the distribution audit and
  `test:dist` keep checking that every inline script is hashed; only the image
  served by nginx drops it.
- Local previews (`astro preview`) and the e2e suite serve the meta policy, not
  the header; the container smoke test is the check for the header.
- A new inline script is allowed automatically when Astro declares its hash and
  blocks the Docker build when it does not.
- A Starlight upgrade that changes an inline script is picked up without edits.
