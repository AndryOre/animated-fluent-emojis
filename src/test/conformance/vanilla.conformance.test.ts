import {
  createEmoji,
  type EmojiController,
} from '../../vanilla/create-emoji.js'
import type { ConformanceDriver } from './driver.js'
import { defineConformanceSuite } from './suite.js'

defineConformanceSuite('vanilla', (): ConformanceDriver => {
  let controller: EmojiController | undefined
  return {
    mount: (container, options) => {
      controller = createEmoji(container, options)
    },
    update: (options) => {
      controller?.update(options)
    },
    unmount: () => {
      controller?.destroy()
    },
  }
})
