import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'

import { cn } from '@/lib/utilities'

/**
 * The shadcn toggle group on Base UI. Renders a `role="group"` row of toggle
 * buttons with roving keyboard focus.
 * @param props - Base UI toggle group props.
 * @returns The group element.
 */
function ToggleGroup<Value extends string>(
  props: ToggleGroupPrimitive.Props<Value>,
) {
  const { className, ...rest } = props
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn('flex items-center gap-2', className)}
      {...rest}
    />
  )
}

/**
 * One pressable item of a {@link ToggleGroup}, styled as the brand pill chip.
 * It exposes its state through `aria-pressed`.
 * @param props - Base UI toggle props, including the item `value`.
 * @returns The toggle button element.
 */
function ToggleGroupItem<Value extends string>(
  props: TogglePrimitive.Props<Value>,
) {
  const { className, ...rest } = props
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border px-3 text-xs font-semibold whitespace-nowrap outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary',
        className,
      )}
      {...rest}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
