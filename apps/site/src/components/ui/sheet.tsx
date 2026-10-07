import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'

import { cn } from '@/lib/utilities'

/**
 * The shadcn sheet root on Base UI Dialog. It is modal: focus is trapped
 * while open and Escape closes it.
 * @param props - Base UI dialog root props.
 * @returns The sheet root.
 */
function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root {...props} />
}

/**
 * The button that closes the sheet. Use `render` to style it as a `Button`.
 * @param props - Base UI dialog close props.
 * @returns The close button element.
 */
function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

interface SheetContentProps extends SheetPrimitive.Popup.Props {
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const SIDE_CLASSES = {
  top: 'inset-x-0 top-0 max-h-[80vh] rounded-b-brand border-b',
  right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
  bottom: 'inset-x-0 bottom-0 max-h-[80vh] rounded-t-brand border-t',
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r',
} as const

/**
 * The sheet panel and its dimming backdrop, portaled to the document body and
 * anchored to one screen edge.
 * @param props - Base UI dialog popup props plus the screen edge as `side`.
 * @returns The portaled backdrop and panel.
 */
function SheetContent(props: SheetContentProps) {
  const { className, side = 'right', ...rest } = props
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-40 bg-foreground/40"
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          'fixed z-50 overflow-y-auto border border-border bg-card p-5 outline-none',
          SIDE_CLASSES[side],
          className,
        )}
        {...rest}
      />
    </SheetPrimitive.Portal>
  )
}

export { Sheet, SheetClose, SheetContent }
