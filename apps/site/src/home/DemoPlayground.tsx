import { Emoji } from 'animated-fluent-emojis/react'
import { useState } from 'react'

import 'animated-fluent-emojis/style.css'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import {
  DEMO_PLAYS,
  DEMO_SIZES,
  DEMO_TONES,
  demoEmojiProps,
  INITIAL_DEMO_STATE,
  type DemoState,
} from './demo'

export interface DemoLabels {
  sizeLabel: string
  toneLabel: string
  playsLabel: string
  tones: Record<'default' | 'light' | 'medium' | 'dark', string>
  plays: Record<'hover' | 'load', string>
  emojiLabel: string
}

interface PillGroupProps<Value extends string | number> {
  label: string
  options: readonly { value: Value; text: string }[]
  selected: Value
  onSelect: (value: Value) => void
}

function PillGroup<Value extends string | number>({
  label,
  options,
  selected,
  onSelect,
}: PillGroupProps<Value>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        aria-hidden="true"
        className="text-sm font-semibold text-muted-foreground"
      >
        {label}
      </span>
      <ToggleGroup
        aria-label={label}
        value={[String(selected)]}
        onValueChange={(groupValue: string[]) => {
          const next = options.find(
            (option) => String(option.value) === groupValue[0],
          )
          if (next) onSelect(next.value)
        }}
        className="flex-wrap"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={String(option.value)}
            variant="outline"
            className="h-8 cursor-pointer rounded-full border-border bg-card px-3.5 text-card-foreground hover:bg-card aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
          >
            {option.text}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

/**
 * The hero playground: one live emoji on a fixed-height stage with pill
 * toggles below for size, skin tone and when it plays. A React island hydrated
 * when the browser is idle.
 * @param props - Component props.
 * @param props.labels - Localized toggle and emoji labels.
 * @returns The playground card.
 */
export default function DemoPlayground({ labels }: { labels: DemoLabels }) {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE)
  const props = demoEmojiProps(state)
  return (
    <div className="overflow-hidden rounded-brand border border-border bg-card">
      <div className="flex h-[260px] items-center justify-center max-[859px]:h-48">
        <Emoji
          key={`${state.play}-${state.tone}-${String(state.size)}`}
          id="1f44b_wavinghand"
          alt={labels.emojiLabel}
          {...props}
        />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-border px-4 py-3.5">
        <PillGroup
          label={labels.sizeLabel}
          options={DEMO_SIZES.map((size) => ({
            value: size,
            text: String(size),
          }))}
          selected={state.size}
          onSelect={(size) => {
            setState((current) => ({ ...current, size }))
          }}
        />
        <PillGroup
          label={labels.toneLabel}
          options={DEMO_TONES.map((tone) => ({
            value: tone.id,
            text: labels.tones[tone.id],
          }))}
          selected={state.tone}
          onSelect={(tone) => {
            setState((current) => ({ ...current, tone }))
          }}
        />
        <PillGroup
          label={labels.playsLabel}
          options={DEMO_PLAYS.map((play) => ({
            value: play.id,
            text: labels.plays[play.id],
          }))}
          selected={state.play}
          onSelect={(play) => {
            setState((current) => ({ ...current, play }))
          }}
        />
      </div>
    </div>
  )
}
