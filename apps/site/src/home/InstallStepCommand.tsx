import { installCommand } from '@/lib/package-manager'
import { usePackageManager } from '@/lib/use-package-manager'

/**
 * The install command of the landing install step. It follows the page-wide
 * package manager choice, so it matches the hero block and the floating dock.
 * @returns A mono chip with the install command of the chosen manager.
 */
export default function InstallStepCommand() {
  const [manager] = usePackageManager()

  return (
    <code
      data-install-command
      className="mt-auto block min-w-0 truncate rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono text-xs font-semibold sm:text-sm"
    >
      {installCommand(manager)}
    </code>
  )
}
