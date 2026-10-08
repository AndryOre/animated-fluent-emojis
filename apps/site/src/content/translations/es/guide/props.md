---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

| Prop                | Type                   | Default     | Description                                                                                      |
| ------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| id                  | `EmojiId` or string    | -           | El identificador único del emoji; los ids conocidos se autocompletan                             |
| size                | number or string       | 100         | Píxeles, o cualquier longitud CSS como `2rem` o `var(--size)`                                    |
| playOnHover         | boolean                | false       | Si se reproduce la animación al pasar el cursor y con el foco del teclado                        |
| animationIterations | number or 'infinite'   | 2           | El número de veces que se reproduce la animación al cargar                                       |
| autoPlay            | boolean                | true        | Si se reproduce la animación automáticamente al montar                                           |
| playing             | boolean                | -           | Controla la reproducción; `true` reproduce, `false` pausa, omitida mantiene el valor por defecto |
| onPlaybackEnd       | function               | -           | Se llama una vez cuando termina una ejecución finita de `animationIterations`                    |
| skinTone            | SkinTone               | 'default'   | Tono de piel para los emojis que tienen variantes (ver abajo)                                    |
| alt                 | string                 | description | Texto accesible; por defecto es la descripción del emoji, `""` lo marca como decorativo          |
| className           | string                 | -           | Nombre de clase para el `<span>` raíz, combinado con el propio del componente                    |
| style               | CSSProperties          | -           | Estilo en línea para el `<span>` raíz; `width` y `height` siguen a `size`                        |
| ref                 | `Ref<HTMLSpanElement>` | -           | Se reenvía al `<span>` raíz; funciona en React 18 y 19                                           |
| fallback            | ReactNode              | glyph       | Se renderiza cuando falla la imagen o el manifest, o el id es desconocido; `null`: nada          |
| onLoad              | function               | -           | Se llama cuando carga el sprite sheet                                                            |
| onError             | function               | -           | Se llama cuando falla la imagen, y sin evento cuando falla el manifest                           |

Cualquier otro atributo de `<span>` (`data-*`, `aria-*`, `title`, manejadores de
eventos) se pasa a la raíz. Un `size` numérico se redondea; cualquier valor que
no sea un número finito y positivo vuelve a 100. Un `size` de tipo string se
pasa a CSS tal cual, por lo que `size="2rem"` o `size="var(--emoji-size)"`
funcionan. Un string numérico como `"48"` se trata como el número 48, y la
imagen recibe `sizes="auto"` para los demás strings; un `style` con `width` o
`height` prevalece sobre `size`.

`skinTone` es uno de `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` o `'dark'`. Solo se aplica a los emojis marcados como `diverse`;
para cualquier otro emoji, o un valor desconocido, se usa el sheet por defecto.
`DiverseEmojiId` lista los ids que tienen tonos de piel, y `skinTone` se tipa
contra él cuando `id` es uno de ellos.
