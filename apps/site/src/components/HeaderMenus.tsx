import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utilities'

interface MenuLink {
  href: string
  label: string
}

interface LocaleOption {
  code: string
  name: string
  href: string
}

interface HeaderMenusProps {
  menuLabel: string
  navLabel: string
  links: MenuLink[]
  languageLabel: string
  currentLocale: string
  currentLocaleName: string
  locales: LocaleOption[]
}

const triggerClass = cn(
  buttonVariants({ variant: 'outline', shape: 'pill' }),
  'h-10 px-3 max-[400px]:px-2',
)

/**
 * The header's mobile navigation and language picker as two shadcn dropdown
 * menus. Every entry is a real link, so navigation survives a failed hydration.
 * @param props - Translated labels, the nav links, and the locale options.
 * @returns The two menu triggers with their popups.
 */
export default function HeaderMenus(props: HeaderMenusProps) {
  const {
    menuLabel,
    navLabel,
    links,
    languageLabel,
    currentLocale,
    currentLocaleName,
    locales,
  } = props
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(triggerClass, 'min-[860px]:hidden')}>
          {menuLabel}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" aria-label={navLabel}>
          {links.map((link) => (
            <DropdownMenuLinkItem key={link.href} href={link.href}>
              {link.label}
            </DropdownMenuLinkItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${currentLocaleName} (${languageLabel})`}
          className={triggerClass}
        >
          <span
            lang={currentLocale}
            className="max-[480px]:max-w-24 max-[480px]:truncate max-[400px]:max-w-16"
          >
            {currentLocaleName}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-80 w-56">
          {locales.map((option) => (
            <DropdownMenuLinkItem
              key={option.code}
              href={option.href}
              lang={option.code}
              hrefLang={option.code}
              aria-current={option.code === currentLocale ? 'true' : undefined}
            >
              {option.name}
            </DropdownMenuLinkItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
