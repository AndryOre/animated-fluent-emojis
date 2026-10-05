import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react'

import { useEmojiAnimation, useEmojiStyle } from '../hooks/index.js'
import {
  getSpriteSourceSet,
  getSpriteUrl,
  type EmojiProps,
} from '../utils/index.js'
import { isDevelopment } from '../utils/is-development.js'
import styles from './Emoji.module.css'

const DEFAULT_SIZE = 100

const warnedMissingIds = new Set<string>()

const normalizeSize = (size: number): number =>
  Number.isFinite(size) && Math.round(size) > 0
    ? Math.round(size)
    : DEFAULT_SIZE

const EmojiComponent = (
  {
    id,
    size: requestedSize = DEFAULT_SIZE,
    playOnHover = false,
    animationIterations = 2,
    autoPlay = true,
    skinTone = 'default',
    alt,
    fallback,
    onLoad,
    onError,
    className,
    style,
    ...spanProps
  }: EmojiProps,
  ref: Ref<HTMLSpanElement>,
): ReactElement | null => {
  const size = normalizeSize(requestedSize)
  const { status, emoji } = useEmojiStyle(id)
  const spriteSource = emoji ? getSpriteUrl(emoji, skinTone) : undefined
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const { isInitialAnimationComplete, animationStyle, imageRef } =
    useEmojiAnimation(
      emoji,
      playOnHover,
      animationIterations,
      autoPlay,
      size,
      spriteSource,
      failedSource !== null && failedSource === spriteSource,
    )
  const onErrorRef = useRef(onError)
  const hasReportedErrorRef = useRef(false)
  useEffect(() => {
    onErrorRef.current = onError
  })
  useEffect(() => {
    if (status !== 'error') {
      hasReportedErrorRef.current = false
    } else if (!hasReportedErrorRef.current) {
      hasReportedErrorRef.current = true
      onErrorRef.current?.()
    }
  }, [status])
  useEffect(() => {
    if (status !== 'missing' || !isDevelopment() || warnedMissingIds.has(id)) {
      return
    }
    warnedMissingIds.add(id)
    console.warn(`Unknown emoji id "${id}".`)
  }, [status, id])
  useEffect(() => {
    const retry = () => {
      setFailedSource(null)
    }
    globalThis.addEventListener('online', retry)
    return () => {
      globalThis.removeEventListener('online', retry)
      retry()
    }
  }, [spriteSource])

  const containerStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    display: 'inline-block',
    overflow: 'hidden',
  }

  if (status === 'loading') {
    return (
      <span
        {...spanProps}
        ref={ref}
        aria-hidden="true"
        style={containerStyle}
        className={className}
      />
    )
  }

  const isDecorative = alt === ''
  const renderFallback = (content: ReactNode): ReactElement => (
    <span
      {...spanProps}
      ref={ref}
      aria-hidden={isDecorative || undefined}
      style={containerStyle}
      className={className}
    >
      {content}
    </span>
  )

  if (status === 'error') {
    return fallback === undefined || fallback === null
      ? null
      : renderFallback(fallback)
  }

  if (!emoji) {
    return fallback === undefined || fallback === null
      ? null
      : renderFallback(fallback)
  }

  const source = getSpriteUrl(emoji, skinTone)
  if (failedSource === source) {
    if (fallback === null) return null
    if (fallback !== undefined) return renderFallback(fallback)
    if (!emoji.unicode) return null
    return renderFallback(
      <span
        role="img"
        aria-label={alt ?? emoji.description}
        style={{
          fontSize: `${String(size * 0.75)}px`,
          lineHeight: `${String(size)}px`,
        }}
      >
        {emoji.unicode}
      </span>,
    )
  }

  const containerClassName =
    isInitialAnimationComplete && playOnHover ? styles.animateOnHover : ''

  return (
    <span
      {...spanProps}
      ref={ref}
      aria-hidden={isDecorative || undefined}
      style={containerStyle}
      className={
        [className, containerClassName].filter(Boolean).join(' ') || undefined
      }
    >
      <img
        ref={imageRef}
        alt={alt ?? emoji.description}
        loading="lazy"
        decoding="async"
        draggable="false"
        src={source}
        srcSet={getSpriteSourceSet(emoji, skinTone)}
        sizes={`${String(size)}px`}
        style={animationStyle}
        className={styles.emojiImage}
        onLoad={onLoad}
        onError={(event) => {
          setFailedSource(source)
          onError?.(event)
        }}
      />
    </span>
  )
}

/**
 * Emoji component for displaying animated emojis. Other props, including
 * `className`, `style` and `data-*`, are passed to the root span.
 * @param props - The properties for the Emoji component.
 * @param props.id - The unique identifier of the emoji.
 * @param props.size - The size of the emoji in pixels. Fractions are rounded; anything but a finite positive number falls back to 100.
 * @param props.playOnHover - Whether to play the animation on hover.
 * @param props.animationIterations - How many times to play the animation, or 'infinite'.
 * @param props.autoPlay - Whether to automatically play the animation on mount.
 * @param props.skinTone - The skin tone, for emojis that support it.
 * @param props.alt - Accessible text, defaults to the emoji description. An empty string marks the emoji as decorative.
 * @param props.fallback - Rendered when the image or the manifest fails, or the id is unknown. Defaults to the emoji's Unicode glyph when known; `null` renders nothing.
 * @param props.onLoad - Called when the image loads.
 * @param props.onError - Called when the image fails, and without an event when the manifest fails.
 * @param ref - Forwarded to the root span.
 * @returns The emoji, an empty placeholder of the final size while the manifest loads, or null if the manifest failed to load or the emoji is not found, unless a fallback is given.
 */
// eslint-disable-next-line @eslint-react/no-forward-ref -- React 18 is a supported peer, where ref is not a prop
export const Emoji: ForwardRefExoticComponent<
  EmojiProps & RefAttributes<HTMLSpanElement>
> = forwardRef(EmojiComponent)
Emoji.displayName = 'Emoji'
