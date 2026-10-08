import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'

import { cn } from '@/lib/utilities'

/** The look of a tabs set: the brand pills, a `line` bar or a `segmented` track. */
interface TabsStyleProps {
  variant?: 'default' | 'line' | 'segmented'
}

/**
 * The shadcn tabs root on Base UI. It owns the selected value and wires each
 * tab to its panel.
 * @param props - Base UI tabs props.
 * @returns The tabs root element.
 */
function Tabs(props: TabsPrimitive.Root.Props & TabsStyleProps) {
  const { className, variant = 'default', ...rest } = props
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-variant={variant}
      className={cn('group/tabs flex flex-col', className)}
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
      className={cn(
        'flex gap-1 overflow-x-auto group-data-[variant=segmented]/tabs:w-fit group-data-[variant=segmented]/tabs:gap-0.5 group-data-[variant=segmented]/tabs:rounded-lg group-data-[variant=segmented]/tabs:bg-muted group-data-[variant=segmented]/tabs:p-0.5',
        className,
      )}
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
        'group-data-[variant=line]/tabs:h-7 group-data-[variant=line]/tabs:rounded-md group-data-[variant=line]/tabs:border group-data-[variant=line]/tabs:border-transparent group-data-[variant=line]/tabs:font-medium group-data-[variant=line]/tabs:text-muted-foreground group-data-[variant=line]/tabs:ease-(--ease-out-strong) group-data-[variant=line]/tabs:hover:bg-muted group-data-[variant=line]/tabs:hover:text-foreground group-data-[variant=line]/tabs:aria-selected:border-border group-data-[variant=line]/tabs:aria-selected:bg-background group-data-[variant=line]/tabs:aria-selected:text-foreground group-data-[variant=line]/tabs:aria-selected:hover:bg-background',
        'group-data-[variant=segmented]/tabs:h-7 group-data-[variant=segmented]/tabs:rounded-md group-data-[variant=segmented]/tabs:font-medium group-data-[variant=segmented]/tabs:text-muted-foreground group-data-[variant=segmented]/tabs:hover:bg-transparent group-data-[variant=segmented]/tabs:hover:text-foreground group-data-[variant=segmented]/tabs:aria-selected:bg-background group-data-[variant=segmented]/tabs:aria-selected:text-foreground group-data-[variant=segmented]/tabs:aria-selected:hover:bg-background',
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
