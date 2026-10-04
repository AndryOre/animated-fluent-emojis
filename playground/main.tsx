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
      <Emoji id="grinning-face" size={96} />
      <Emoji id="red-heart" size={96} playOnHover />
      <Emoji id="rocket" size={96} animationIterations="infinite" />
    </main>
  </StrictMode>,
)
