import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const HOLDERLESS_GRACE_MS = 2000

/**
 * Who holds a lock directory. Every holder payload carries these three
 * fields; callers may widen it with their own.
 */
export interface LockHolder {
  readonly pid: number
  readonly worktree: string
  readonly acquiredAt: number
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH'
  }
}

/**
 * Reads the holder payload of a lock directory.
 * @param lockDirectory The lock directory to read.
 * @returns The holder, or `undefined` when `holder.json` is missing or invalid.
 */
export function readLockHolder(lockDirectory: string): LockHolder | undefined {
  try {
    const raw = readFileSync(path.join(lockDirectory, 'holder.json'), 'utf8')
    return JSON.parse(raw) as LockHolder
  } catch {
    return undefined
  }
}

/**
 * Whether a lock should be treated as abandoned. A holder-less directory is
 * stale only after a short grace period, since `mkdirSync` and the holder
 * write are two separate steps. A held lock is stale when its pid is dead, or
 * when it is older than `maxAgeMs` and its worktree no longer exists (a
 * recycled pid); age alone never reclaims a live holder.
 * @param lockDirectory The lock directory to check.
 * @param maxAgeMs The pid-reuse fallback age, in ms.
 * @returns Whether the lock should be reclaimed.
 */
export function isLockStale(lockDirectory: string, maxAgeMs: number): boolean {
  const holder = readLockHolder(lockDirectory)
  if (!holder) {
    const { birthtimeMs } = statSync(lockDirectory)
    return Date.now() - birthtimeMs > HOLDERLESS_GRACE_MS
  }
  return (
    !isProcessAlive(holder.pid) ||
    (Date.now() - holder.acquiredAt > maxAgeMs && !existsSync(holder.worktree))
  )
}

/**
 * One-shot, non-blocking acquire. `mkdirSync` without `recursive` is the
 * atomic primitive: of two racing processes exactly one wins.
 * @param lockDirectory The lock directory to create.
 * @param holder The holder payload to write into it.
 * @returns Whether this call acquired the lock.
 */
export function didAcquireLock(
  lockDirectory: string,
  holder: LockHolder,
): boolean {
  try {
    mkdirSync(lockDirectory)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false
    throw error
  }
  const temporaryPath = path.join(
    lockDirectory,
    `.holder.${String(process.pid)}.tmp`,
  )
  writeFileSync(temporaryPath, JSON.stringify(holder))
  renameSync(temporaryPath, path.join(lockDirectory, 'holder.json'))
  return true
}

/**
 * Releases a lock by removing its directory.
 * @param lockDirectory The lock directory to remove.
 */
export function releaseLock(lockDirectory: string): void {
  rmSync(lockDirectory, { recursive: true, force: true })
}

/** Timing and logging options of {@link acquireLock}. */
export interface AcquireLockOptions {
  readonly timeoutMs: number
  readonly pollIntervalMs: number
  readonly maxAgeMs: number
  readonly logLabel: string
}

/**
 * Polls for the lock until acquired, reclaiming it immediately when its
 * holder is stale. `buildHolder` runs on every attempt so the recorded
 * acquisition time is real.
 * @param lockDirectory The lock directory to acquire.
 * @param buildHolder Builds the holder payload for each attempt.
 * @param options Timeout, poll interval, staleness and logging config.
 * @returns Resolves once the lock is held; rejects after `timeoutMs`.
 */
export async function acquireLock(
  lockDirectory: string,
  buildHolder: () => LockHolder,
  options: AcquireLockOptions,
): Promise<void> {
  const { timeoutMs, pollIntervalMs, maxAgeMs, logLabel } = options
  const deadline = Date.now() + timeoutMs
  for (;;) {
    if (didAcquireLock(lockDirectory, buildHolder())) return
    if (existsSync(lockDirectory) && isLockStale(lockDirectory, maxAgeMs)) {
      console.log(`${logLabel}: reclaiming a stale lock...`)
      rmSync(lockDirectory, { recursive: true, force: true })
      continue
    }
    if (Date.now() >= deadline) {
      const holder = readLockHolder(lockDirectory)
      throw new Error(
        `${logLabel}: timed out after ${String(timeoutMs)}ms waiting for the lock` +
          (holder
            ? ` (held by pid ${String(holder.pid)} in ${holder.worktree})`
            : '') +
          ' — another process is mid-run. Re-run this command to retry.',
      )
    }
    await sleep(pollIntervalMs)
  }
}
