---
title: Props
sourceHash: 0cb2d29fb8f7c597
---

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
