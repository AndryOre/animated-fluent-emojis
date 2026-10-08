---
title: Resumen
sourceHash: 4101ae648cca44fe
---

La API completa de `animated-fluent-emojis`, un tema por página. Para la
instalación y tu primer emoji, empieza por el [README](../README.md).

Las [props](guide/props.md) son compartidas por todos los adaptadores; cada
sección de [framework](guide/frameworks.md) indica cómo se escribe cada prop
allí. El componente obtiene un manifest pequeño del asset site la primera vez
que se renderiza un emoji, nunca al momento de importar. Mientras carga, `Emoji`
renderiza un marcador vacío y `aria-hidden` con el tamaño final, de modo que el
diseño no se desplaza. Si el id es desconocido, renderiza tu nodo `fallback`, o
nada. Si no se puede cargar el manifest, renderiza tu nodo `fallback`, o nada, y
reintenta en el siguiente montaje, en la siguiente llamada a `preloadEmojis` o
cuando el navegador vuelva a estar en línea.

## Instalación

```sh
bun add animated-fluent-emojis
```

## Guía

- [Frameworks](guide/frameworks.md): React, Vue, Svelte, Astro, HTML simple y
  `createEmoji`.
- [Props](guide/props.md): cada prop, su tipo y su valor por defecto.
- [Comportamiento](guide/behavior.md): hover y foco, movimiento reducido,
  fallback y reproducción.
- [Assets](guide/assets.md): imágenes y sprite sheets HD, precarga y el asset
  site.
- [Lookup](guide/lookup.md): encuentra emojis por glifo, texto o descripción.
- [Tipos](guide/types.md): los tipos exportados.
