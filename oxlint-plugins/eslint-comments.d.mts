import type { RuleTester } from "oxlint/plugins-dev";

/** A rule as Oxlint's `RuleTester.run` accepts it. */
type OxlintRule = Parameters<RuleTester["run"]>[1];

/**
 * Type declaration for `./eslint-comments.mjs`, needed because this module is
 * imported from `eslint-comments.test.ts` and TypeScript cannot infer types
 * across a `.ts` -> `.mjs` import without one.
 */
declare const eslintCommentsPlugin: {
  meta: { name: string };
  rules: Record<"require-description" | "no-unlimited-disable", OxlintRule> &
    Record<string, OxlintRule>;
};

export default eslintCommentsPlugin;
