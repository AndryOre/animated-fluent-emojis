import { Emoji } from 'animated-fluent-emojis/react'
import { useState } from 'react'

import 'animated-fluent-emojis/style.css'

import { Button } from '@/components/ui/button'

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

interface ChipGroupProps<Value extends string | number> {
  label: string
  options: readonly { value: Value; text: string }[]
  selected: Value
  onSelect: (value: Value) => void
}

function ChipGroup<Value extends string | number>({
  label,
  options,
  selected,
  onSelect,
}: ChipGroupProps<Value>) {
  return (
    <fieldset className="m-0 flex flex-wrap items-center gap-2 border-0 p-0">
      <legend className="float-left mr-1 text-sm font-semibold text-muted-foreground">
        {label}
      </legend>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="outline"
          shape="pill"
          aria-pressed={option.value === selected}
          onClick={() => {
            onSelect(option.value)
          }}
          className="h-auto min-h-10 px-4 hover:bg-card hover:text-card-foreground aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary aria-pressed:hover:text-primary-foreground"
        >
          {option.text}
        </Button>
      ))}
    </fieldset>
  )
}

/**
 * The interactive demo: one live emoji with chips for size, skin tone and when
 * it plays. A React island hydrated when it scrolls into view.
 * @param props - Component props.
 * @param props.labels - Localized chip and emoji labels.
 * @returns The demo stage and its controls.
 */
export default function DemoPlayground({ labels }: { labels: DemoLabels }) {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE)
  const props = demoEmojiProps(state)
  return (
    <div className="grid gap-6 min-[860px]:grid-cols-[1fr_1.4fr] min-[860px]:items-center">
      <div
        className="flex items-center justify-center rounded-brand border border-border bg-card"
        style={{ minHeight: 192 }}
      >
        <Emoji
          key={`${state.play}-${state.tone}-${String(state.size)}`}
          id="1f44b_wavinghand"
          alt={labels.emojiLabel}
          {...props}
        />
      </div>
      <div className="flex flex-col gap-4">
        <ChipGroup
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
        <ChipGroup
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
        <ChipGroup
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
