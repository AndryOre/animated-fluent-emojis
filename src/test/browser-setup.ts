import { passthrough } from 'msw'
import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw/http'

import {
  FIXTURE_MANIFEST,
  MANIFEST_URL,
  SPRITE_URL_PATTERN,
  TRANSPARENT_PNG_BASE64,
} from './manifest-fixture.js'

/**
 * Source files such as `.svelte` are not on MSW's common-asset list, so the
 * dev server's module requests for them must be let through explicitly.
 */
const worker = setupWorker(
  http.get(/\.svelte(?:\?.*)?$/, () => passthrough()),
  http.get(MANIFEST_URL, () => HttpResponse.json(FIXTURE_MANIFEST)),
  http.get(
    SPRITE_URL_PATTERN,
    () =>
      new HttpResponse(
        Uint8Array.from(
          atob(TRANSPARENT_PNG_BASE64),
          (character) => character.codePointAt(0) ?? 0,
        ),
        { headers: { 'Content-Type': 'image/png' } },
      ),
  ),
)

await worker.start({ onUnhandledFrame: 'error', quiet: true })
