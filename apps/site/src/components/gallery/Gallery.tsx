import { Emoji } from 'animated-fluent-emojis/react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet'

import {
  effectiveTone,
  filterEmojis,
  listCategories,
} from '../../gallery/filter'
import { SKIN_TONES, type SkinTone } from '../../gallery/public-index'
import { fillTemplate } from '../../gallery/template'
import { parseGalleryUrl, serializeGalleryUrl } from '../../gallery/url-state'
import type { Locale } from '../../i18n/locales'
import { ChipGroup } from './ChipGroup'
import { EmojiDetail, type GalleryStrings } from './EmojiDetail'
import { useGalleryData } from './use-gallery-data'

import 'animated-fluent-emojis/style.css'

const SIZES = [64, 96, 128] as const
const PAGE_SIZE = 96
const SKELETON_CELLS = 24
const DESKTOP_QUERY = '(min-width: 860px)'

const TONE_LABELS: Record<SkinTone | 'default', keyof GalleryStrings> = {
  default: 'toneDefault',
  light: 'toneLight',
  'medium-light': 'toneMediumLight',
  medium: 'toneMedium',
  'medium-dark': 'toneMediumDark',
  dark: 'toneDark',
}

/**
 * Properties of {@link Gallery}.
 */
export interface GalleryProps {
  locale: Locale
  searchIndexUrl: string
  strings: GalleryStrings
}

function subscribeToDesktop(onChange: () => void): () => void {
  const list = globalThis.matchMedia(DESKTOP_QUERY)
  list.addEventListener('change', onChange)
  return () => {
    list.removeEventListener('change', onChange)
  }
}

function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => globalThis.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  )
}

function readInitialFilters() {
  return parseGalleryUrl(globalThis.location.search)
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="grid gap-5 min-[860px]:grid-cols-[1fr_340px]">
      <div
        role="status"
        aria-label={label}
        className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5"
      >
        {Array.from({ length: SKELETON_CELLS }, (_, position) => (
          <div
            key={position}
            className="shimmer aspect-square rounded-xl bg-secondary"
          />
        ))}
      </div>
      <div className="shimmer hidden h-[480px] rounded-brand bg-secondary min-[860px]:block" />
    </div>
  )
}

interface MessageProps {
  title: string
  hint: string
  action: string
  onAction: () => void
}

function Message({ title, hint, action, onAction }: MessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-lg font-extrabold">{title}</p>
      <p className="max-w-md text-muted-foreground">{hint}</p>
      <button
        type="button"
        onClick={onAction}
        className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        {action}
      </button>
    </div>
  )
}

/**
 * The emoji gallery island: search, filters, grid and the detail panel.
 * @param props - Where to load the search index from, and the localized UI strings.
 * @returns The search controls, results grid and detail panel.
 */
export function Gallery(props: GalleryProps) {
  const { searchIndexUrl, strings } = props
  const { state, retry } = useGalleryData(searchIndexUrl)
  const [filters, setFilters] = useState(readInitialFilters)
  const [size, setSize] = useState<(typeof SIZES)[number]>(64)
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [focusedSlug, setFocusedSlug] = useState<string | undefined>()
  const isDesktop = useIsDesktop()
  const gridRef = useRef<HTMLDivElement>(null)
  const lastTriggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const query = serializeGalleryUrl(filters)
    globalThis.history.replaceState(
      null,
      '',
      `${globalThis.location.pathname}${query}${globalThis.location.hash}`,
    )
  }, [filters])

  const data = state.status === 'ready' ? state.data : undefined
  const categories = useMemo(
    () => (data ? listCategories(data.emojis) : []),
    [data],
  )
  const names = useMemo(
    () => new Map(data?.searchIndex.map((entry) => [entry.slug, entry.name])),
    [data],
  )
  const results = useMemo(
    () =>
      data
        ? filterEmojis(data.emojis, data.searchIndex, {
            query: filters.query,
            category: filters.category,
          })
        : [],
    [data, filters.query, filters.category],
  )

  const shown = results.slice(0, visibleCount)
  const selected =
    results.find((emoji) => emoji.slug === selectedSlug) ??
    (isDesktop ? results[0] : undefined)
  const tabStop = shown.find((emoji) => emoji.slug === focusedSlug) ?? shown[0]
  const tone = filters.tone

  function updateFilters(change: Partial<typeof filters>) {
    setFilters((current) => ({ ...current, ...change }))
    setVisibleCount(PAGE_SIZE)
  }

  function select(slug: string, trigger: HTMLElement) {
    setSelectedSlug(slug)
    setFocusedSlug(slug)
    lastTriggerRef.current = trigger
    setSheetOpen(true)
  }

  function moveFocus(event: KeyboardEvent<HTMLElement>, position: number) {
    const grid = gridRef.current
    if (!grid) return
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length
    const offsets: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: columns,
      ArrowUp: -columns,
    }
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? shown.length - 1
          : position + (offsets[event.key] ?? NaN)
    const next = shown[target]
    if (!next) return
    event.preventDefault()
    setFocusedSlug(next.slug)
    grid
      .querySelector<HTMLElement>(`[data-slug="${CSS.escape(next.slug)}"]`)
      ?.focus()
  }

  if (state.status === 'loading') return <Skeleton label={strings.loading} />
  if (!data || state.status === 'error') {
    return (
      <Message
        title={strings.errorTitle}
        hint={strings.errorHint}
        action={strings.retry}
        onAction={retry}
      />
    )
  }

  const placeholder = fillTemplate(
    strings.searchPlaceholder,
    'count',
    data.emojis.length.toLocaleString(),
  )
  const detail = selected && (
    <EmojiDetail
      emoji={selected}
      name={names.get(selected.slug) ?? selected.description}
      tone={tone}
      size={size}
      strings={strings}
      headingId="gallery-detail-heading"
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        value={filters.query}
        onChange={(event) => {
          updateFilters({ query: event.target.value })
        }}
        aria-label={strings.searchLabel}
        placeholder={placeholder}
      />
      <ChipGroup
        label={strings.categoryLabel}
        chips={[
          { value: '', label: strings.categoryAll },
          ...categories.map((category) => ({
            value: category,
            label: category,
          })),
        ]}
        selected={filters.category ?? ''}
        onSelect={(value) => {
          updateFilters({ category: value === '' ? undefined : value })
        }}
      />
      <ChipGroup
        label={strings.toneLabel}
        chips={(['default', ...SKIN_TONES] as const).map((value) => ({
          value,
          label: strings[TONE_LABELS[value]],
        }))}
        selected={tone ?? 'default'}
        onSelect={(value) => {
          updateFilters({ tone: value === 'default' ? undefined : value })
        }}
        disabled={selected?.tones.length === 0}
        disabledHint={strings.noSkinTones}
      />
      <ChipGroup
        label={strings.sizeLabel}
        chips={SIZES.map((value) => ({ value, label: String(value) }))}
        selected={size}
        onSelect={setSize}
      />
      <p role="status" className="sr-only">
        {fillTemplate(strings.resultsCount, 'count', String(results.length))}
      </p>
      {results.length === 0 ? (
        <Message
          title={fillTemplate(strings.noResultsTitle, 'query', filters.query)}
          hint={strings.noResultsHint}
          action={strings.clearSearch}
          onAction={() => {
            updateFilters({ query: '', category: undefined })
          }}
        />
      ) : (
        <div className="grid items-start gap-5 min-[860px]:grid-cols-[1fr_340px]">
          <div className="flex flex-col items-center gap-4">
            <div
              ref={gridRef}
              role="group"
              aria-label={strings.resultsLabel}
              className="grid w-full grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5"
            >
              {shown.map((emoji) => {
                const name = names.get(emoji.slug) ?? emoji.description
                const isSelected = selected?.slug === emoji.slug
                return (
                  <button
                    key={emoji.slug}
                    type="button"
                    data-slug={emoji.slug}
                    aria-pressed={isSelected}
                    aria-label={name}
                    tabIndex={tabStop?.slug === emoji.slug ? 0 : -1}
                    onClick={(event) => {
                      select(emoji.slug, event.currentTarget)
                    }}
                    onFocus={() => {
                      setFocusedSlug(emoji.slug)
                    }}
                    onKeyDown={(event) => {
                      moveFocus(event, shown.indexOf(emoji))
                    }}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-1 hover:bg-secondary aria-pressed:ring-2 aria-pressed:ring-primary"
                  >
                    <Emoji
                      id={emoji.id}
                      size={48}
                      skinTone={effectiveTone(emoji, tone)}
                      autoPlay={false}
                      playOnHover
                      alt=""
                    />
                    <span className="w-full truncate font-mono text-[10px] text-muted-foreground">
                      {name}
                    </span>
                  </button>
                )
              })}
            </div>
            {shown.length < results.length && (
              <button
                type="button"
                onClick={() => {
                  setVisibleCount((count) => count + PAGE_SIZE)
                }}
                className="h-10 rounded-full border border-border px-5 text-sm font-semibold hover:bg-secondary"
              >
                {strings.showMore}
              </button>
            )}
          </div>
          {isDesktop ? (
            <aside
              aria-labelledby="gallery-detail-heading"
              className="sticky top-[72px] rounded-brand border border-border bg-card p-5"
            >
              {detail}
            </aside>
          ) : (
            <Sheet
              open={sheetOpen && Boolean(detail)}
              onOpenChange={setSheetOpen}
            >
              <SheetContent
                side="bottom"
                aria-labelledby="gallery-detail-heading"
                finalFocus={lastTriggerRef}
              >
                <SheetClose
                  render={<Button variant="ghost" shape="pill" />}
                  className="mb-2 ml-auto flex h-8 px-3 font-semibold"
                >
                  {strings.closeDetail}
                </SheetClose>
                {detail}
              </SheetContent>
            </Sheet>
          )}
        </div>
      )}
    </div>
  )
}
