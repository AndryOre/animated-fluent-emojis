import { TerminalIcon } from 'lucide-react'
import { useMemo, useSyncExternalStore } from 'react'

import {
  createPackageManagerStore,
  DEFAULT_PACKAGE_MANAGER,
  installCommand,
  isPackageManager,
  PACKAGE_MANAGERS,
  type PackageManager,
  type PackageManagerStore,
} from '@/lib/package-manager'

import CodeBlock, { type CodeBlockLabels } from './CodeBlock'

export interface InstallBlockProps {
  htmlByManager: Record<PackageManager, string>
  labels: CodeBlockLabels
  store?: PackageManagerStore
}

/**
 * The install command block: a terminal icon, one tab per package manager and
 * a copy button, without line numbers. The chosen manager is shared with every
 * other install block on the page and persists across visits through the
 * package manager store. The server and the first client render show the
 * default manager, then the stored choice is applied after hydration.
 * @param props - Component props.
 * @param props.htmlByManager - The pre-highlighted command per package manager.
 * @param props.labels - Localized tab list and copy button labels.
 * @param props.store - The shared preference; defaults to the page-wide store.
 * @returns The install block card.
 */
export default function InstallBlock({
  htmlByManager,
  labels,
  store: providedStore,
}: InstallBlockProps) {
  const store = useMemo(
    () => providedStore ?? createPackageManagerStore(),
    [providedStore],
  )
  const manager = useSyncExternalStore(
    store.subscribe,
    store.get,
    () => DEFAULT_PACKAGE_MANAGER,
  )

  const tabs = PACKAGE_MANAGERS.map((id) => ({
    id,
    label: id,
    code: installCommand(id),
    html: htmlByManager[id],
  }))

  return (
    <CodeBlock
      tabs={tabs}
      labels={labels}
      lineNumbers={false}
      leading={
        <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
      }
      activeId={manager}
      onActiveChange={(id) => {
        if (isPackageManager(id)) store.set(id)
      }}
    />
  )
}
