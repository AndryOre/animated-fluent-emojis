# Lint parity report (wave 4, AO-2624)

Run: `bun scripts/lint-parity/run.ts --mode all` (type-aware), on Oxlint 1.90.0
with oxlint-tsgolint 7.0.2005. Baseline: the frozen
`scripts/lint-parity/eslint.baseline.config.mjs`. Candidate: `oxlint.config.ts`,
plus the minimal `eslint.config.mjs`, which now lints `.astro` files only.
Findings are compared by `(file, line, rule)`. `accepted.json` is empty.

**Gate: exit 1, with the same 8 ESLint-only findings as wave 3. None is a
missing rule: each one comes from how Oxlint handles directive comments and
cannot be fixed from the config. They are recorded below instead of being
accepted.**

## Counts

| Section  | both | ESLint-only | Oxlint-only |
| -------- | ---: | ----------: | ----------: |
| fixtures |  107 |           7 |           1 |
| repo     |   20 |           0 |           0 |
| corpus   |  895 |           1 |          30 |

The repo `both` row depends on the environment and is 0 after `bun run check`.
On a fresh checkout, `apps/site/src/home/demo.ts:125` gets
`no-redundant-type-constituents` until `packages/animated-fluent-emojis/dist` is
built. `apps/site/src/content.config.ts` and `src/docs/route-metadata.ts` get 19
`no-unsafe-*` findings until `bun run --cwd apps/site sync` generates the
`astro:content` types. Both sides report the same rows.

The repo has no Oxlint-only rows left: the wave 3 rows were the directives the
rename below cleared.

## How rule ids are compared

- Oxlint jsPlugin names map back to ESLint plugins: `unicorn-js` to `unicorn`,
  `jsdoc-js` to `jsdoc`, `react-hooks-js` to `react-hooks`, `vitest-js` to
  `vitest`, `typescript-js` to `@typescript-eslint`, `typed-react` to
  `@eslint-react`.
- A typescript-eslint extension rule with the same name as its base rule
  (`extendsBaseRule: true`) compares as the core rule on both sides. Renamed
  extensions such as `only-throw-error` keep their own id.
- Oxlint's `react` port of the react-hooks rules compares as `react-hooks/*`.
- Unused disable and enable directives compare as `unused-disable-directive`.
  Oxlint 1.90 sends them with `code: null`.
- Directives in the code now use the Oxlint alias names (`unicorn-js/...`). The
  baseline reads them through `baseline-rules/directive-aliases.mjs`, which
  renames them back to the ESLint ids on directive lines only, without moving
  lines. Without it, the frozen config reports "Definition for rule not found"
  and stops suppressing the rule.

## Gaps closed

- eslint-comments, and every other jsPlugin rule in the same file. Cause: the
  plugin reports `column: -1`, and Oxlint throws "Line/column pair translates to
  an out of range offset". Fix: `oxlint-plugins/eslint-comments.mjs` clamps the
  column to 0 and changes nothing else.
- `jsdoc/require-param` and `require-returns`. Cause: the native rule reports on
  the function line, ESLint on the comment. Fix: `jsdoc-js/*`.
- `react-hooks/exhaustive-deps`. Cause: the native rule reports one line
  earlier. Fix: `react-hooks-js/*` (`warn`).
- `unicorn/prefer-ternary`, `prefer-default-parameters`,
  `no-await-expression-member` and `filename-case`. Cause: the native rule
  misses cases or reports on other lines (`filename-case` misses files under
  `[param]` folders). Fix: `unicorn-js/*`.
- `no-meaningless-void-operator`. Cause: tsgolint misses it. Fix:
  `typescript-js/*`.
- `no-empty-object-type`, `consistent-indexed-object-style` and
  `no-unused-vars`. Cause: the native rule reports one line off, or misses
  `.d.ts` imports and catch parameters. Fix: `typescript-js/*`.
- The corpus section itself. Cause: Oxlint's `.cache` ignore skipped it, and
  ESLint exited 2 on an unmatched `.astro` glob. Fix: `PARITY_CORPUS=1` lifts
  the ignore, and the harness passes `--no-error-on-unmatched-pattern`.

All of these keep the severity and options of `eslint --print-config`. No rule
is turned off, downgraded or narrowed.

## Gaps that cannot be closed (ESLint-only)

1. Fixture line 20: `no-unlimited-disable`, `require-description` and
   `disable-enable-pair`. Under Oxlint, `/* eslint-disable */` suppresses
   jsPlugin reports from its own start offset onward, including reports on that
   comment. Under ESLint, `column: -1` keeps those reports outside the range. A
   probe shows only native `unicorn/no-abusive-eslint-disable` firing on that
   line, so an unlimited disable is still caught. Its description and pairing
   are not.
2. Fixture line 20: `unused-disable-directive`. Oxlint never reports an
   unlimited disable as unused.
3. Fixture lines 13 and 14: `unused-disable-directive`. Oxlint reports the
   unused range on its enable comment (line 15, Oxlint-only). Both sides enforce
   it, on different lines.
4. Fixture line 8: `unused-disable-directive`. Oxlint does not report the
   duplicate inner disable as unused. `no-duplicate-disable` still matches on
   both sides.
5. Corpus `shadcn-taxonomy/components/mdx-components.tsx:99`. The directive
   names `@next/next/no-img-element`, a rule neither config has. ESLint reports
   "Definition for rule not found", and Oxlint reports the directive as unused
   on the same line.

## Directive rename: done in wave 4

ESLint no longer lints `ts`, so the directives use the Oxlint names, and
`oxlint --type-aware --deny-warnings` reports 0 diagnostics on the repo once
`bun run check` has built the package and synced the site:

- `apps/site/e2e/accessibility.spec.ts`, `header-scroll.spec.ts`,
  `home-dock.spec.ts`, `home-install.spec.ts`, `home-scroll-motion.spec.ts`,
  `mobile-overflow.spec.ts` and `reduced-motion.spec.ts`:
  `unicorn/isolated-functions` to `unicorn-js/isolated-functions`.
- `packages/animated-fluent-emojis/vite.config.ts`:
  `unicorn-js/no-this-outside-of-class`.
- `packages/animated-fluent-emojis/src/element/index.ts`:
  `unicorn-js/no-top-level-side-effects`.
- No directive names a rule run through `typescript-js`. The other directives
  (`@typescript-eslint/*`, `@eslint-react/*`, native `unicorn/*`) already name
  the rules Oxlint runs.

The corpus has Oxlint-only `no-unused-vars` rows next to unused directives,
because a directive there names a rule that Oxlint now runs through
`typescript-js`.

The other Oxlint-only rows are stricter native rules (`prefer-optional-chain`,
`prefer-module` on `.js`, `react-hooks/purity`, `no-document-cookie`,
`prefer-top-level-await`), plus tsgolint `tsconfig-error` on the corpus, which
runs without types. They do not affect the gate.

## typed-react shim against ESLint

`@eslint-react/no-leaked-conditional-rendering` through the shim gives the same
results as ESLint:

- fixtures: `ZvReact.tsx` lines 13, 14 and 18 (`count`, `items.length`,
  `Number.NaN`) are `both`.
- repo: 0 findings on either side.
- corpus: `shadcn-taxonomy/components/toc.tsx:44` is `both`.

There are no Oxlint-only rows for this rule.

## Rule sources (rules enabled in at least one block)

jsPlugin 333, native 220, tsgolint 48, local 1 (`local/no-non-doc-comments`),
shim 1 (`typed-react/no-leaked-conditional-rendering`). Classification:
`unicorn-js`, `jsdoc-js`, `react-hooks-js`, `vitest-js`, `@eslint-react`,
`@eslint-community/eslint-comments`, `shadcn`, `typescript-js` and `eslint-js`
are jsPlugin. A `typescript/*` rule that requires type checking is tsgolint.
Everything else is native. Regenerate the per-rule list by loading
`oxlint.config.ts` and classifying each enabled key by prefix.
