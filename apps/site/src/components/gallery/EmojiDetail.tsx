import { Emoji } from 'animated-fluent-emojis/react'
import { useEffect, useRef, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { effectiveTone } from '../../gallery/filter'
import {
  FILE_FORMATS,
  fileUrl,
  type PublicEmoji,
  type SkinTone,
} from '../../gallery/public-index'
import { generateSnippet, type SnippetKind } from '../../gallery/snippets'
import type { UiStrings } from '../../i18n/ui'

export type GalleryStrings = UiStrings['gallery']

const TABS: readonly { kind: SnippetKind; label: keyof GalleryStrings }[] = [
  { kind: 'react', label: 'tabReact' },
  { kind: 'vue', label: 'tabVue' },
  { kind: 'svelte', label: 'tabSvelte' },
  { kind: 'astro', label: 'tabAstro' },
  { kind: 'element', label: 'tabHtml' },
  { kind: 'no-code', label: 'tabNoCode' },
]

const DOWNLOAD_LABELS = {
  gif: 'downloadGif',
  webp: 'downloadWebp',
  png: 'downloadPng',
} as const

const TOAST_MILLISECONDS = 2000

const BUTTON_CLASS =
  'h-9 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary disabled:opacity-50'

/**
 * Properties of {@link EmojiDetail}.
 */
export interface EmojiDetailProps {
  emoji: PublicEmoji
  name: string
  tone: SkinTone | undefined
  size: number
  strings: GalleryStrings
  headingId?: string
  page?: boolean
}

/**
 * Downloads a public file through fetch and a blob, so the browser saves it
 * instead of navigating to the cross-origin URL.
 * @param url - Absolute file URL.
 * @param filename - Name to save the file as.
 */
async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} answered ${String(response.status)}`)
  }
  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

/**
 * Self-contained detail view of one emoji: live preview, snippet tabs, copy
 * and download actions, and the "Copied" live region. With `page`, the stage
 * is square and the name heading is left to the emoji page.
 * @param props - The emoji, its localized name and the global tone and size.
 * @returns The detail view.
 */
export function EmojiDetail(props: EmojiDetailProps) {
  const { emoji, name, tone, size, strings, headingId, page = false } = props
  const [kind, setKind] = useState<SnippetKind>('react')
  const [status, setStatus] = useState('')
  const [loadedKey, setLoadedKey] = useState<string>()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(
    () => () => {
      clearTimeout(timerRef.current)
    },
    [],
  )

  const appliedTone = effectiveTone(emoji, tone)
  const files =
    emoji.tones.find((variant) => variant.tone === appliedTone) ?? emoji
  const previewKey = `${emoji.id}-${appliedTone ?? 'default'}`
  const animated = loadedKey === previewKey
  const snippet = generateSnippet(emoji, kind, { size, tone: appliedTone })

  function announce(message: string) {
    clearTimeout(timerRef.current)
    setStatus(message)
    timerRef.current = setTimeout(() => {
      setStatus('')
    }, TOAST_MILLISECONDS)
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      announce(strings.copied)
    } catch {
      announce(strings.downloadFailed)
    }
  }

  async function download(format: (typeof FILE_FORMATS)[number]) {
    try {
      await downloadFile(fileUrl(files.urls[format]), `${files.slug}.${format}`)
    } catch {
      announce(strings.downloadFailed)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          page
            ? 'flex aspect-square items-center justify-center rounded-2xl bg-secondary'
            : 'flex h-44 items-center justify-center rounded-brand bg-secondary'
        }
      >
        <div className="relative" style={{ width: size, height: size }}>
          {page && !animated && (
            <img
              src={fileUrl(files.urls.png)}
              alt=""
              width={size}
              height={size}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0"
            />
          )}
          <Emoji
            key={previewKey}
            id={emoji.id}
            size={size}
            skinTone={appliedTone}
            animationIterations="infinite"
            alt={name}
            onLoad={() => {
              setLoadedKey(previewKey)
            }}
          />
        </div>
      </div>
      <div>
        {!page && (
          <h2 id={headingId} className="text-xl font-extrabold">
            {name}
          </h2>
        )}
        <p className="font-mono text-xs text-muted-foreground">
          <span className="sr-only">{strings.idLabel}: </span>
          {emoji.id}
        </p>
      </div>
      <Tabs
        value={kind}
        onValueChange={(value: SnippetKind) => {
          setKind(value)
        }}
      >
        <TabsList activateOnFocus aria-label={strings.snippetLabel}>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.kind} value={tab.kind}>
              {strings[tab.label]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent
          value={kind}
          tabIndex={0}
          className="mt-2 max-h-56 overflow-auto rounded-xl bg-secondary p-3"
        >
          <pre className="font-mono text-xs whitespace-pre">
            <code>{snippet}</code>
          </pre>
        </TabsContent>
      </Tabs>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() => void copy(snippet)}
        >
          {strings.copySnippet}
        </button>
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() => void copy(fileUrl(files.urls.gif))}
        >
          {strings.copyUrl}
        </button>
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() => void copy(emoji.id)}
        >
          {strings.copyId}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILE_FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            className={BUTTON_CLASS}
            onClick={() => void download(format)}
          >
            {strings[DOWNLOAD_LABELS[format]]}
          </button>
        ))}
      </div>
      <p
        role="status"
        aria-live="polite"
        className={
          status === ''
            ? 'sr-only'
            : 'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background'
        }
      >
        {status}
      </p>
    </div>
  )
}
