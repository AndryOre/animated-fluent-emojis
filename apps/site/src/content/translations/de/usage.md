---
title: Übersicht
sourceHash: 4101ae648cca44fe
---

Die vollständige API von `animated-fluent-emojis`, ein Thema pro Seite. Für die
Installation und dein erstes Emoji beginne mit dem [README](../README.md).

Die [Props](guide/props.md) gelten für alle Adapter; jeder
[Framework](guide/frameworks.md)-Abschnitt erklärt, wie eine Prop dort
geschrieben wird. Die Komponente lädt ein kleines Manifest von der Asset site,
sobald zum ersten Mal ein Emoji gerendert wird, niemals beim Import. Während des
Ladens rendert `Emoji` einen leeren, `aria-hidden` Platzhalter in der
endgültigen Größe, damit sich das Layout nicht verschiebt. Ist die ID unbekannt,
rendert sie deinen `fallback`-Knoten oder nichts. Kann das Manifest nicht
geladen werden, rendert sie deinen `fallback`-Knoten oder nichts und versucht es
beim nächsten Mount, beim nächsten Aufruf von `preloadEmojis` oder erneut,
sobald der Browser wieder online ist.

## Installation

```sh
bun add animated-fluent-emojis
```

## Leitfaden

- [Frameworks](guide/frameworks.md): React, Vue, Svelte, Astro, reines HTML und
  `createEmoji`.
- [Props](guide/props.md): jede Prop, ihr Typ und ihr Standardwert.
- [Verhalten](guide/behavior.md): Hover und Fokus, reduzierte Bewegung, Fallback
  und Wiedergabe.
- [Assets](guide/assets.md): Bilder und HD-Sprite-Sheets, Vorladen und die Asset
  site.
- [Lookup](guide/lookup.md): Emojis per Glyphe, Text oder Beschreibung finden.
- [Typen](guide/types.md): die exportierten Typen.
