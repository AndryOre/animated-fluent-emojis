---
title: Guide d'utilisation
sourceHash: 1c5618d6e3a40904
---

L'API complète d'`animated-fluent-emojis`. Pour l'installation et votre premier
emoji, commencez par le [README](../README.md).

- [Frameworks](#frameworks)
  - [React](#react)
  - [Vue](#vue)
  - [Svelte](#svelte)
  - [Astro](#astro)
  - [HTML simple](#plain-html)
  - [Angular, Solid et Preact](#angular-solid-and-preact)
  - [Sans framework](#without-a-framework)
- [Props](#props)
- [Survol et focus](#hover-and-focus)
- [Réduction des animations](#reduced-motion)
- [Fallback](#fallback)
- [Lecture](#playback)
- [Images et sprite sheets HD](#images-and-hd-sprite-sheets)
- [Préchargement](#preloading)
- [Asset site](#asset-site)
- [Lookup](#lookup)
- [Types](#types)

Les props ci-dessous sont partagées par tous les adaptateurs ; chaque section de
framework indique comment chaque prop s'y écrit. Le composant récupère un petit
manifest auprès de l'asset site la première fois qu'un emoji est rendu, jamais
au moment de l'import. Pendant le chargement, `Emoji` rend un espace réservé
vide, en `aria-hidden`, à la taille finale, de sorte que la mise en page ne
bouge pas. Si l'id est inconnu, il rend votre nœud `fallback`, ou rien. Si le
manifest ne peut pas être chargé, il rend votre nœud `fallback`, ou rien, et
réessaie au prochain montage, au prochain appel à `preloadEmojis` ou lorsque le
navigateur repasse en ligne.

## Frameworks

Un seul paquet, un chemin d'import par framework. `configureEmojis` et
`preloadEmojis` ne dépendent d'aucun framework et restent dans
`animated-fluent-emojis` ; voir [Préchargement](#preloading) et
[Asset site](#asset-site). Tous les adaptateurs partagent le même noyau de
lecture et passent la même suite de conformité, si bien que les props se
comportent partout de la même façon. Voir l'
[ADR 0014](adr/0014-multi-framework-support.md).

Les adaptateurs React, Vue et Svelte ainsi que `createEmoji` lisent leurs
keyframes dans `animated-fluent-emojis/style.css` ; importez-le une seule fois.
`<fluent-emoji>` et le composant Astro embarquent leurs propres styles.

### React

Importez `Emoji` depuis le sous-chemin React :

```jsx
import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'
```

Si vous migrez depuis la 0.6 ou une version antérieure : l'export `Emoji` de la
racine a été déprécié dans la 0.6 et supprimé dans la 0.7. Changez le chemin
d'import, rien d'autre ; les props et le comportement sont identiques. Le type
`EmojiProps` a lui aussi été déplacé vers `animated-fluent-emojis/react`.
`configureEmojis` et `preloadEmojis` restent dans `animated-fluent-emojis`.
React 18 et 19 sont pris en charge, et `react` et `react-dom` sont des peers
optionnels.

### Vue

Vue 3.3 ou version ultérieure. `Emoji` reçoit les props ci-dessous en camelCase.
Le slot `fallback` remplace l'image, et les événements sont `load`, `error` et
`playbackEnd`. Les autres attributs comme `class`, `style` et `data-*` sont
transmis au span racine.

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

Côté serveur, et pendant l'hydratation, il rend un espace réservé vide à la
taille finale, ce qui fonctionne donc avec Nuxt.

### Svelte

Svelte 5. `Emoji` reçoit les props ci-dessous ; `fallback` est un snippet, et
`class`, `style` et `attributes` sont transmis au span racine. Les callbacks
sont `onLoad`, `onError` et `onPlaybackEnd`.

```svelte
<script lang="ts">
  import { Emoji } from 'animated-fluent-emojis/svelte'

  import 'animated-fluent-emojis/style.css'
</script>

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  {#snippet fallback()}<span>👋</span>{/snippet}
</Emoji>
```

Il rend un espace réservé côté serveur et l'emoji après l'hydratation, ce qui
fonctionne donc avec SvelteKit. L'export du paquet comporte une condition
`svelte` qui pointe vers le code source du composant.

### Astro

Astro 5 ou version ultérieure. Le composant rend le balisage de l'emoji au
moment de la compilation : le sprite est donc déjà dans le HTML avant
l'exécution de tout script, et un petit script démarre la lecture dans le
navigateur. Il embarque ses propres styles ; aucune feuille de style à importer.
Le slot nommé `fallback` est rendu lorsque l'id est inconnu ou que l'image
échoue.

```astro
---
import Emoji from 'animated-fluent-emojis/astro'
---

<Emoji id="1f44b_wavinghand" size={64} playOnHover>
  <span slot="fallback">👋</span>
</Emoji>
```

Les props sont celles ci-dessous, sans les callbacks, avec `class` et un `style`
de type chaîne. Le span racine émet `emoji-load`, `emoji-error` et
`playback-end` sous forme d'événements DOM avec propagation (bubbling), à la
place des callbacks. Le script du navigateur s'exécute aussi de nouveau sur
`astro:page-load`, de sorte que les transitions de vue continuent de
fonctionner.

<a id="plain-html"></a>

### HTML simple

Importer `animated-fluent-emojis/element` enregistre `<fluent-emoji>`. Aucune
feuille de style n'est nécessaire : les keyframes vivent dans son shadow root.

```html
<script type="module">
  import 'animated-fluent-emojis/element'
</script>

<fluent-emoji id="1f44b_wavinghand" size="64" play-on-hover>
  <span slot="fallback">👋</span>
</fluent-emoji>
```

Les attributs reflètent les props en kebab-case : `id`, `size`, `play-on-hover`,
`animation-iterations`, `auto-play`, `playing`, `skin-tone` et `alt`. Un
attribut booléen est actif sauf si sa valeur est `false`. Les mêmes noms
existent comme propriétés camelCase de l'élément (`element.playOnHover = true`)
; affecter une propriété ne réécrit pas l'attribut. Un élément avec
`slot="fallback"` est le fallback. L'élément émet `emoji-load`, `emoji-error` et
`playback-end` sous forme d'événements avec propagation et `composed`.

Tant que l'élément n'est pas défini, il n'a pas de taille. Ajoutez
`FLUENT_EMOJI_PRE_UPGRADE_CSS`, exporté depuis la même entrée, au CSS de votre
page pour réserver l'espace à partir de l'attribut `size` (en pixels) et éviter
un décalage de la mise en page.

<a id="angular-solid-and-preact"></a>

### Angular, Solid et Preact

Ils utilisent `<fluent-emoji>` via leur propre syntaxe de templates ; voir les
guides pratiques pour [Angular](how-to/use-with-angular.md),
[Solid](how-to/use-with-solid.md) et [Preact](how-to/use-with-preact.md). Il en
va de même pour Lit, Alpine et htmx : importez `animated-fluent-emojis/element`
et écrivez la balise.

<a id="without-a-framework"></a>

### Sans framework

`createEmoji` effectue le rendu dans n'importe quel nœud du DOM et renvoie un
contrôleur. C'est le noyau sans framework de chaque adaptateur. L'importer ne
touche pas au DOM.

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

Ses options sont les props ci-dessous, avec `className`, `style` et `attributes`
pour le span racine, les callbacks `onLoad`, `onError` et `onPlaybackEnd`, et un
`fallback` qui est un nœud, une fonction qui renvoie un nœud, ou `null`.

## Props

| Prop                | Type                   | Default     | Description                                                                                       |
| ------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| id                  | `EmojiId` or string    | -           | L'identifiant unique de l'emoji ; les ids connus sont autocomplétés                               |
| size                | number or string       | 100         | Des pixels, ou n'importe quelle longueur CSS comme `2rem` ou `var(--size)`                        |
| playOnHover         | boolean                | false       | Indique si l'animation est lue au survol du pointeur et au focus clavier                          |
| animationIterations | number or 'infinite'   | 2           | Le nombre de fois où l'animation est lue au chargement                                            |
| autoPlay            | boolean                | true        | Indique si l'animation est lue automatiquement au montage                                         |
| playing             | boolean                | -           | Contrôle la lecture ; `true` lit, `false` met en pause, omise conserve le comportement par défaut |
| onPlaybackEnd       | function               | -           | Appelé une fois lorsqu'une exécution finie de `animationIterations` se termine                    |
| skinTone            | SkinTone               | 'default'   | Teinte de peau pour les emojis qui ont des variantes (voir ci-dessous)                            |
| alt                 | string                 | description | Texte accessible ; par défaut la description de l'emoji, `""` le marque comme décoratif           |
| className           | string                 | -           | Nom de classe du `<span>` racine, combiné à celui du composant                                    |
| style               | CSSProperties          | -           | Style en ligne du `<span>` racine ; `width` et `height` suivent `size`                            |
| ref                 | `Ref<HTMLSpanElement>` | -           | Transmise au `<span>` racine ; fonctionne avec React 18 et 19                                     |
| fallback            | ReactNode              | glyph       | Rendu lorsque l'image ou le manifest échoue, ou que l'id est inconnu ; `null` : rien              |
| onLoad              | function               | -           | Appelé lorsque le sprite sheet est chargé                                                         |
| onError             | function               | -           | Appelé lorsque l'image échoue, et sans événement lorsque le manifest échoue                       |

Tout autre attribut de `<span>` (`data-*`, `aria-*`, `title`, gestionnaires
d'événements) est transmis à la racine. Un `size` numérique est arrondi ; toute
valeur qui n'est pas un nombre fini et positif revient à 100. Un `size` de type
chaîne est transmis tel quel à CSS, si bien que `size="2rem"` ou
`size="var(--emoji-size)"` fonctionnent. Une chaîne numérique comme `"48"` est
traitée comme le nombre 48, et l'image reçoit `sizes="auto"` pour les autres
chaînes ; un `style` avec `width` ou `height` l'emporte sur `size`.

`skinTone` vaut `'default'`, `'light'`, `'medium-light'`, `'medium'`,
`'medium-dark'` ou `'dark'`. Il ne s'applique qu'aux emojis marqués `diverse` ;
pour tout autre emoji, ou une valeur inconnue, le sheet par défaut est utilisé.
`DiverseEmojiId` liste les ids qui ont des teintes de peau, et `skinTone` est
typé par rapport à lui lorsque `id` en fait partie.

<a id="hover-and-focus"></a>

### Survol et focus

Avec `playOnHover`, l'animation est lue après l'exécution initiale lorsque le
pointeur entre dans l'emoji, et aussi lorsque l'emoji se trouve dans un
`<button>` ou un `<a>` qui reçoit le focus clavier (`:focus-visible`).

<a id="reduced-motion"></a>

### Réduction des animations

Lorsque le système de l'utilisateur demande de réduire les animations
(`prefers-reduced-motion: reduce`), `autoPlay` est ignoré et l'emoji reste sur
son poster frame, la première image de l'animation. `playOnHover` continue de
lire au survol et au focus, car il s'agit d'une action explicite de
l'utilisateur.

### Fallback

Si le sprite sheet ne se charge pas, `Emoji` affiche le fallback glyph : le
caractère Unicode natif de l'emoji, étiqueté avec `alt`. Passez `fallback` pour
rendre à la place votre propre nœud, ou `fallback={null}` pour ne rien rendre :

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` s'exécute lorsque l'image échoue (avec l'événement) et lorsque le
manifest échoue (sans lui). Le fallback glyph a besoin du manifest ; quand le
manifest lui-même a échoué, seul un nœud `fallback` explicite est donc rendu. Un
id inconnu rend le nœud `fallback`, ou rien ; il n'appelle pas `onError` et, en
développement, avertit une fois par id. La requête du manifest abandonne au bout
de 15 secondes et est réessayée comme tout autre échec.

<a id="playback"></a>

### Lecture

L'autoplay attend que le sprite sheet soit chargé, que l'emoji soit à l'écran et
que l'onglet soit visible ; les emojis hors écran ou en arrière-plan ne
s'animent donc pas. Les onglets masqués mettent tous les emojis en pause et les
reprennent au retour de l'onglet. Changer `id` relance l'exécution initiale du
nouvel emoji. Un `animationIterations` de `0`, un nombre négatif ou `NaN`
désactive l'autoplay ; `Infinity` équivaut à `'infinite'`. Tant que l'autoplay
est retenu, l'emoji affiche son poster frame.

Utilisez `playing` pour contrôler vous-même la lecture. `true` lit
`animationIterations` exécutions, en outrepassant `autoPlay` et la réduction des
animations (en attendant toujours l'image, le viewport et un onglet visible) ;
`false` met en pause sur l'image courante. Une exécution terminée ne redémarre
pas lorsqu'on bascule, il faut donc remonter le composant avec une nouvelle
`key` pour la rejouer. `onPlaybackEnd` s'exécute une fois lorsqu'une exécution
finie se termine ; il ne s'exécute jamais avec `'infinite'` ni lorsque l'emoji
est démonté en cours d'exécution.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```

<a id="images-and-hd-sprite-sheets"></a>

### Images et sprite sheets HD

Les sprite sheets sont chargés avec `loading="lazy"` et `decoding="async"`. Les
emojis qui disposent d'un sprite sheet HD (images de 200px) reçoivent en outre
un `srcSet` basé sur la largeur (`100w` et `200w`) avec `sizes` égal à la taille
rendue (`auto` pour un `size` de type chaîne), de sorte que le navigateur
choisit le sheet `@2x` sur les écrans haute densité.

<a id="preloading"></a>

### Préchargement

`preloadEmojis` commence à récupérer le manifest avant qu'aucun `Emoji` ne soit
rendu et, lorsqu'on lui donne des ids, demande leurs sprite sheets une fois
qu'il est prêt. Il ne rejette jamais :

```js
import { preloadEmojis } from 'animated-fluent-emojis'

void preloadEmojis()
void preloadEmojis(['1f44b_wavinghand', '1f525_fire'], { skinTone: 'medium' })
```

`skinTone` choisit la variante préchauffée pour les emojis qui ont des teintes
de peau.

### Asset site

Par défaut, le manifest et les sprite sheets proviennent de
`https://animated-fluent-emojis-cdn.andryore.dev`. L'ancienne adresse,
`https://animated-fluent-emojis.pages.dev`, continue de fonctionner. Pour les
servir depuis votre propre copie, appelez `configureEmojis` une fois, avant le
rendu du premier `Emoji` :

```js
import { configureEmojis } from 'animated-fluent-emojis'

configureEmojis({ assetSiteUrl: 'https://emojis.example.com' })
```

### Lookup

`animated-fluent-emojis/lookup` ne dépend pas de React et partage le manifest
avec `Emoji` ; l'ajouter à côté de lui coûte donc très peu. Chaque fonction
charge le manifest et, lorsqu'elle n'y parvient pas, se résout en `undefined` ou
en tableau vide, sans jamais rejeter :

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

- `findEmojiByUnicode(text)` résout un emoji et affecte un unique modificateur
  de teinte de peau à `skinTone` ; les teintes mélangées se résolvent en l'emoji
  de base. Les symboles comme `©` ou `™` ont besoin du sélecteur de variation
  d'emoji (U+FE0F) pour correspondre, tandis que les séquences ZWJ correspondent
  même lorsque le sélecteur de variation est absent (minimally qualified).
- Lorsque plusieurs entrées du catalog partagent un glyphe, lookup renvoie
  l'emoji canonique : l'id préfixé par les code points du glyphe ; sinon, une
  surcharge révisée ; sinon, la première entrée dans l'ordre du catalog. Par
  exemple, `❤️` se résout en cœur et non en une variante qui réutilise le
  glyphe. Avec une teinte de peau, il se rabat sur une entrée sœur qui a des
  teintes.
- `extractEmojis(text)` trouve tous les emojis du catalog dans un texte, en
  gardant les séquences ZWJ entières, avec leur décalage et leur longueur. Sans
  `Intl.Segmenter`, il se rabat sur un regroupeur de code points, et aucune des
  deux fonctions ne rejette jamais.
- `searchEmojis(query, { limit })` cherche dans les descriptions, sans tenir
  compte de la casse ; `limit` vaut 20 par défaut ; un `limit` qui n'est pas un
  nombre positif signifie sans limite, sauf `0`, qui ne renvoie rien.

<a id="types"></a>

### Types

La racine exporte `configureEmojis`, `preloadEmojis` et `createEmoji`, ainsi que
les types `SkinTone`, `EmojiId`, `DiverseEmojiId`, `EmojiController`,
`EmojiOptions` et `EmojiFallback`. Le composant `Emoji` et `EmojiProps` ont été
supprimés de la racine dans la 0.7.0 ; importez-les depuis `/react`. `/react`,
`/vue` et `/svelte` exportent chacun leurs propres `Emoji` et `EmojiProps` ;
`/astro` a un export par défaut et le type `EmojiAstroProps` ; `/element`
exporte le type `FluentEmojiElement`. `EmojiId` est l'union de tous les ids
publiés et est généré à partir du catalog ; la prop `id` est typée
`EmojiId | (string & {})`, si bien que les ids connus sont autocomplétés et que
les ids ajoutés au catalog après votre version installée continuent de compiler.
