import { Emoji } from 'animated-fluent-emojis/react'
import { Search, SlidersHorizontal } from 'lucide-react'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  effectiveTone,
  filterEmojis,
  listCategories,
} from '../../gallery/filter'
import { fillTemplate } from '../../gallery/template'
import { parseGalleryUrl, serializeGalleryUrl } from '../../gallery/url-state'
import type { Locale } from '../../i18n/locales'
import { EmojiDetail, type GalleryStrings } from './EmojiDetail'
import { GallerySidebar, type GallerySize } from './GallerySidebar'
import { useGalleryData } from './use-gallery-data'

import 'animated-fluent-emojis/style.css'

const PAGE_SIZE = 96
const SKELETON_CELLS = 24
const DESKTOP_QUERY = '(min-width: 860px)'
const LARGE_QUERY = '(min-width: 1100px)'
const TOOLTIP_DELAY = 300

/**
 * Properties of {@link Gallery}.
 */
export interface GalleryProps {
  locale: Locale
  searchIndexUrl: string
  strings: GalleryStrings
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = globalThis.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => {
        list.removeEventListener('change', onChange)
      }
    },
    () => globalThis.matchMedia(query).matches,
    () => true,
  )
}

function getShortcutHint(): string {
  return /mac|iphone|ipad/i.test(globalThis.navigator.userAgent)
    ? '⌘K'
    : 'Ctrl K'
}

function readInitialFilters() {
  return parseGalleryUrl(globalThis.location.search)
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="grid gap-5 min-[1100px]:grid-cols-[1fr_340px]">
      <div
        role="status"
        aria-label={label}
        className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2"
      >
        {Array.from({ length: SKELETON_CELLS }, (_, position) => (
          <div
            key={position}
            className="shimmer aspect-square rounded-[10px] bg-secondary"
          />
        ))}
      </div>
      <div className="shimmer hidden h-[480px] rounded-brand bg-secondary min-[1100px]:block" />
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
  const [size, setSize] = useState<GallerySize>(64)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [focusedSlug, setFocusedSlug] = useState<string | undefined>()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const isLargeScreen = useMediaQuery(LARGE_QUERY)
  const searchRef = useRef<HTMLInputElement>(null)
  const filtersButtonRef = useRef<HTMLButtonElement>(null)
  const shortcutHint = useMemo(() => getShortcutHint(), [])

  useEffect(() => {
    function focusSearch(event: globalThis.KeyboardEvent) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
      if (!isShortcut) return
      event.preventDefault()
      searchRef.current?.focus()
      searchRef.current?.select()
    }
    globalThis.addEventListener('keydown', focusSearch)
    return () => {
      globalThis.removeEventListener('keydown', focusSearch)
    }
  }, [])
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
  const categoryCounts = useMemo(
    () =>
      categories.map((name) => ({
        name,
        count:
          data?.emojis.filter((emoji) => emoji.category === name).length ?? 0,
      })),
    [categories, data],
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
    (isLargeScreen ? results[0] : undefined)
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

  const sidebar = (
    <GallerySidebar
      strings={strings}
      categories={categoryCounts}
      totalCount={data.emojis.length}
      category={filters.category}
      onCategory={(category) => {
        updateFilters({ category })
      }}
      tone={tone}
      onTone={(next) => {
        updateFilters({ tone: next })
      }}
      toneDisabled={selected?.tones.length === 0}
      size={size}
      onSize={setSize}
    />
  )

  return (
    <TooltipProvider delay={TOOLTIP_DELAY}>
      <div className="grid gap-6 min-[860px]:grid-cols-[240px_1fr]">
        {isDesktop && (
          <aside
            aria-label={strings.filtersButton}
            className="sticky top-[72px] self-start"
          >
            {sidebar}
          </aside>
        )}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-2">
            {!isDesktop && (
              <Button
                ref={filtersButtonRef}
                variant="outline"
                size="lg"
                onClick={() => {
                  setFiltersOpen(true)
                }}
              >
                <SlidersHorizontal aria-hidden="true" />
                {strings.filtersButton}
              </Button>
            )}
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                ref={searchRef}
                type="search"
                value={filters.query}
                onChange={(event) => {
                  updateFilters({ query: event.target.value })
                }}
                aria-label={strings.searchLabel}
                aria-keyshortcuts="Control+K Meta+K"
                placeholder={placeholder}
                className="h-9 rounded-[10px] pr-14 pl-9 text-sm"
              />
              <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-border px-1.5 font-mono text-[11px] text-muted-foreground min-[860px]:block">
                {shortcutHint}
              </kbd>
            </div>
            <p
              role="status"
              className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums"
            >
              {fillTemplate(
                strings.resultsCount,
                'count',
                String(results.length),
              )}
            </p>
          </div>
          {results.length === 0 ? (
            <Message
              title={fillTemplate(
                strings.noResultsTitle,
                'query',
                filters.query,
              )}
              hint={strings.noResultsHint}
              action={strings.clearSearch}
              onAction={() => {
                updateFilters({ query: '', category: undefined })
              }}
            />
          ) : (
            <div className="grid items-start gap-5 min-[1100px]:grid-cols-[1fr_340px]">
              <div className="flex flex-col items-center gap-4">
                <div
                  ref={gridRef}
                  role="group"
                  aria-label={strings.resultsLabel}
                  className="grid w-full grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2"
                >
                  {shown.map((emoji) => {
                    const name = names.get(emoji.slug) ?? emoji.description
                    const isSelected = selected?.slug === emoji.slug
                    return (
                      <Tooltip key={emoji.slug}>
                        <TooltipTrigger
                          render={
                            <button
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
                              className="flex aspect-square cursor-pointer items-center justify-center rounded-[10px] border border-transparent p-1 transition-colors hover:bg-muted aria-pressed:border-primary"
                            />
                          }
                        >
                          <Emoji
                            id={emoji.id}
                            size={48}
                            skinTone={effectiveTone(emoji, tone)}
                            autoPlay={false}
                            playOnHover
                            alt=""
                          />
                        </TooltipTrigger>
                        <TooltipContent>{name}</TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
                {shown.length < results.length && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setVisibleCount((count) => count + PAGE_SIZE)
                    }}
                  >
                    {strings.showMore}
                  </Button>
                )}
              </div>
              {isLargeScreen ? (
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
      </div>
      {!isDesktop && (
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent
            side="bottom"
            aria-label={strings.filtersButton}
            finalFocus={filtersButtonRef}
          >
            <SheetClose
              render={<Button variant="ghost" shape="pill" />}
              className="mb-2 ml-auto flex h-8 px-3 font-semibold"
            >
              {strings.closeDetail}
            </SheetClose>
            {sidebar}
          </SheetContent>
        </Sheet>
      )}
    </TooltipProvider>
  )
}
