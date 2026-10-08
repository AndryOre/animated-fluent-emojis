---
title: Vue d'ensemble
sourceHash: 4101ae648cca44fe
---

L'API complète d'`animated-fluent-emojis`, un sujet par page. Pour
l'installation et votre premier emoji, commencez par le [README](../README.md).

Les [props](guide/props.md) sont partagées par tous les adaptateurs ; chaque
section de [framework](guide/frameworks.md) indique comment chaque prop s'y
écrit. Le composant récupère un petit manifest auprès de l'asset site la
première fois qu'un emoji est rendu, jamais au moment de l'import. Pendant le
chargement, `Emoji` rend un espace réservé vide, en `aria-hidden`, à la taille
finale, de sorte que la mise en page ne bouge pas. Si l'id est inconnu, il rend
votre nœud `fallback`, ou rien. Si le manifest ne peut pas être chargé, il rend
votre nœud `fallback`, ou rien, et réessaie au prochain montage, au prochain
appel à `preloadEmojis` ou lorsque le navigateur repasse en ligne.

## Installation

```sh
bun add animated-fluent-emojis
```

## Guide

- [Frameworks](guide/frameworks.md): React, Vue, Svelte, Astro, HTML simple et
  `createEmoji`.
- [Props](guide/props.md): chaque prop, son type et sa valeur par défaut.
- [Comportement](guide/behavior.md): survol et focus, réduction des animations,
  fallback et lecture.
- [Assets](guide/assets.md): images et sprite sheets HD, préchargement et asset
  site.
- [Lookup](guide/lookup.md): trouver des emojis par glyphe, texte ou
  description.
- [Types](guide/types.md): les types exportés.
