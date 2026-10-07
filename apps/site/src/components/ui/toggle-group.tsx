import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'

import { toggleVariants, type ToggleStyleProps } from '@/components/ui/toggle'
import { cn } from '@/lib/utilities'

/**
 * The shadcn toggle group on Base UI. Renders a `role="group"` container for
 * {@link ToggleGroupItem} children; label it with `aria-label`.
 * @param props - Base UI toggle group props.
 * @returns The toggle group element.
 */
function ToggleGroup<Value extends string>(
  props: ToggleGroupPrimitive.Props<Value>,
) {
  const { className, ...rest } = props
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn('flex w-fit flex-row items-center gap-2', className)}
      {...rest}
    />
  )
}

/**
 * One pressable item of a {@link ToggleGroup}, styled through
 * {@link toggleVariants}.
 * @param props - Base UI toggle props plus `variant` and `size`.
 * @returns The toggle button.
 */
function ToggleGroupItem<Value extends string>(
  props: TogglePrimitive.Props<Value> & ToggleStyleProps,
) {
  const { className, variant, size, ...rest } = props
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(toggleVariants({ variant, size }), className)}
      {...rest}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
