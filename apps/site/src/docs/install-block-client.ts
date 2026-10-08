import {
  createPackageManagerStore,
  isPackageManager,
  type PackageManager,
} from '../lib/package-manager'

function applyManager(manager: PackageManager): void {
  for (const block of document.querySelectorAll('[data-install-block]')) {
    for (const button of block.querySelectorAll(
      'button[data-package-manager]',
    )) {
      button.setAttribute(
        'aria-pressed',
        String((button as HTMLElement).dataset.packageManager === manager),
      )
    }
    for (const panel of block.querySelectorAll('.afe-install-panel')) {
      panel.toggleAttribute(
        'hidden',
        (panel as HTMLElement).dataset.packageManager !== manager,
      )
    }
  }
}

/**
 * Wires the install blocks of a docs page to the shared `afe:pm` preference:
 * shows the stored manager on load, switches on click and follows changes made
 * by other blocks.
 */
export function initInstallBlocks(): void {
  if (!document.querySelector('[data-install-block]')) {
    return
  }
  const store = createPackageManagerStore()
  applyManager(store.get())
  store.subscribe(applyManager)
  document.addEventListener('click', (event) => {
    const button = (event.target as Element).closest(
      '[data-install-block] button[data-package-manager]',
    )
    const manager = (button as HTMLElement | null)?.dataset.packageManager
    if (isPackageManager(manager)) {
      store.set(manager)
    }
  })
}
