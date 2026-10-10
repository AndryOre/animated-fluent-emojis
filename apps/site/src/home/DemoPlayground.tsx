import { Emoji } from 'animated-fluent-emojis/react'
import { RotateCcwIcon } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import 'animated-fluent-emojis/style.css'

import CodeBlock, { type CodeBlockLabels } from '@/components/CodeBlock'
import { ToneDot } from '@/components/ToneDot'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import type { PublicEmoji } from '../gallery/public-index'
import type { SnippetKind } from '../gallery/snippets'
import {
  DEMO_EMOJIS,
  DEMO_PLAYS,
  DEMO_SIZES,
  DEMO_TONES,
  demoEmojiProps,
  demoSlotValues,
  demoSnippetCode,
  demoTone,
  INITIAL_DEMO_STATE,
  isInitialDemoState,
  type DemoEmojiName,
  type DemoState,
  type DemoTabs,
} from './demo'

interface DemoLabels {
  emojiLabel: string
  sizeLabel: string
  toneLabel: string
  playsLabel: string
  reset: string
  emojis: Record<DemoEmojiName, string>
  tones: Record<'default' | 'light' | 'medium' | 'dark', string>
  plays: Record<'hover' | 'load' | 'loop', string>
  code: CodeBlockLabels
}

export interface DemoPlaygroundProps {
  emojis: readonly PublicEmoji[]
  tabs: DemoTabs
  labels: DemoLabels
  initialState?: DemoState
}

interface SegmentedProps<Value extends string | number> {
  label: string
  options: readonly {
    value: Value
    text: string
    name?: string
    leading?: ReactNode
  }[]
  selected: Value
  onSelect: (value: Value) => void
  disabled?: boolean
  className?: string
}

function Segmented<Value extends string | number>({
  label,
  options,
  selected,
  onSelect,
  disabled = false,
  className = '',
}: SegmentedProps<Value>) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span
        aria-hidden="true"
        className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase"
      >
        {label}
      </span>
      <ToggleGroup
        aria-label={label}
        disabled={disabled}
        value={[String(selected)]}
        onValueChange={(groupValue: string[]) => {
          const next = options.find(
            (option) => String(option.value) === groupValue[0],
          )
          if (next) onSelect(next.value)
        }}
        className="w-full gap-0.5 rounded-lg border border-border bg-background p-0.5"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={String(option.value)}
            size="compact"
            aria-label={option.name}
            className="flex-1 cursor-pointer aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
          >
            {option.leading === undefined ? (
              option.text
            ) : (
              <span className="inline-flex items-center gap-1.5">
                {option.leading}
                {option.text}
              </span>
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

/**
 * The hero customizer: one live emoji on a fixed-height dot-grid stage, compact
 * segmented controls for emoji, size, skin tone and playback, and the shared
 * code block below, which follows the controls by swapping its placeholder
 * tokens. A React island hydrated when the browser is idle.
 * @param props - Component props.
 * @param props.emojis - The curated emojis, in display order.
 * @param props.tabs - Highlighted snippets for every play, with and without a
 * tone attribute.
 * @param props.labels - Localized control, emoji and code block labels.
 * @param props.initialState - The starting selection; the untouched demo
 * state when omitted. Reset always returns to the untouched demo state.
 * @returns The customizer card.
 */
export default function DemoPlayground({
  emojis,
  tabs: demoTabs,
  labels,
  initialState = INITIAL_DEMO_STATE,
}: DemoPlaygroundProps) {
  const [state, setState] = useState<DemoState>(initialState)
  const emoji = emojis.find((candidate) => candidate.id === state.emojiId)
  const initialEmoji = emojis.find(
    (candidate) => candidate.id === INITIAL_DEMO_STATE.emojiId,
  )
  const current = emoji ?? initialEmoji
  const hasTones = (current?.tones.length ?? 0) > 0
  const slotValues = useMemo(
    () => (current ? demoSlotValues(current, state) : undefined),
    [current, state],
  )
  if (!current) return null

  const toned = demoTone(current, state) !== undefined
  const tabs = demoTabs[state.play][toned ? 'toned' : 'plain'].map((tab) => ({
    ...tab,
    code: demoSnippetCode(current, tab.id as SnippetKind, state),
  }))
  const name =
    labels.emojis[
      DEMO_EMOJIS.find((candidate) => candidate.id === current.id)?.name ??
        'wave'
    ]

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <div
        className="relative flex h-[180px] items-center justify-center border-b border-border bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[length:16px_16px]"
        data-testid="demo-stage"
      >
        <Emoji
          key={`${state.emojiId}-${state.play}-${state.tone}-${String(state.size)}`}
          id={current.id}
          alt={name}
          {...demoEmojiProps(current, state)}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          disabled={isInitialDemoState(state)}
          onClick={() => {
            setState(INITIAL_DEMO_STATE)
          }}
        >
          <RotateCcwIcon aria-hidden="true" />
          {labels.reset}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-3">
        <Segmented
          className="col-span-2"
          label={labels.emojiLabel}
          options={DEMO_EMOJIS.filter((option) =>
            emojis.some((candidate) => candidate.id === option.id),
          ).map((option) => ({
            value: option.id,
            text:
              emojis.find((candidate) => candidate.id === option.id)?.unicode ??
              '',
            name: labels.emojis[option.name],
          }))}
          selected={state.emojiId}
          onSelect={(emojiId) => {
            setState((previous) => ({ ...previous, emojiId }))
          }}
        />
        <Segmented
          className="col-span-2 sm:col-span-1"
          label={labels.sizeLabel}
          options={DEMO_SIZES.map((size) => ({
            value: size,
            text: String(size),
          }))}
          selected={state.size}
          onSelect={(size) => {
            setState((previous) => ({ ...previous, size }))
          }}
        />
        <Segmented
          className="col-span-2 sm:col-span-1"
          label={labels.playsLabel}
          options={DEMO_PLAYS.map((play) => ({
            value: play.id,
            text: labels.plays[play.id],
          }))}
          selected={state.play}
          onSelect={(play) => {
            setState((previous) => ({ ...previous, play }))
          }}
        />
        <Segmented
          className="col-span-2"
          label={labels.toneLabel}
          disabled={!hasTones}
          options={DEMO_TONES.map((tone) => ({
            value: tone.id,
            text: labels.tones[tone.id],
            leading: <ToneDot tone={tone.id} />,
          }))}
          selected={state.tone}
          onSelect={(tone) => {
            setState((previous) => ({ ...previous, tone }))
          }}
        />
      </div>
      <div className="demo-code px-3 pb-3">
        <CodeBlock tabs={tabs} labels={labels.code} slotValues={slotValues} />
      </div>
    </div>
  )
}
