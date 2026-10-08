import { Emoji } from 'animated-fluent-emojis/react'
import { CopyIcon, DownloadIcon, LinkIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utilities'

import { effectiveTone } from '../../gallery/filter'
import {
  FILE_FORMATS,
  fileUrl,
  type PublicEmoji,
  type SkinTone,
} from '../../gallery/public-index'
import { generateSnippet, type SnippetKind } from '../../gallery/snippets'
import type { UiStrings } from '../../i18n/ui'
import CodeBlock from '../CodeBlock'

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

const ZOOMS = [1, 2] as const

const STAGE_DOTS =
  '[background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]'

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

/**
 * Wraps plain snippet text in the same line markup the build-time highlighter
 * emits, so the shared code block can show it unhighlighted.
 * @param code - The plain snippet.
 * @returns Escaped markup with one `ec-line` per line.
 */
function plainCodeHtml(code: string): string {
  const lines = code
    .split('\n')
    .map((line) => {
      const escaped = line.replaceAll(
        /[&<>"]/g,
        (character) => HTML_ESCAPES[character] ?? '',
      )
      return `<div class="ec-line"><span class="code">${escaped}</span></div>`
    })
    .join('')
  return `<pre><code>${lines}</code></pre>`
}

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
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]>(1)
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
  const tabs = TABS.map((tab) => {
    const code = generateSnippet(emoji, tab.kind, { size, tone: appliedTone })
    return {
      id: tab.kind,
      label: strings[tab.label],
      code,
      html: plainCodeHtml(code),
    }
  })

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

  const transitionName = page ? `emoji-${emoji.slug}` : undefined

  return (
    <div className="flex flex-col gap-4">
      <div
        style={{ viewTransitionName: transitionName }}
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-xl bg-muted/40',
          STAGE_DOTS,
          page ? 'aspect-square' : 'aspect-square max-h-72 w-full',
        )}
      >
        <div
          role="group"
          aria-label={strings.zoomLabel}
          className="absolute top-2 right-2 z-10 flex rounded-lg border border-border bg-card p-0.5"
        >
          {ZOOMS.map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={zoom === level}
              onClick={() => {
                setZoom(level)
              }}
              className="h-6 min-w-8 cursor-pointer rounded-md px-1.5 font-mono text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {level}×
            </button>
          ))}
        </div>
        <div
          className="relative transition-transform duration-200 ease-(--ease-out-strong)"
          style={{
            width: size,
            height: size,
            transform: `scale(${String(zoom)})`,
          }}
        >
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
      <div className="min-w-0">
        {!page && (
          <div className="flex items-center gap-1">
            <h2
              id={headingId}
              className="min-w-0 truncate text-xl font-extrabold"
            >
              {name}
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0 text-muted-foreground"
              aria-label={strings.copyName}
              onClick={() => void copy(name)}
            >
              <CopyIcon />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-1">
          <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
            <span className="sr-only">{strings.idLabel}: </span>
            {emoji.id}
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0 text-muted-foreground"
            aria-label={strings.copyId}
            onClick={() => void copy(emoji.id)}
          >
            <CopyIcon />
          </Button>
        </div>
      </div>
      <CodeBlock
        tabs={tabs}
        labels={{
          tabsLabel: strings.snippetLabel,
          copy: strings.copySnippet,
          copied: strings.copied,
        }}
        lineNumbers={false}
        activeId={kind}
        onActiveChange={(id) => {
          setKind(id as SnippetKind)
        }}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={strings.copyUrl}
          onClick={() => void copy(fileUrl(files.urls.gif))}
        >
          <LinkIcon />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}
          >
            <DownloadIcon />
            {strings.download}
          </DropdownMenuTrigger>
          <DropdownMenuContent variant="nova" align="end">
            {FILE_FORMATS.map((format) => (
              <DropdownMenuItem
                key={format}
                onClick={() => void download(format)}
              >
                <span className="flex-1">
                  {strings[DOWNLOAD_LABELS[format]]}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-xs text-muted-foreground"
                >
                  .{format}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={
          status === ''
            ? 'sr-only'
            : 'fixed right-4 bottom-4 z-50 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md'
        }
      >
        {status}
      </p>
    </div>
  )
}
