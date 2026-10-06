---
title: Usa los emojis sin código
sourceHash: 1a25330011d80c02
---

Pon un emoji animado de Fluent en Slack, Notion, Google Docs, un correo o un
README de GitHub. Solo necesitas un enlace o un archivo. Sin biblioteca, sin
instalación.

Cada emoji, y cada tono de piel, es un archivo simple en el files site:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

Cambia `<slug>` por el nombre del emoji. Por ejemplo, esta es la cara sonriente
con ojos grandes:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

Pega un enlace como ese en tu navegador y aparece el emoji. Haz clic derecho
sobre él para guardar el archivo.

## Encuentra el nombre (el slug)

El slug es la descripción en inglés del emoji, en minúsculas y con guiones entre
las palabras: `grinning-face-with-big-eyes`, `waving-hand`.

Los emojis con tonos de piel agregan una de estas terminaciones: `-light`,
`-medium-light`, `-medium`, `-medium-dark`, `-dark`. Así, `waving-hand` es la
mano amarilla por defecto y `waving-hand-medium-dark` es el mismo saludo en un
tono medio oscuro.

Si dos emojis compartieran nombre, el segundo recibe `-2` (luego `-3`). Un slug
nunca cambia una vez publicado, así que tus enlaces siguen funcionando.

Para explorar todos los nombres, abre el índice:

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## Elige un formato

| Formato | Ruta                | Úsalo para                                        |
| ------- | ------------------- | ------------------------------------------------- |
| GIF     | `/gif/<slug>.gif`   | Todo lo que se anima: Slack, correo, READMEs      |
| WebP    | `/webp/<slug>.webp` | Animación con bordes suaves, sobre fondos oscuros |
| PNG     | `/png/<slug>.png`   | Una imagen fija: Google Docs, Slides              |

## Slack

1. Descarga
   `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`.
2. En Slack, abre el selector de emojis, elige **Add Emoji** y luego **Upload
   Image**.
3. Elige el archivo, ponle un nombre (por ejemplo `wave`) y guarda.

Escribe `:wave:` en cualquier mensaje para usarlo.

## Notion

Pega el enlace de la imagen en una página y elige **Embed as image**, o escribe
`/image`, elige **Embed link** y pega el mismo enlace.

## Google Docs y Slides

Google Docs y Slides muestran una imagen fija, así que usa el PNG. Elige
**Insert**, **Image**, **By URL** y pega:

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## Correo

Inserta el GIF como imagen, desde el archivo o por su enlace. La mayoría de las
aplicaciones de correo lo reproducen. Unas pocas, como algunas versiones de
escritorio de Outlook, muestran solo el primer fotograma.

## Un README de GitHub

Markdown:

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

HTML, si quieres definir el tamaño:

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

Conserva el texto `alt`. Es lo que dice un lector de pantalla.

## Fondos oscuros

La transparencia de un GIF es de todo o nada: cada píxel es totalmente
transparente o totalmente sólido. Por eso, los bordes suaves pueden mostrar un
halo claro sobre un fondo oscuro. En ese caso, usa el WebP o el PNG, que
conservan los bordes suaves.

## Créditos

El arte de los emojis es de Microsoft, y su uso está sujeto a los términos de
Microsoft. Este proyecto no está afiliado a Microsoft ni avalado por ella.
Algunos emojis provienen del repositorio de Microsoft con licencia MIT; el aviso
que se les aplica está en `/LICENSE-fluentui-emoji-animated.txt`. La atribución
está en `/NOTICE.txt`. Revisa los términos que se aplican al arte antes de
usarlo en tu propio trabajo.

¿Estás creando un sitio web o una app? La [guía de uso](../usage.md) cubre la
biblioteca.
