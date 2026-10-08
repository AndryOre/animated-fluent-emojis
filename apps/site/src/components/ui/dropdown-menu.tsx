import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utilities'

/**
 * The shadcn dropdown menu root on Base UI. Owns the open state, keyboard
 * navigation and focus return to the trigger.
 * @param props - Base UI menu root props.
 * @returns The menu root, which renders no element of its own.
 */
function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root {...props} />
}

/**
 * The element that opens the menu. It renders a native button; style it with
 * `buttonVariants`.
 * @param props - Base UI menu trigger props.
 * @returns The trigger button.
 */
function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'sideOffset' | 'collisionPadding'
  > & { variant?: 'default' | 'nova' }

const defaultContentStyles =
  'rounded-brand border border-border bg-card p-2 shadow-lg'

const novaContentStyles =
  'min-w-40 rounded-lg bg-popover p-1 ring-1 ring-foreground/10 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] transition-[opacity,scale] duration-100 ease-(--ease-out-strong) data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0'

/**
 * The menu surface, rendered in a portal and positioned against the trigger.
 * Styled with the brand card surface, border and radius.
 * @param props - Popup props plus the positioner `align`, `sideOffset` and
 * `collisionPadding`, and a `variant` (`nova` is the compact menu anatomy).
 * @returns The portaled, positioned popup.
 */
function DropdownMenuContent(props: DropdownMenuContentProps) {
  const {
    align = 'end',
    sideOffset = 8,
    collisionPadding = 8,
    variant = 'default',
    className,
    ...rest
  } = props
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className="z-50 outline-none"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'max-h-(--available-height) origin-(--transform-origin) overflow-y-auto text-card-foreground outline-none',
            variant === 'nova' ? novaContentStyles : defaultContentStyles,
            className,
          )}
          {...rest}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

const itemStyles =
  'flex h-10 w-full cursor-pointer items-center rounded-full px-3 text-sm font-medium text-foreground outline-none select-none data-highlighted:bg-accent data-highlighted:text-primary-text aria-[current=true]:bg-accent'

/**
 * A menu item that is a real link (`<a href>`), so it keeps working as
 * navigation and closes the menu when chosen.
 * @param props - Base UI link item props, including `href`.
 * @returns The styled anchor.
 */
function DropdownMenuLinkItem(props: MenuPrimitive.LinkItem.Props) {
  const { className, ...rest } = props
  return (
    <MenuPrimitive.LinkItem
      data-slot="dropdown-menu-link-item"
      className={cn(itemStyles, className)}
      {...rest}
    />
  )
}

const novaItemStyles =
  'relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50'

/**
 * Groups related items so a {@link DropdownMenuLabel} can name them.
 * @param props - Base UI menu group props.
 * @returns The group element.
 */
function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

/**
 * A group of radio items that shares one selected value.
 * @param props - Base UI radio group props.
 * @returns The radio group element.
 */
function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

/**
 * A radio item that shows a check on the right while it is the selected value.
 * @param props - Base UI radio item props, including `value`.
 * @returns The radio item element.
 */
function DropdownMenuRadioItem(props: MenuPrimitive.RadioItem.Props) {
  const { className, children, ...rest } = props
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(novaItemStyles, 'justify-between pr-8', className)}
      {...rest}
    >
      {children}
      <MenuPrimitive.RadioItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
        <CheckIcon className="size-4" />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  )
}

/**
 * A small muted heading for a group of menu items.
 * @param props - Base UI group label props.
 * @returns The label element.
 */
function DropdownMenuLabel(props: MenuPrimitive.GroupLabel.Props) {
  const { className, ...rest } = props
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
      {...rest}
    />
  )
}

/**
 * A hairline rule between menu sections.
 * @param props - Base UI menu separator props.
 * @returns The separator element.
 */
function DropdownMenuSeparator(props: MenuPrimitive.Separator.Props) {
  const { className, ...rest } = props
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...rest}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}
