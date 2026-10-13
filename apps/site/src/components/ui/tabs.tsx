import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'

import { cn } from '@/lib/utilities'

/** The tab styles of the landing canvas, each needing the `pill` list. */
export type CanvasTabsVariant = 'cmd' | 'card' | 'dock' | 'segmented'

/**
 * The look of a tabs set: the brand pills, a `line` bar, or one of the canvas
 * variants (`cmd` command bar, `card` tabs, `dock` capsule, `segmented` track)
 * whose pill geometry comes from the `--tab-pill-*` variables in `global.css`.
 */
type TabsVariant = 'default' | 'line' | CanvasTabsVariant

interface TabsStyleProps {
  variant?: TabsVariant
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
 * it overflows. With `pill` it also renders the sliding `tab-pill` indicator
 * behind the selected tab: Base UI measures the active tab into
 * `--active-tab-*` and the utility moves `transform` and `width` with them.
 * @param props - Base UI tabs list props and the optional `pill` flag.
 * @returns The tab list element.
 */
function TabsList(props: TabsPrimitive.List.Props & { pill?: boolean }) {
  const { className, pill = false, children, ...rest } = props
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'relative flex gap-1 overflow-x-auto',
        'group-data-[variant=cmd]/tabs:gap-0.5 group-data-[variant=cmd]/tabs:border-b group-data-[variant=cmd]/tabs:border-border group-data-[variant=cmd]/tabs:bg-muted group-data-[variant=cmd]/tabs:p-1.5',
        'group-data-[variant=dock]/tabs:w-fit group-data-[variant=dock]/tabs:gap-0.5 group-data-[variant=dock]/tabs:overflow-x-clip group-data-[variant=dock]/tabs:overflow-y-visible group-data-[variant=dock]/tabs:rounded-[10px] group-data-[variant=dock]/tabs:border group-data-[variant=dock]/tabs:border-border group-data-[variant=dock]/tabs:bg-muted group-data-[variant=dock]/tabs:p-[3px]',
        'group-data-[variant=segmented]/tabs:w-fit group-data-[variant=segmented]/tabs:max-w-full group-data-[variant=segmented]/tabs:gap-0.5 group-data-[variant=segmented]/tabs:rounded-xl group-data-[variant=segmented]/tabs:border group-data-[variant=segmented]/tabs:border-border group-data-[variant=segmented]/tabs:bg-muted group-data-[variant=segmented]/tabs:p-[3px]',
        pill && 'tab-pill-list',
        className,
      )}
      {...rest}
    >
      {children}
      {pill ? (
        <TabsPrimitive.Indicator
          data-slot="tabs-indicator"
          className="tab-pill"
        />
      ) : null}
    </TabsPrimitive.List>
  )
}

/**
 * One tab button, filled with the primary color while selected. Every tab
 * shrinks to `scale(.94)` while pressed.
 * @param props - Base UI tab props, including the tab `value`.
 * @returns The tab element.
 */
function TabsTrigger(props: TabsPrimitive.Tab.Props) {
  const { className, ...rest } = props
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'h-8 shrink-0 cursor-pointer rounded-full px-3 text-xs font-semibold outline-none transition-[color,background-color,scale] [transition-duration:200ms,200ms,120ms] motion-safe:active:scale-[.94] hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary',
        'group-data-[variant=line]/tabs:h-7 group-data-[variant=line]/tabs:rounded-md group-data-[variant=line]/tabs:border group-data-[variant=line]/tabs:border-transparent group-data-[variant=line]/tabs:font-medium group-data-[variant=line]/tabs:text-muted-foreground group-data-[variant=line]/tabs:ease-[ease] group-data-[variant=line]/tabs:hover:bg-muted group-data-[variant=line]/tabs:hover:text-foreground group-data-[variant=line]/tabs:aria-selected:border-border group-data-[variant=line]/tabs:aria-selected:bg-background group-data-[variant=line]/tabs:aria-selected:text-foreground group-data-[variant=line]/tabs:aria-selected:hover:bg-background',
        'group-data-[variant=cmd]/tabs:h-auto group-data-[variant=cmd]/tabs:rounded-[7px] group-data-[variant=cmd]/tabs:px-2.5 group-data-[variant=cmd]/tabs:py-[3px] group-data-[variant=cmd]/tabs:font-mono group-data-[variant=cmd]/tabs:font-normal group-data-[variant=cmd]/tabs:text-muted-foreground group-data-[variant=cmd]/tabs:hover:bg-transparent',
        'group-data-[variant=card]/tabs:h-auto group-data-[variant=card]/tabs:rounded-[9px] group-data-[variant=card]/tabs:border group-data-[variant=card]/tabs:border-transparent group-data-[variant=card]/tabs:px-3 group-data-[variant=card]/tabs:py-[5px] group-data-[variant=card]/tabs:text-sm group-data-[variant=card]/tabs:font-normal group-data-[variant=card]/tabs:text-muted-foreground group-data-[variant=card]/tabs:hover:bg-transparent group-data-[variant=card]/tabs:hover:text-foreground',
        'group-data-[variant=dock]/tabs:relative group-data-[variant=dock]/tabs:h-auto group-data-[variant=dock]/tabs:rounded-[7px] group-data-[variant=dock]/tabs:before:absolute group-data-[variant=dock]/tabs:before:inset-x-0 group-data-[variant=dock]/tabs:before:-inset-y-[11px] group-data-[variant=dock]/tabs:before:content-[""] group-data-[variant=dock]/tabs:px-2.5 group-data-[variant=dock]/tabs:py-[3px] group-data-[variant=dock]/tabs:font-mono group-data-[variant=dock]/tabs:text-[11px] group-data-[variant=dock]/tabs:font-normal group-data-[variant=dock]/tabs:text-muted-foreground group-data-[variant=dock]/tabs:hover:bg-transparent',
        'group-data-[variant=segmented]/tabs:h-auto group-data-[variant=segmented]/tabs:rounded-[9px] group-data-[variant=segmented]/tabs:px-[11px] group-data-[variant=segmented]/tabs:py-[5px] group-data-[variant=segmented]/tabs:font-mono group-data-[variant=segmented]/tabs:font-normal group-data-[variant=segmented]/tabs:text-muted-foreground group-data-[variant=segmented]/tabs:hover:bg-transparent group-data-[variant=segmented]/tabs:disabled:cursor-not-allowed group-data-[variant=segmented]/tabs:disabled:opacity-35',
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
