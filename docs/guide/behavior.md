# Behavior

## Hover and focus

With `playOnHover`, the animation plays after the initial run when the pointer
enters the emoji, and also when the emoji sits inside a `<button>` or `<a>` that
receives keyboard focus (`:focus-visible`).

## Reduced motion

When the user's system asks to reduce motion (`prefers-reduced-motion: reduce`),
`autoPlay` is ignored and the emoji rests on its poster frame, the first frame
of the animation. `playOnHover` still plays on hover and focus, because that is
an explicit user action.

## Fallback

If the sprite sheet fails to load, `Emoji` shows the fallback glyph: the emoji's
native Unicode character, labelled with `alt`. Pass `fallback` to render your
own node instead, or `fallback={null}` to render nothing:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` runs when the image fails (with the event) and when the manifest fails
(without one). The fallback glyph needs the manifest, so when the manifest
itself failed only an explicit `fallback` node renders. An unknown id renders
the `fallback` node, or nothing; it does not call `onError` and, in development,
warns once per id. The manifest request gives up after 15 seconds and is retried
like any other failure.

## Playback

Autoplay waits until the sprite sheet has loaded, the emoji is on screen and the
tab is visible, so offscreen or background emojis do not animate. Hidden tabs
pause every emoji and resume when the tab returns. Changing `id` starts the new
emoji's initial run again. `animationIterations` of `0`, a negative number or
`NaN` disables autoplay; `Infinity` is the same as `'infinite'`. While autoplay
is held, the emoji shows its poster frame.

Use `playing` to drive playback yourself. `true` plays `animationIterations`
runs, overriding `autoPlay` and reduced motion (still waiting for the image, the
viewport and a visible tab); `false` pauses on the current frame. A finished run
is not restarted by toggling, so remount with a new `key` to replay.
`onPlaybackEnd` runs once when a finite run ends; it never runs for `'infinite'`
or when the emoji unmounts mid-run.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```
