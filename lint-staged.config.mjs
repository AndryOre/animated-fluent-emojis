const config = {
  '*.{js,jsx,ts,tsx,mjs,astro}': [
    'bunx oxfmt --write --no-error-on-unmatched-pattern',
    'bunx eslint --fix --max-warnings=0 --no-warn-ignored',
  ],
  '*.{json,json5,md,css,yml,yaml}': [
    'bunx oxfmt --write --no-error-on-unmatched-pattern',
  ],
}

export default config
