import { CheckIcon, CopyIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { copyWithFeedback } from '@/lib/copy-feedback'
import { cn } from '@/lib/utilities'

import { markHighlightedLine } from '../highlight/snippet-html'
import { swapSnippetSlots } from '../highlight/snippet-swap'
import type { SnippetSlot } from '../highlight/snippet-template'

const ICON_FADE =
  'transition-[opacity,scale,filter] duration-150 ease-(--ease-out-strong) motion-reduce:scale-100 motion-reduce:blur-none motion-reduce:duration-100'
const ICON_HIDDEN = 'scale-80 opacity-0 blur-[4px]'

export interface CodeBlockTab {
  id: string
  label: string
  code: string
  html: string
  highlightLine?: number
}

export interface CodeBlockLabels {
  tabsLabel: string
  copy: string
  copied: string
}

export interface CodeBlockProps {
  tabs: readonly CodeBlockTab[]
  labels: CodeBlockLabels
  lineNumbers?: boolean
  leading?: ReactNode
  activeId?: string
  onActiveChange?: (id: string) => void
  slotValues?: Partial<Record<SnippetSlot, string>>
  onCopied?: () => void
  copyEffect?: ReactNode
  pill?: boolean
}

const CODE_LINE_HEIGHT_REM = 1.5
const CODE_PADDING_LINES = 1
const SCROLLBAR_ALLOWANCE_REM = 0.5

/**
 * The height of the tallest panel, from its line count, so the block keeps its
 * size when a tab is chosen even though the inactive panels are not rendered
 * (the reset stylesheet forces `display: none` on `hidden`). It mirrors the
 * `.afe-code` rules: one `1.5rem` line each plus `0.75rem` of padding above
 * and below, and a small allowance for a horizontal scrollbar.
 * @param tabs - The panels of the block.
 * @returns A CSS length for the body's `min-height`.
 */
function bodyMinHeight(tabs: readonly CodeBlockTab[]): string {
  const lines = Math.max(0, ...tabs.map((tab) => tab.code.split('\n').length))
  const rem =
    (lines + CODE_PADDING_LINES) * CODE_LINE_HEIGHT_REM +
    SCROLLBAR_ALLOWANCE_REM
  return `${String(rem)}rem`
}

/**
 * The shared code block: an optional `line` tab bar, a copy icon button and a
 * body that renders pre-highlighted markup with line numbers. Every panel stays
 * mounted and stacked in one grid cell, so the block keeps the height of its
 * tallest panel and does not jump between tabs. Copy always writes the plain
 * `code` of the active tab, never the highlighted markup.
 * @param props - Component props.
 * @param props.tabs - One entry per panel, with its plain code and its markup.
 * @param props.labels - Localized tab list and copy button labels.
 * @param props.lineNumbers - Whether the gutter shows; defaults to `true`.
 * @param props.leading - Content before the tabs, such as an icon.
 * @param props.activeId - The active tab when the parent controls it.
 * @param props.onActiveChange - Called with the id of a newly chosen tab.
 * @param props.slotValues - New text for the placeholder tokens, swapped in
 * place without touching the rest of the highlighting.
 * @param props.onCopied - Called after each successful copy, never after a
 * failed one.
 * @param props.copyEffect - Decoration anchored to the copy button, such as a
 * burst of particles; it must not affect layout.
 * @param props.pill - Swaps the line tab bar for brand pills with a sliding
 * indicator behind the active tab; off by default.
 * @returns The code block card.
 */
export default function CodeBlock({
  tabs,
  labels,
  lineNumbers = true,
  leading,
  activeId,
  onActiveChange,
  slotValues,
  onCopied,
  copyEffect,
  pill = false,
}: CodeBlockProps) {
  const [ownActive, setOwnActive] = useState(tabs[0]?.id ?? '')
  const [copied, setCopied] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const active = activeId ?? ownActive
  const activeCode = tabs.find((tab) => tab.id === active)?.code ?? ''
  const showTabs = tabs.length > 1 || leading !== undefined

  useEffect(() => {
    const list = tabsRef.current?.querySelector<HTMLElement>('[role="tablist"]')
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list || !tab) return
    const listBox = list.getBoundingClientRect()
    const tabBox = tab.getBoundingClientRect()
    if (tabBox.left < listBox.left)
      list.scrollLeft -= listBox.left - tabBox.left
    else if (tabBox.right > listBox.right - 20)
      list.scrollLeft += tabBox.right - (listBox.right - 20)
  }, [active])

  useEffect(() => {
    if (!slotValues || !bodyRef.current) return
    swapSnippetSlots(
      bodyRef.current.querySelectorAll<HTMLElement>('[data-snippet-slot]'),
      slotValues,
    )
  }, [slotValues])

  return (
    <Tabs
      variant={pill ? 'default' : 'line'}
      value={active}
      onValueChange={(value) => {
        const id = String(value)
        setOwnActive(id)
        onActiveChange?.(id)
      }}
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b border-border pr-1.5 pl-3',
          pill ? 'h-12' : 'h-10',
        )}
      >
        <div ref={tabsRef} className="flex min-w-0 items-center gap-2">
          {leading}
          {showTabs && (
            <TabsList
              pill={pill}
              activateOnFocus
              aria-label={labels.tabsLabel}
              className="min-w-0 gap-1 pr-5 [mask-image:linear-gradient(to_right,#000_calc(100%-20px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
        </div>
        <span className="relative flex shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={copied ? labels.copied : labels.copy}
            onClick={() =>
              void copyWithFeedback(activeCode, setCopied, setCopied, onCopied)
            }
          >
            <span className="grid *:col-start-1 *:row-start-1">
              <CopyIcon
                data-copy-icon
                className={cn(ICON_FADE, copied && ICON_HIDDEN)}
              />
              <CheckIcon
                data-check-icon
                className={cn(ICON_FADE, !copied && ICON_HIDDEN)}
              />
            </span>
          </Button>
          {copyEffect}
        </span>
      </div>
      <div
        ref={bodyRef}
        className="grid"
        style={{ minHeight: bodyMinHeight(tabs) }}
      >
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            keepMounted
            className="col-start-1 row-start-1 min-w-0 motion-safe:transition-[opacity,translate,visibility] motion-safe:duration-200 motion-safe:ease-(--ease-out-strong) [&[hidden]]:invisible [&[hidden]]:block [&[hidden]]:opacity-0 motion-safe:[&[hidden]]:translate-y-1"
          >
            {/* eslint-disable jsx-a11y/no-noninteractive-tabindex, @eslint-react/dom-no-dangerously-set-innerhtml -- the scrollable code must be keyboard reachable and the markup is trusted build-time output */}
            <div
              tabIndex={0}
              data-line-numbers={lineNumbers}
              className="afe-code overflow-x-auto overscroll-x-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
              dangerouslySetInnerHTML={{
                __html: tab.highlightLine
                  ? markHighlightedLine(tab.html, tab.highlightLine)
                  : tab.html,
              }}
            />
            {/* eslint-enable jsx-a11y/no-noninteractive-tabindex, @eslint-react/dom-no-dangerously-set-innerhtml -- end of the scrollable code */}
          </TabsContent>
        ))}
      </div>
      <span role="status" className="sr-only">
        {copied ? labels.copied : ''}
      </span>
    </Tabs>
  )
}
