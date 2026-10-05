import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Emoji } from '../src/index.js'

const rootElement = document.querySelector('#root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <main style={{ display: 'flex', gap: 24, padding: 24 }}>
      <Emoji id="1f603_grinningfacewithbigeyes" size={96} />
      <Emoji id="1f44b_wavinghand" size={96} playOnHover skinTone="medium" />
      <Emoji id="launch" size={96} animationIterations="infinite" />
    </main>
  </StrictMode>,
)
