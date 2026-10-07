import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utilities'

const buttonStyles = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:brightness-95',
        outline:
          'border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:brightness-95',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 gap-1.5 px-2.5',
        sm: 'h-7 gap-1 px-2.5 text-[0.8rem]',
        lg: 'h-9 gap-1.5 px-2.5',
        icon: 'size-8',
      },
      shape: {
        default: 'rounded-lg',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  },
)

/**
 * Class names for a button, resolved from `variant`, `size` and `shape`
 * (`pill` is the brand `rounded-full` shape) and merged with any `className`.
 * Use it on static Astro elements that need button styling without shipping
 * React.
 * @param props - The variant selection and an optional `className`.
 * @returns The merged class string.
 */
function buttonVariants(props?: Parameters<typeof buttonStyles>[0]): string {
  return cn(buttonStyles(props))
}

/**
 * The shadcn button on Base UI. Renders a native `<button>` styled through
 * {@link buttonVariants}.
 * @param props - Base UI button props plus `variant`, `size` and `shape`.
 * @returns The styled button element.
 */
function Button(
  props: ButtonPrimitive.Props & VariantProps<typeof buttonStyles>,
) {
  const { className, variant, size, shape, ...rest } = props
  return (
    <ButtonPrimitive
      data-slot="button"
      className={buttonVariants({ variant, size, shape, className })}
      {...rest}
    />
  )
}

export { Button, buttonVariants }
