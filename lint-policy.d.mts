/**
 * Type declarations for `./lint-policy.mjs`, needed because `oxlint.config.ts`
 * imports it and TypeScript cannot infer types across a `.ts` -> `.mjs` import
 * without one.
 */
export declare const shadcnNoRestyleContracts: {
  pattern: string;
  allow: string[];
}[];

export declare const shadcnAllowedInlineProperties: string[];

export declare const shadcnAllowedUnknownClasses: string[];
