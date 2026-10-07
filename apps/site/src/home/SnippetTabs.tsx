import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { copyWithFeedback } from '@/lib/copy-feedback'

interface SnippetTabsLabels {
  tabsLabel: string
  copy: string
  copied: string
}

interface SnippetTabsItem {
  kind: string
  label: string
  code: string
}

interface SnippetTabsProps {
  tabs: SnippetTabsItem[]
  labels: SnippetTabsLabels
}

const copyButtonClass = buttonVariants({
  variant: 'outline',
  shape: 'pill',
  className:
    'h-auto min-h-9 shrink-0 px-4 font-semibold hover:border-primary hover:bg-card hover:text-card-foreground',
})

const tabClass =
  'h-auto min-h-11 gap-0 rounded-none border-b-2 border-transparent bg-transparent px-4 text-sm text-muted-foreground hover:bg-transparent aria-selected:border-primary aria-selected:bg-transparent aria-selected:text-foreground aria-selected:hover:bg-transparent'

/**
 * Landing snippet tabs: one panel per framework, all rendered in the HTML,
 * with a copy button for the visible panel.
 * @param props - Component props.
 * @param props.tabs - One entry per framework, with its code.
 * @param props.labels - Localized tab list and copy button labels.
 * @returns The tabs card.
 */
export default function SnippetTabs({ tabs, labels }: SnippetTabsProps) {
  const [active, setActive] = useState(tabs[0]?.kind ?? '')
  const [copied, setCopied] = useState(false)
  const activeCode = tabs.find((tab) => tab.kind === active)?.code ?? ''

  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        setActive(String(value))
      }}
      className="overflow-hidden rounded-brand border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border pr-2">
        <TabsList
          activateOnFocus
          aria-label={labels.tabsLabel}
          className="gap-0"
        >
          {tabs.map((tab) => (
            <TabsTrigger key={tab.kind} value={tab.kind} className={tabClass}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <button
          type="button"
          className={copyButtonClass}
          onClick={() => void copyWithFeedback(activeCode, setCopied)}
        >
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.kind} value={tab.kind} keepMounted>
          {/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the scrollable code block must be keyboard reachable */}
          <pre
            tabIndex={0}
            className="m-0 max-h-80 overflow-auto p-5 font-mono text-sm leading-relaxed"
          >
            <code>{tab.code}</code>
          </pre>
          {/* eslint-enable jsx-a11y/no-noninteractive-tabindex -- end of the scrollable code block */}
        </TabsContent>
      ))}
    </Tabs>
  )
}
