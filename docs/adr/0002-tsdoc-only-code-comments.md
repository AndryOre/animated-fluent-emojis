# 0002: TSDoc-only code comments

## Status

Accepted

Date: 2026-10-04

## Context

Free-form `//` and `/* */` comments drift out of sync with the code they
describe, and nothing requires a comment on a genuinely non-obvious export. No
core ESLint rule bans non-doc comments outright; the closest built-ins forbid
specific comment content or require documentation on top of free-form comments.

## Decision

- **TSDoc only.** Every code comment is a `/**` TSDoc block. Plain `//` line
  comments and non-JSDoc `/* */` blocks are disallowed, except for directive
  comments a tool requires (such as `eslint-disable`, which must carry a
  description).
- **TSDoc is added where it earns its place**: non-obvious exports, never
  restating a signature.
- **`eslint-plugin-jsdoc`'s `informative-docs` rule is enforced**, so a block
  that only repeats its symbol name fails lint.
- **Enforced by a local ESLint rule**, `eslint-rules/no-non-doc-comments.mjs`,
  with its own tests.

### Rejected alternatives

- **An unenforced comments policy**: a convention nothing checks drifts back
  within a few PRs.
- **`require-jsdoc` on every export**: produces boilerplate on self-explanatory
  exports.
- **TypeDoc**: unnecessary generated-docs tooling for a small library whose API
  is documented in the README.

## Consequences

- Rationale that would live in a `//` comment moves into a TSDoc block on the
  declaration it explains.
- Config files follow the same rule, so explanations live on the constant they
  describe.
- Agents and humans get a lint failure instead of a review comment when they add
  a plain comment.
