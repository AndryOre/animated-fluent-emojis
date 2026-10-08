---
title: Verhalten
sourceHash: 1c585e5ee4f3bb6f
---

<a id="hover-and-focus"></a>

## Hover und Fokus

Mit `playOnHover` wird die Animation nach dem ersten Durchlauf abgespielt, wenn
der Zeiger das Emoji betritt, und auch, wenn das Emoji in einem `<button>` oder
`<a>` liegt, das den Tastaturfokus erhält (`:focus-visible`).

<a id="reduced-motion"></a>

## Reduzierte Bewegung

Wenn das System des Nutzers darum bittet, Bewegung zu reduzieren
(`prefers-reduced-motion: reduce`), wird `autoPlay` ignoriert und das Emoji ruht
auf seinem Poster-Frame, dem ersten Bild der Animation. `playOnHover` spielt bei
Hover und Fokus weiterhin ab, da dies eine ausdrückliche Handlung des Nutzers
ist.

## Fallback

Schlägt das Laden des Sprite Sheets fehl, zeigt `Emoji` das Fallback-Glyph: das
native Unicode-Zeichen des Emojis, beschriftet mit `alt`. Übergib `fallback`, um
stattdessen einen eigenen Knoten zu rendern, oder `fallback={null}`, um nichts
zu rendern:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` wird ausgeführt, wenn das Bild fehlschlägt (mit dem Event) und wenn
das Manifest fehlschlägt (ohne eines). Das Fallback-Glyph benötigt das Manifest;
ist das Manifest selbst fehlgeschlagen, wird daher nur ein ausdrücklicher
`fallback`-Knoten gerendert. Eine unbekannte ID rendert den `fallback`-Knoten
oder nichts; sie ruft `onError` nicht auf und warnt in der Entwicklung einmal
pro ID. Die Manifest-Anfrage gibt nach 15 Sekunden auf und wird wie jeder andere
Fehler erneut versucht.

<a id="playback"></a>

## Wiedergabe

Autoplay wartet, bis das Sprite Sheet geladen ist, das Emoji im sichtbaren
Bereich liegt und der Tab sichtbar ist, sodass Emojis außerhalb des Bildschirms
oder im Hintergrund nicht animiert werden. Versteckte Tabs pausieren jedes Emoji
und setzen es fort, wenn der Tab zurückkehrt. Eine Änderung von `id` startet den
ersten Durchlauf des neuen Emojis erneut. Ein `animationIterations` von `0`,
eine negative Zahl oder `NaN` deaktiviert Autoplay; `Infinity` entspricht
`'infinite'`. Solange Autoplay gehalten wird, zeigt das Emoji seinen
Poster-Frame.

Verwende `playing`, um die Wiedergabe selbst zu steuern. `true` spielt
`animationIterations` Durchläufe ab und überschreibt `autoPlay` und reduzierte
Bewegung (wartet aber weiterhin auf das Bild, den sichtbaren Bereich und einen
sichtbaren Tab); `false` pausiert auf dem aktuellen Bild. Ein beendeter
Durchlauf wird durch Umschalten nicht neu gestartet, mounte daher mit einem
neuen `key` neu, um ihn erneut abzuspielen. `onPlaybackEnd` wird einmal
ausgeführt, wenn ein endlicher Durchlauf endet; es läuft nie bei `'infinite'`
oder wenn das Emoji mitten im Durchlauf unmountet wird.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```
