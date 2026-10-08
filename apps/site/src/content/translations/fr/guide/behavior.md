---
title: Comportement
sourceHash: 1c585e5ee4f3bb6f
---

<a id="hover-and-focus"></a>

## Survol et focus

Avec `playOnHover`, l'animation est lue après l'exécution initiale lorsque le
pointeur entre dans l'emoji, et aussi lorsque l'emoji se trouve dans un
`<button>` ou un `<a>` qui reçoit le focus clavier (`:focus-visible`).

<a id="reduced-motion"></a>

## Réduction des animations

Lorsque le système de l'utilisateur demande de réduire les animations
(`prefers-reduced-motion: reduce`), `autoPlay` est ignoré et l'emoji reste sur
son poster frame, la première image de l'animation. `playOnHover` continue de
lire au survol et au focus, car il s'agit d'une action explicite de
l'utilisateur.

## Fallback

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

## Lecture

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
