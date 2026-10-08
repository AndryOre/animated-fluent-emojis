import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utilities'

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '*:data-slot:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0',
        vertical:
          'flex-col *:data-slot:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

/**
 * Joins adjacent controls into one visual group: shared edges lose their inner
 * radius and border.
 * @param props - Div props plus the group `orientation`.
 * @returns The grouped container.
 */
function ButtonGroup(
  props: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>,
) {
  const { className, orientation = 'horizontal', ...rest } = props
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...rest}
    />
  )
}

/**
 * A non-interactive text cell that sits inside a {@link ButtonGroup}.
 * @param props - Base UI render props for a div.
 * @returns The text cell.
 */
function ButtonGroupText(props: useRender.ComponentProps<'div'>) {
  const { className, render, ...rest } = props
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          "flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className,
        ),
      },
      rest,
    ),
    render,
    state: {
      slot: 'button-group-text',
    },
  })
}

/**
 * A divider between two controls of a {@link ButtonGroup}.
 * @param props - Props forwarded to the shared separator.
 * @returns The separator element.
 */
function ButtonGroupSeparator(props: React.ComponentProps<typeof Separator>) {
  const { className, orientation = 'vertical', ...rest } = props
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto',
        className,
      )}
      {...rest}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
