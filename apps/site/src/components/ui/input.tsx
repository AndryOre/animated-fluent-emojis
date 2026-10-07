import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/lib/utilities'

/**
 * The shadcn input on Base UI. Renders a native `<input>` with the brand pill
 * shape, card background and a visible focus ring.
 * @param props - Base UI input props.
 * @returns The styled input element.
 */
function Input(props: InputPrimitive.Props) {
  const { className, ...rest } = props
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        'h-12 w-full rounded-full border border-border bg-card px-5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive',
        className,
      )}
      {...rest}
    />
  )
}

export { Input }
