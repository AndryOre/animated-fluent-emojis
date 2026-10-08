---
title: Panoramica
sourceHash: 4101ae648cca44fe
---

L'API completa di `animated-fluent-emojis`, un argomento per pagina. Per
l'installazione e il tuo primo emoji, parti dal [README](../README.md).

Le [props](guide/props.md) sono condivise da tutti gli adapter; ogni sezione
dedicata a un [framework](guide/frameworks.md) spiega come si scrive ciascuna
prop in quel contesto. Il componente recupera un piccolo manifest dall'asset
site la prima volta che viene renderizzato un emoji, mai al momento dell'import.
Durante il caricamento `Emoji` renderizza un segnaposto vuoto, con
`aria-hidden`, alla dimensione finale, così il layout non si sposta. Se l'id è
sconosciuto, renderizza il tuo nodo `fallback`, oppure niente. Se il manifest
non può essere caricato, renderizza il tuo nodo `fallback`, oppure niente, e
riprova al successivo mount, alla successiva chiamata a `preloadEmojis` o quando
il browser torna online.

## Installazione

```sh
bun add animated-fluent-emojis
```

## Guida

- [Frameworks](guide/frameworks.md): React, Vue, Svelte, Astro, HTML semplice e
  `createEmoji`.
- [Props](guide/props.md): ogni prop, il suo tipo e il suo valore predefinito.
- [Comportamento](guide/behavior.md): hover e focus, movimento ridotto, fallback
  e riproduzione.
- [Asset](guide/assets.md): immagini e sprite sheet HD, precaricamento e asset
  site.
- [Lookup](guide/lookup.md): trova gli emoji per glifo, testo o descrizione.
- [Tipi](guide/types.md): i tipi esportati.
