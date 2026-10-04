import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ADR_DIRECTORY = import.meta.dirname
const ADR_FILE_PATTERN = /^(\d{4})-[\da-z-]+\.md$/
const ALLOWED_STATUSES = /^(Accepted|Proposed|Deprecated|Superseded by .+)$/

interface AdrFile {
  readonly fileName: string
  readonly number: string
  readonly content: string
}

const adrFiles: AdrFile[] = readdirSync(ADR_DIRECTORY)
  .filter((fileName) => ADR_FILE_PATTERN.test(fileName))
  .toSorted((left, right) => left.localeCompare(right))
  .map((fileName) => ({
    fileName,
    number: ADR_FILE_PATTERN.exec(fileName)?.[1] ?? '',
    content: readFileSync(path.join(ADR_DIRECTORY, fileName), 'utf8'),
  }))

const indexContent = readFileSync(path.join(ADR_DIRECTORY, 'README.md'), 'utf8')

describe('ADR invariants', () => {
  it('finds at least one ADR', () => {
    expect(adrFiles.length).toBeGreaterThan(0)
  })

  it('uses unique, contiguous numbers starting at 0001', () => {
    const numbers = adrFiles.map((adr) => Number(adr.number))
    expect(new Set(numbers).size).toBe(numbers.length)
    expect(numbers).toEqual(numbers.map((_, index) => index + 1))
  })

  describe.each(adrFiles)('$fileName', (adr) => {
    it('starts with a "# NNNN: Title" heading matching the file number', () => {
      const firstLine = adr.content.split('\n', 1)[0] ?? ''
      expect(firstLine).toMatch(new RegExp(String.raw`^# ${adr.number}: \S.*$`))
    })

    it('has Status, Context, Decision and Consequences sections', () => {
      for (const section of ['Status', 'Context', 'Decision', 'Consequences']) {
        expect(adr.content).toMatch(new RegExp(`^## ${section}$`, 'm'))
      }
    })

    it('declares a valid status and an ISO date', () => {
      const status = /^## Status\n\n(.+)\n/m.exec(adr.content)?.[1] ?? ''
      expect(status).toMatch(ALLOWED_STATUSES)
      expect(adr.content).toMatch(/^Date: \d{4}-\d{2}-\d{2}$/m)
    })

    it('is listed in the index', () => {
      expect(indexContent).toContain(`](${adr.fileName})`)
    })
  })

  it('lists no ADR in the index that does not exist', () => {
    const linked = Array.from(
      indexContent.matchAll(/\]\((\d{4}-[^)]+\.md)\)/g),
      (match) => match[1] ?? '',
    ).toSorted((left, right) => left.localeCompare(right))
    expect(linked).toEqual(adrFiles.map((adr) => adr.fileName))
  })
})
