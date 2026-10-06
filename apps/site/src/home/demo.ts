import type { SkinTone } from 'animated-fluent-emojis/react'

export const DEMO_SIZES = [32, 64, 96, 128] as const

type DemoSize = (typeof DEMO_SIZES)[number]

export type DemoPlayId = 'hover' | 'load'

export interface DemoState {
  size: DemoSize
  tone: SkinTone
  play: DemoPlayId
}

export type DemoToneId = 'default' | 'light' | 'medium' | 'dark'

export const DEMO_TONES: readonly { id: DemoToneId }[] = [
  { id: 'default' },
  { id: 'light' },
  { id: 'medium' },
  { id: 'dark' },
]

export const DEMO_PLAYS: readonly { id: DemoPlayId }[] = [
  { id: 'hover' },
  { id: 'load' },
]

export const INITIAL_DEMO_STATE: DemoState = {
  size: 96,
  tone: 'default',
  play: 'hover',
}

/**
 * Maps the demo controls to the library's Emoji props.
 * @param state - The selected size, skin tone and playback trigger.
 * @returns The props to spread on the demo emoji.
 */
export function demoEmojiProps(state: DemoState): {
  size: number
  skinTone: SkinTone
  playOnHover: boolean
  autoPlay: boolean
} {
  return {
    size: state.size,
    skinTone: state.tone,
    playOnHover: state.play === 'hover',
    autoPlay: state.play === 'load',
  }
}
