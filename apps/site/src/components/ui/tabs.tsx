import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'

import { cn } from '@/lib/utilities'

/**
 * The shadcn tabs root on Base UI. It owns the selected value and wires each
 * tab to its panel.
 * @param props - Base UI tabs props.
 * @returns The tabs root element.
 */
function Tabs(props: TabsPrimitive.Root.Props) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col', className)}
      {...rest}
    />
  )
}

/**
 * The `role="tablist"` row that holds the tabs and scrolls horizontally when
 * it overflows.
 * @param props - Base UI tabs list props.
 * @returns The tab list element.
 */
function TabsList(props: TabsPrimitive.List.Props) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('flex gap-1 overflow-x-auto', className)}
      {...rest}
    />
  )
}

/**
 * One tab button, filled with the primary color while selected.
 * @param props - Base UI tab props, including the tab `value`.
 * @returns The tab element.
 */
function TabsTrigger(props: TabsPrimitive.Tab.Props) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'h-8 shrink-0 cursor-pointer rounded-full px-3 text-xs font-semibold outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary',
        className,
      )}
      {...rest}
    />
  )
}

/**
 * The `role="tabpanel"` content of one tab.
 * @param props - Base UI tab panel props, including the panel `value`.
 * @returns The tab panel element.
 */
function TabsContent(props: TabsPrimitive.Panel.Props) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
      {...rest}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
