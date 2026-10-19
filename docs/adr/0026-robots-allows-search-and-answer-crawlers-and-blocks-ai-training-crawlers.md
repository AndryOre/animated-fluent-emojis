# 0026: Robots allows search and answer crawlers and blocks AI-training crawlers

## Status

Accepted

Date: 2026-10-19

## Context

`robots.txt` allowed every agent. The site wants to be found and cited by search
engines and AI assistants, but has no reason to feed model training. Snug
publishes the same split, and ADR 0023 makes Snug's practices the default.

## Decision

`robots.txt` is built from a crawler registry in `src/seo/crawlers.ts` with
three lists.

- **Search**: Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot and
  PerplexityBot. Allowed, because they decide whether the site is found.
- **Answer**: ChatGPT-User, Claude-User and Perplexity-User. Allowed, because
  they fetch a page when a person asks an assistant about it.
- **Training**: GPTBot, ClaudeBot, CCBot, Applebot-Extended and Bytespider.
  Disallowed in their own group, so the allowed groups are unaffected.

Every other agent keeps `Allow: /`. Paths contributed through
`ROBOTS_CONTRIBUTIONS` apply to the allowed groups. Snug's redirect-only
disallow paths are not ported: AFE has no redirect-only pages.

Rejected:

- **Blocking `Google-Extended`**: it also removes Gemini grounding and does not
  affect Search, so it would cost visibility for no gain.
- **Allowing everything**: it offers the site to training sets with nothing in
  return.
- **Blocking every AI agent**: it would hide the site from answers that cite it.

## Consequences

- `robots.txt` is a request, not enforcement; a crawler that ignores it is not
  stopped.
- A new crawler is one entry in `crawlers.ts`, and the unit tests cover each
  list.
- A crawler listed under two categories fails the tests.
