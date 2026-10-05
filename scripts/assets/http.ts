/**
 * Fetch signature used by the asset scripts so tests can inject a fake.
 */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

/**
 * Fetches a URL and fails on any non-2xx status, retrying transient failures.
 * @param fetchImplementation The fetch function to use.
 * @param url The URL to request.
 * @param init Optional request options.
 * @param attempts How many times to try before giving up.
 * @returns The successful response.
 */
export async function fetchOk(
  fetchImplementation: FetchLike,
  url: string,
  init?: RequestInit,
  attempts = 3,
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImplementation(url, init)
      if (response.ok) return response
      lastError = new Error(`HTTP ${String(response.status)} for ${url}`)
      if (response.status >= 400 && response.status < 500) break
    } catch (error: unknown) {
      lastError = error
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500))
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/**
 * Runs an async worker over items with a fixed concurrency limit.
 * @param items The items to process.
 * @param limit Maximum number of workers running at once.
 * @param worker Async function applied to each item.
 * @returns The results in the same order as the items.
 */
export async function mapWithConcurrency<Item, Result>(
  items: readonly Item[],
  limit: number,
  worker: (item: Item, index: number) => Promise<Result>,
): Promise<Result[]> {
  const results = Array.from<Result>({ length: items.length })
  let nextIndex = 0
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex
        nextIndex += 1
        results[index] = await worker(items[index] as Item, index)
      }
    },
  )
  await Promise.all(runners)
  return results
}
