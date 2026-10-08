---
title: Comportamiento
sourceHash: 1c585e5ee4f3bb6f
---

<a id="hover-and-focus"></a>

## Hover y foco

Con `playOnHover`, la animación se reproduce después de la ejecución inicial
cuando el puntero entra en el emoji, y también cuando el emoji está dentro de un
`<button>` o un `<a>` que recibe el foco del teclado (`:focus-visible`).

<a id="reduced-motion"></a>

## Movimiento reducido

Cuando el sistema del usuario pide reducir el movimiento
(`prefers-reduced-motion: reduce`), `autoPlay` se ignora y el emoji descansa en
su poster frame, el primer cuadro de la animación. `playOnHover` sigue
reproduciendo al pasar el cursor y con el foco, porque es una acción explícita
del usuario.

## Fallback

Si el sprite sheet no carga, `Emoji` muestra el fallback glyph: el carácter
Unicode nativo del emoji, etiquetado con `alt`. Pasa `fallback` para renderizar
tu propio nodo en su lugar, o `fallback={null}` para no renderizar nada:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` se ejecuta cuando falla la imagen (con el evento) y cuando falla el
manifest (sin él). El fallback glyph necesita el manifest, así que cuando el
propio manifest falló solo se renderiza un nodo `fallback` explícito. Un id
desconocido renderiza el nodo `fallback`, o nada; no llama a `onError` y, en
desarrollo, avisa una vez por id. La solicitud del manifest se rinde tras 15
segundos y se reintenta como cualquier otro fallo.

<a id="playback"></a>

## Reproducción

El autoplay espera hasta que el sprite sheet haya cargado, el emoji esté en
pantalla y la pestaña esté visible, por lo que los emojis fuera de pantalla o en
segundo plano no se animan. Las pestañas ocultas pausan todos los emojis y los
reanudan cuando la pestaña vuelve. Cambiar `id` inicia de nuevo la ejecución
inicial del nuevo emoji. Un `animationIterations` de `0`, un número negativo o
`NaN` desactiva el autoplay; `Infinity` equivale a `'infinite'`. Mientras el
autoplay está retenido, el emoji muestra su poster frame.

Usa `playing` para controlar la reproducción tú mismo. `true` reproduce
`animationIterations` ejecuciones, anulando `autoPlay` y el movimiento reducido
(esperando aún la imagen, el viewport y una pestaña visible); `false` pausa en
el cuadro actual. Una ejecución terminada no se reinicia al alternar, así que
vuelve a montar con una nueva `key` para repetirla. `onPlaybackEnd` se ejecuta
una vez cuando termina una ejecución finita; nunca se ejecuta con `'infinite'`
ni cuando el emoji se desmonta a mitad de una ejecución.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```
