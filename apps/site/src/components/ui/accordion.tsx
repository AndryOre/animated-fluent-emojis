import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'

import { cn } from '@/lib/utilities'

/**
 * The shadcn accordion root on Base UI. Pass `multiple` to let several items
 * stay open and `hiddenUntilFound` to keep closed answers findable.
 * @param props - Base UI accordion props.
 * @returns The accordion root element.
 */
function Accordion(props: AccordionPrimitive.Root.Props) {
  const { className, ...rest } = props
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...rest}
    />
  )
}

/**
 * One accordion item, a trigger plus the panel it controls.
 * @param props - Base UI accordion item props.
 * @returns The accordion item element.
 */
function AccordionItem(props: AccordionPrimitive.Item.Props) {
  return <AccordionPrimitive.Item data-slot="accordion-item" {...props} />
}

/**
 * The heading button that opens and closes its item, with a chevron that
 * rotates while the item is open.
 * @param props - Base UI accordion trigger props.
 * @returns The accordion header with its trigger button.
 */
function AccordionTrigger(props: AccordionPrimitive.Trigger.Props) {
  const { className, children, ...rest } = props
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger flex flex-1 cursor-pointer items-start justify-between gap-3 rounded-lg py-2.5 text-left text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          className,
        )}
        {...rest}
      >
        {children}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded/accordion-trigger:rotate-180"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/**
 * The collapsible answer of an item. It stays mounted so the text is present
 * in the server-rendered HTML.
 * @param props - Base UI accordion panel props.
 * @returns The accordion panel element.
 */
function AccordionContent(props: AccordionPrimitive.Panel.Props) {
  const { className, children, ...rest } = props
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      keepMounted
      className="overflow-hidden text-sm"
      {...rest}
    >
      <div className={cn('pt-0 pb-2.5', className)}>{children}</div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
