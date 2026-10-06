import { createHash } from 'node:crypto'

import { THEME_STORAGE_KEY } from './theme-keys'

/**
 * Blocking inline script that applies the stored or system theme to `<html>`
 * before first paint. Its CSP hash is derived from this exact string, so edit
 * it only here.
 */
export const THEME_INIT_SCRIPT = `{const root=document.documentElement;let theme='system';try{const stored=localStorage.getItem('${THEME_STORAGE_KEY}');if(stored==='light'||stored==='dark')theme=stored}catch{theme='system'}const dark=theme==='dark'||(theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);root.classList.toggle('dark',dark);root.dataset.theme=theme}`

/**
 * CSP hash source (without quotes) for {@link THEME_INIT_SCRIPT}, in the form
 * Astro's `security.csp.scriptDirective.hashes` expects.
 */
export const THEME_INIT_HASH: `sha256-${string}` = `sha256-${createHash('sha256').update(THEME_INIT_SCRIPT).digest('base64')}`
