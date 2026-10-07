/** How long the "Copied" state stays visible, in milliseconds. */
export const COPIED_MS = 2000

/**
 * Copies text to the clipboard and reports a temporary copied state.
 * A rejected clipboard write leaves the state untouched.
 * @param text - The text to copy.
 * @param showCopied - Called with `true` after a successful copy and with
 * `false` once `COPIED_MS` has elapsed.
 * @returns Resolves after the clipboard write settles.
 */
export async function copyWithFeedback(
  text: string,
  showCopied: (copied: boolean) => void,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    return
  }
  showCopied(true)
  globalThis.setTimeout(() => {
    showCopied(false)
  }, COPIED_MS)
}
