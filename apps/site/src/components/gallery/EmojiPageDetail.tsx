import { useState, useSyncExternalStore } from 'react'

import { effectiveTone } from '../../gallery/filter'
import {
  SKIN_TONES,
  type PublicEmoji,
  type SkinTone,
} from '../../gallery/public-index'
import { parseGalleryUrl } from '../../gallery/url-state'
import type { EmojiPageTabs } from '../../home/content'
import { ChipGroup } from './ChipGroup'
import { EmojiDetail, type GalleryStrings } from './EmojiDetail'

const TONE_LABELS: Record<SkinTone | 'default', keyof GalleryStrings> = {
  default: 'toneDefault',
  light: 'toneLight',
  'medium-light': 'toneMediumLight',
  medium: 'toneMedium',
  'medium-dark': 'toneMediumDark',
  dark: 'toneDark',
}

export const PREVIEW_SIZE = 200

function unsubscribe(): void {
  return
}

function subscribeToNothing(): () => void {
  return unsubscribe
}

function readQueryTone(): SkinTone | undefined {
  return parseGalleryUrl(globalThis.location.search).tone
}

function readServerTone(): SkinTone | undefined {
  return parseGalleryUrl('').tone
}

/**
 * Properties of {@link EmojiPageDetail}.
 */
export interface EmojiPageDetailProps {
  emoji: PublicEmoji
  name: string
  strings: GalleryStrings
  snippetTabs: EmojiPageTabs
}

/**
 * The interactive half of an emoji page: tone chips plus the shared detail
 * view. The tone starts from the `?tone=` query and is written back to it.
 * @param props - The emoji, its localized name, the gallery strings and the
 * build-time highlighted snippet tabs.
 * @returns The chips and the detail view.
 */
export function EmojiPageDetail(props: EmojiPageDetailProps) {
  const { emoji, name, strings, snippetTabs } = props
  const [chosen, setChosen] = useState<SkinTone | 'default'>()
  const queryTone = useSyncExternalStore(
    subscribeToNothing,
    readQueryTone,
    readServerTone,
  )
  const requested =
    chosen === undefined ? queryTone : chosen === 'default' ? undefined : chosen
  const tone = effectiveTone(emoji, requested)

  function selectTone(value: SkinTone | 'default') {
    setChosen(value)
    const url = new URL(globalThis.location.href)
    if (value === 'default') url.searchParams.delete('tone')
    else url.searchParams.set('tone', value)
    globalThis.history.replaceState(null, '', url)
  }

  return (
    <div className="flex flex-col gap-4">
      <EmojiDetail
        emoji={emoji}
        name={name}
        tone={tone}
        size={PREVIEW_SIZE}
        strings={strings}
        snippetTabs={snippetTabs}
        page
      />
      {emoji.tones.length > 0 && (
        <ChipGroup
          label={strings.toneLabel}
          chips={(['default', ...SKIN_TONES] as const).map((value) => ({
            value,
            label: strings[TONE_LABELS[value]],
          }))}
          selected={tone ?? 'default'}
          onSelect={selectTone}
        />
      )}
    </div>
  )
}
