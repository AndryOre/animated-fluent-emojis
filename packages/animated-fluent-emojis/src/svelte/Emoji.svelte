<script lang="ts">
  import { mount, unmount, untrack, type Snippet } from 'svelte'

  import FallbackHost from './FallbackHost.svelte'
  import {
    createEmoji,
    normalizeSize,
    toCssLength,
    type EmojiController,
    type EmojiOptions,
  } from './runtime.js'
  import type { EmojiProps } from './types.js'

  const props: EmojiProps = $props()

  let host: HTMLElement | undefined = $state()
  let isMounted = $state(false)
  let controller: EmojiController | undefined
  let activeFallback: Record<string, unknown> | undefined
  let cachedSnippet: Snippet | undefined
  let cachedBuilder: (() => Node) | undefined

  const placeholderStyle = $derived.by(() => {
    const cssSize = toCssLength(normalizeSize(props.size ?? 100))
    return `width:${cssSize};height:${cssSize};display:inline-block;overflow:hidden`
  })

  const releaseFallback = (): void => {
    if (activeFallback) void unmount(activeFallback)
    activeFallback = undefined
  }

  const toFallbackBuilder = (snippet: Snippet): (() => Node) => {
    if (snippet === cachedSnippet && cachedBuilder) return cachedBuilder
    cachedSnippet = snippet
    cachedBuilder = () => {
      releaseFallback()
      const node = document.createElement('span')
      node.style.display = 'contents'
      activeFallback = mount(FallbackHost, {
        target: node,
        props: { content: snippet },
      })
      return node
    }
    return cachedBuilder
  }

  const readOptions = (): EmojiOptions => ({
    id: props.id,
    size: props.size,
    playOnHover: props.playOnHover,
    animationIterations: props.animationIterations,
    autoPlay: props.autoPlay,
    playing: props.playing,
    skinTone: props.skinTone,
    alt: props.alt,
    fallback:
      typeof props.fallback === 'function'
        ? toFallbackBuilder(props.fallback)
        : props.fallback,
    onLoad: (event) => props.onLoad?.(event),
    onError: (event) => props.onError?.(event),
    onPlaybackEnd: () => props.onPlaybackEnd?.(),
    className: props.class,
    style: props.style,
    attributes: props.attributes,
  })

  $effect(() => {
    const target = host
    if (!target) return
    untrack(() => {
      isMounted = true
      controller = createEmoji(target, readOptions())
    })
    return () => {
      controller?.destroy()
      controller = undefined
      releaseFallback()
    }
  })

  $effect(() => {
    const options = readOptions()
    controller?.update(options)
  })
</script>

<animated-fluent-emoji style="display:contents" bind:this={host}>
  {#if !isMounted}
    <span aria-hidden="true" class={props.class} style={placeholderStyle}></span>
  {/if}
</animated-fluent-emoji>
