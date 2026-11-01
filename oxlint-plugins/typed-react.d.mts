import type { RuleTester } from "oxlint/plugins-dev";

/** A rule as Oxlint's `RuleTester.run` accepts it. */
type OxlintRule = Parameters<RuleTester["run"]>[1];

/**
 * Type declaration for `./typed-react.mjs`, needed because this module is
 * imported from `typed-react.test.ts` and TypeScript cannot infer types across
 * a `.ts` -> `.mjs` import without one.
 */
declare const typedReactPlugin: {
  meta: { name: string };
  rules: Record<"no-leaked-conditional-rendering", OxlintRule>;
};

export default typedReactPlugin;
