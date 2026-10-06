import { describe, expect, it } from 'vitest'

import {
  DEMO_PLAYS,
  DEMO_SIZES,
  DEMO_TONES,
  demoEmojiProps,
  INITIAL_DEMO_STATE,
} from './demo'

describe('demo options', () => {
  it('offers the sizes, tones and plays from the design', () => {
    expect(DEMO_SIZES).toEqual([32, 64, 96, 128])
    expect(DEMO_TONES.map((tone) => tone.id)).toEqual([
      'default',
      'light',
      'medium',
      'dark',
    ])
    expect(DEMO_PLAYS.map((play) => play.id)).toEqual(['hover', 'load'])
  })

  it('starts on a hover-driven default emoji', () => {
    expect(INITIAL_DEMO_STATE).toEqual({
      size: 96,
      tone: 'default',
      play: 'hover',
    })
  })

  it('plays on hover without autoplay', () => {
    expect(demoEmojiProps({ size: 64, tone: 'light', play: 'hover' })).toEqual({
      size: 64,
      skinTone: 'light',
      playOnHover: true,
      autoPlay: false,
    })
  })

  it('plays on load without hover', () => {
    expect(demoEmojiProps({ size: 128, tone: 'dark', play: 'load' })).toEqual({
      size: 128,
      skinTone: 'dark',
      playOnHover: false,
      autoPlay: true,
    })
  })
})
