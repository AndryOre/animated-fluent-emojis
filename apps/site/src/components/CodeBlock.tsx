import { CheckIcon, CopyIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { copyWithFeedback } from '@/lib/copy-feedback'

import { markHighlightedLine } from '../highlight/snippet-html'
import { swapSnippetSlots } from '../highlight/snippet-swap'
import type { SnippetSlot } from '../highlight/snippet-template'

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
}: CodeBlockProps) {
  const [ownActive, setOwnActive] = useState(tabs[0]?.id ?? '')
  const [copied, setCopied] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const active = activeId ?? ownActive
  const activeCode = tabs.find((tab) => tab.id === active)?.code ?? ''
  const showTabs = tabs.length > 1 || leading !== undefined

  useEffect(() => {
    if (!slotValues || !bodyRef.current) return
    swapSnippetSlots(
      bodyRef.current.querySelectorAll<HTMLElement>('[data-snippet-slot]'),
      slotValues,
    )
  }, [slotValues])

  return (
    <Tabs
      variant="line"
      value={active}
      onValueChange={(value) => {
        const id = String(value)
        setOwnActive(id)
        onActiveChange?.(id)
      }}
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border pr-1.5 pl-3">
        <div className="flex min-w-0 items-center gap-2">
          {leading}
          {showTabs && (
            <TabsList
              activateOnFocus
              aria-label={labels.tabsLabel}
              className="gap-1"
            >
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={copied ? labels.copied : labels.copy}
          onClick={() => void copyWithFeedback(activeCode, setCopied)}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
      <div ref={bodyRef} className="grid">
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            keepMounted
            className="col-start-1 row-start-1 min-w-0 [&[hidden]]:invisible [&[hidden]]:block"
          >
            {/* eslint-disable jsx-a11y/no-noninteractive-tabindex, @eslint-react/dom-no-dangerously-set-innerhtml -- the scrollable code must be keyboard reachable and the markup is trusted build-time output */}
            <div
              tabIndex={0}
              data-line-numbers={lineNumbers}
              className="afe-code overflow-x-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
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
