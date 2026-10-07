---
title: Руководство по использованию
sourceHash: 1c5618d6e3a40904
---

Полное API `animated-fluent-emojis`. Об установке и первом эмодзи читайте в
[README](../README.md).

- [Frameworks](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [Обычный HTML](#plain-html)
  - [Angular, Solid и Preact](#angular-solid-and-preact)
  - [Без фреймворка](#without-a-framework)
- [Props](#props)
- [Наведение и фокус](#hover-and-focus)
- [Уменьшение анимации](#reduced-motion)
- [Fallback](#fallback)
- [Воспроизведение](#playback)
- [Изображения и HD sprite sheets](#images-and-hd-sprite-sheets)
- [Предзагрузка](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Types](#types)

Приведённые ниже props общие для всех адаптеров; в разделе каждого фреймворка
указано, как prop записывается именно там. Компонент запрашивает небольшой
manifest у asset site при первом рендере эмодзи, а не во время импорта. Пока
manifest загружается, `Emoji` рендерит пустой плейсхолдер с `aria-hidden`
итогового размера, поэтому вёрстка не сдвигается. Если id неизвестен, компонент
рендерит ваш узел `fallback` или ничего. Если manifest не удалось загрузить,
компонент рендерит ваш узел `fallback` или ничего и повторяет попытку при
следующем монтировании, следующем вызове `preloadEmojis` или когда браузер снова
окажется онлайн.

## Frameworks

Один пакет, один путь импорта на каждый фреймворк. `configureEmojis` и
`preloadEmojis` не зависят от фреймворков и остаются в `animated-fluent-emojis`;
см. [Предзагрузка](#preloading) и [Asset site](#asset-site). Все адаптеры
используют одно ядро воспроизведения и проходят один набор тестов на
соответствие, поэтому props везде ведут себя одинаково. См.
[ADR 0014](adr/0014-multi-framework-support.md).

Адаптеры React, Vue и Svelte, а также `createEmoji` берут keyframes из
`animated-fluent-emojis/style.css`; импортируйте его один раз. `<fluent-emoji>`
и компонент Astro приносят свои стили.

### React

Импортируйте `Emoji` из подпути React:

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

Миграция с версии 0.6 и ранее: экспорт `Emoji` из корня был объявлен устаревшим
в 0.6 и удалён в 0.7. Измените путь импорта, больше ничего: props и поведение
идентичны. Тип `EmojiProps` тоже переехал в `animated-fluent-emojis/react`.
`configureEmojis` и `preloadEmojis` остаются в `animated-fluent-emojis`.
Поддерживаются React 18 и 19, а `react` и `react-dom` являются необязательными
peer-зависимостями.

### Vue

Vue 3.3 или новее. `Emoji` принимает приведённые ниже props в camelCase. Слот
`fallback` заменяет изображение, а события: `load`, `error` и `playbackEnd`.
Остальные атрибуты, такие как `class`, `style` и `data-*`, попадают на корневой
span.

```vue
<script setup lang="ts">
import { Emoji } from 'animated-fluent-emojis/vue'

import 'animated-fluent-emojis/style.css'

const handlePlaybackEnd = () => {
  console.log('done')
}
</script>

<template>
  <Emoji
    id="1f44b_wavinghand"
    :size="64"
    play-on-hover
    @playback-end="handlePlaybackEnd"
  >
    <template #fallback><span>👋</span></template>
  </Emoji>
</template>
```

На сервере и во время гидратации компонент рендерит пустой плейсхолдер итогового
размера, поэтому он работает в Nuxt.

### Svelte

Svelte 5. `Emoji` принимает приведённые ниже props; `fallback` является snippet,
а `class`, `style` и `attributes` попадают на корневой span. Колбэки: `onLoad`,
`onError` и `onPlaybackEnd`.

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

На сервере он рендерит плейсхолдер, а эмодзи появляется после гидратации,
поэтому он работает в SvelteKit. В экспорте пакета есть условие `svelte`,
указывающее на исходный код компонента.

### Astro

Astro 5 или новее. Компонент рендерит разметку эмодзи во время сборки, поэтому
спрайт оказывается в HTML ещё до запуска любого скрипта, а небольшой скрипт
запускает воспроизведение в браузере. Он приносит свои стили; импортировать
таблицу стилей не нужно. Именованный слот `fallback` рендерится, когда id
неизвестен или изображение не загрузилось.

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

Props те же, что описаны ниже, кроме колбэков, плюс `class` и `style` в виде
строки. Вместо колбэков корневой span отправляет `emoji-load`, `emoji-error` и
`playback-end` как всплывающие DOM-события. Скрипт в браузере также запускается
повторно при `astro:page-load`, поэтому view transitions продолжают работать.

### Обычный HTML

Импорт `animated-fluent-emojis/element` регистрирует `<fluent-emoji>`. Таблица
стилей не нужна: keyframes находятся в его shadow root.

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

Атрибуты повторяют props в kebab-case: `id`, `size`, `play-on-hover`,
`animation-iterations`, `auto-play`, `playing`, `skin-tone` и `alt`. Булев
атрибут включён, если его значение не равно `false`. Те же имена существуют как
camelCase-свойства элемента (`element.playOnHover = true`); установка свойства
не переписывает атрибут. Элемент с `slot="fallback"` является fallback. Элемент
отправляет `emoji-load`, `emoji-error` и `playback-end` как всплывающие
composed-события.

Пока элемент не определён, у него нет размера. Добавьте в CSS страницы
`FLUENT_EMOJI_PRE_UPGRADE_CSS`, экспортируемый из той же точки входа, чтобы
зарезервировать место по атрибуту `size` (в пикселях) и избежать сдвига вёрстки.

### Angular, Solid и Preact

Они используют `<fluent-emoji>` через собственный синтаксис шаблонов; см. how-to
руководства для [Angular](how-to/use-with-angular.md),
[Solid](how-to/use-with-solid.md) и [Preact](how-to/use-with-preact.md). То же
относится к Lit, Alpine и htmx: импортируйте `animated-fluent-emojis/element` и
пишите тег.

### Без фреймворка

`createEmoji` рендерит в любой DOM-узел и возвращает контроллер. Это ядро
каждого адаптера, не зависящее от фреймворков. Его импорт не затрагивает DOM.

```js
import { createEmoji } from 'animated-fluent-emojis'

import 'animated-fluent-emojis/style.css'

const controller = createEmoji(document.querySelector('#slot'), {
  id: '1f44b_wavinghand',
  size: 64,
  fallback: () => document.createTextNode('👋'),
})

controller.update({ playing: false })
controller.destroy()
```

Его опции — это props, описанные ниже, плюс `className`, `style` и `attributes`
для корневого span, колбэки `onLoad`, `onError` и `onPlaybackEnd` и `fallback`,
который может быть узлом, функцией, возвращающей узел, или `null`.

## Props

| Prop                | Type                   | Default     | Description                                                                                                           |
| ------------------- | ---------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | Уникальный идентификатор эмодзи; известные id дополняются автоматически                                               |
| size                | number or string       | 100         | Пиксели или любая CSS-длина, например `2rem` или `var(--size)`                                                        |
| playOnHover         | boolean                | false       | Воспроизводить ли анимацию при наведении и при фокусе с клавиатуры                                                    |
| animationIterations | number or 'infinite'   | 2           | Сколько раз воспроизводить анимацию при загрузке                                                                      |
| autoPlay            | boolean                | true        | Запускать ли анимацию автоматически при монтировании                                                                  |
| playing             | boolean                | -           | Управляет воспроизведением; `true` запускает, `false` ставит на паузу, если не задан, действует значение по умолчанию |
| onPlaybackEnd       | function               | -           | Вызывается один раз, когда завершается конечный запуск `animationIterations`                                          |
| skinTone            | SkinTone               | 'default'   | Оттенок кожи для эмодзи с вариантами (см. ниже)                                                                       |
| alt                 | string                 | description | Доступный текст; по умолчанию описание эмодзи, `""` помечает его как декоративное                                     |
| className           | string                 | -           | Имя класса для корневого `<span>`, объединяется с собственным классом компонента                                      |
| style               | CSSProperties          | -           | Встроенный стиль для корневого `<span>`; `width` и `height` следуют за `size`                                         |
| ref                 | `Ref<HTMLSpanElement>` | -           | Передаётся корневому `<span>`; работает в React 18 и 19                                                               |
| fallback            | ReactNode              | glyph       | Рендерится, если изображение или manifest не загрузились либо id неизвестен; `null`: ничего                           |
| onLoad              | function               | -           | Вызывается, когда sprite sheet загружен                                                                               |
| onError             | function               | -           | Вызывается при сбое изображения, а при сбое manifest вызывается без события                                           |

Любой другой атрибут `<span>` (`data-*`, `aria-*`, `title`, обработчики событий)
передаётся корневому элементу. Числовой `size` округляется; всё, кроме конечного
положительного числа, заменяется на 100. Строковый `size` передаётся в CSS как
есть, поэтому работают `size="2rem"` и `size="var(--emoji-size)"`. Числовая
строка вроде `"48"` трактуется как число 48, а для остальных строк изображение
получает `sizes="auto"`; `style` с `width` или `height` приоритетнее `size`.

`skinTone` принимает одно из значений: `'default'`, `'light'`, `'medium-light'`,
`'medium'`, `'medium-dark'` или `'dark'`. Он применяется только к эмодзи,
помеченным как `diverse`; для любого другого эмодзи или неизвестного значения
используется sheet по умолчанию. `DiverseEmojiId` перечисляет id, у которых есть
оттенки кожи, и `skinTone` типизируется по нему, когда `id` — один из них.

### Наведение и фокус

С `playOnHover` анимация проигрывается после первоначального запуска, когда
указатель входит в область эмодзи, а также когда эмодзи находится внутри
`<button>` или `<a>`, получающего фокус с клавиатуры (`:focus-visible`).

### Уменьшение анимации

Когда система пользователя просит уменьшить анимацию
(`prefers-reduced-motion: reduce`), `autoPlay` игнорируется, и эмодзи остаётся
на poster frame — первом кадре анимации. `playOnHover` по-прежнему проигрывается
при наведении и фокусе, потому что это явное действие пользователя.

### Fallback

Если sprite sheet не удалось загрузить, `Emoji` показывает fallback glyph:
родной символ Unicode этого эмодзи с подписью из `alt`. Передайте `fallback`,
чтобы вместо этого отрендерить собственный узел, или `fallback={null}`, чтобы не
рендерить ничего:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` срабатывает при сбое изображения (с событием) и при сбое manifest (без
него). Fallback glyph зависит от manifest, поэтому, когда сам manifest не
загрузился, рендерится только явно заданный узел `fallback`. Неизвестный id
рендерит узел `fallback` или ничего; `onError` при этом не вызывается, а в
режиме разработки выводится одно предупреждение на каждый id. Запрос manifest
прекращается через 15 секунд и повторяется как любой другой сбой.

### Воспроизведение

Автовоспроизведение ждёт, пока sprite sheet загрузится, эмодзи появится на
экране, а вкладка станет видимой, поэтому эмодзи вне экрана или в фоне не
анимируются. Скрытые вкладки ставят на паузу все эмодзи и возобновляют их, когда
вкладка возвращается. Смена `id` заново запускает первоначальный запуск нового
эмодзи. `animationIterations`, равный `0`, отрицательному числу или `NaN`,
отключает автовоспроизведение; `Infinity` равнозначно `'infinite'`. Пока
автовоспроизведение удерживается, эмодзи показывает poster frame.

Используйте `playing`, чтобы управлять воспроизведением самостоятельно. `true`
проигрывает `animationIterations` запусков, переопределяя `autoPlay` и reduced
motion (по-прежнему ожидая изображение, viewport и видимую вкладку); `false`
ставит на паузу на текущем кадре. Завершённый запуск не перезапускается
переключением, поэтому для повтора перемонтируйте с новым `key`. `onPlaybackEnd`
срабатывает один раз, когда завершается конечный запуск; он никогда не
срабатывает для `'infinite'` или когда эмодзи размонтируется посреди запуска.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

### Изображения и HD sprite sheets

Sprite sheets загружаются с `loading="lazy"` и `decoding="async"`. Эмодзи, у
которых есть HD sprite sheet (кадры 200px), также получают `srcSet` на основе
ширины (`100w` и `200w`) с `sizes`, равным отрисованному размеру (`auto` для
строкового `size`), поэтому на экранах с высокой плотностью браузер выбирает
sheet `@2x`.

### Предзагрузка

`preloadEmojis` начинает загрузку manifest до рендера любого `Emoji` и, если
переданы id, запрашивает их sprite sheets, когда он готов. Он никогда не
отклоняется:

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` выбирает вариант, который нужно прогреть, для эмодзи с оттенками
кожи.

### Asset site

По умолчанию manifest и sprite sheets берутся с
`https://animated-fluent-emojis-cdn.andryore.dev`. Прежний адрес,
`https://animated-fluent-emojis.pages.dev`, продолжает работать. Чтобы отдавать
их из собственной копии, вызовите `configureEmojis` один раз, до первого рендера
`Emoji`:

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` не зависит от React и использует тот же
manifest, что и `Emoji`, поэтому добавить его рядом дёшево. Каждая функция
загружает manifest и, если не может, возвращает `undefined` или пустой массив и
никогда не отклоняется:

```js
import {
  extractEmojis,
  findEmojiByUnicode,
  searchEmojis,
} from 'animated-fluent-emojis/lookup'

await findEmojiByUnicode('👍🏽') // { id: 'yes', skinTone: 'medium' }
await extractEmojis('Hi 👋 there') // [{ id, text, index, length }]
await searchEmojis('party', { limit: 5 }) // [{ id }]
```

- `findEmojiByUnicode(text)` находит один эмодзи и сопоставляет единичный
  модификатор оттенка кожи с `skinTone`; смешанные оттенки приводят к базовому
  эмодзи. Символам вроде `©` или `™` для совпадения нужен селектор вариантов
  эмодзи (U+FE0F), тогда как ZWJ-последовательности совпадают, даже если
  селектор вариантов отсутствует (minimally qualified).
- Когда несколько записей каталога используют один глиф, lookup возвращает
  канонический эмодзи: id с префиксом из кодовых точек глифа, иначе проверенное
  переопределение, иначе первую запись в порядке каталога. Например, `❤️`
  разрешается в сердце, а не в вариант, повторно использующий этот глиф. При
  заданном оттенке кожи используется соседняя запись, у которой есть оттенки.
- `extractEmojis(text)` находит в тексте каждый эмодзи каталога, сохраняя
  ZWJ-последовательности целыми, вместе с его смещением и длиной. Без
  `Intl.Segmenter` он переходит на группировку по кодовым точкам, и ни одна из
  функций никогда не отклоняется.
- `searchEmojis(query, { limit })` сопоставляет описания без учёта регистра;
  `limit` по умолчанию равен 20; `limit`, не являющийся положительным числом,
  означает отсутствие ограничения, кроме `0`, который ничего не возвращает.

### Types

Корень экспортирует `configureEmojis`, `preloadEmojis` и `createEmoji`, а также
типы `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`, `EmojiOptions`
и `EmojiFallback`. Компонент `Emoji` и `EmojiProps` были удалены из корня в
0.7.0; импортируйте их из `/react`. `/react`, `/vue` и `/svelte` экспортируют
каждый свои `Emoji` и `EmojiProps`; у `/astro` есть экспорт по умолчанию и тип
`EmojiAstroProps`; `/element` экспортирует тип `FluentEmojiElement`. `EmojiId` —
это объединение всех опубликованных id, оно генерируется из каталога; prop `id`
типизирован как `EmojiId | (string & {})`, поэтому известные id дополняются
автоматически, а id, добавленные в каталог после вашей установленной версии, всё
равно компилируются.
