import { Menu as MenuPrimitive } from '@base-ui/react/menu'

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
  >

/**
 * The menu surface, rendered in a portal and positioned against the trigger.
 * Styled with the brand card surface, border and radius.
 * @param props - Popup props plus the positioner `align`, `sideOffset` and
 * `collisionPadding`.
 * @returns The portaled, positioned popup.
 */
function DropdownMenuContent(props: DropdownMenuContentProps) {
  const {
    align = 'end',
    sideOffset = 8,
    collisionPadding = 8,
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
            'max-h-(--available-height) origin-(--transform-origin) overflow-y-auto rounded-brand border border-border bg-card p-2 text-card-foreground shadow-lg outline-none',
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

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
}
