---
title: Utiliser les emojis sans code
sourceHash: 1a25330011d80c02
---

Mettez un emoji Fluent animé dans Slack, Notion, Google Docs, un e-mail ou un
README GitHub. Il vous suffit d'un lien ou d'un fichier. Pas de bibliothèque,
pas d'installation.

Chaque emoji, et chaque teinte de peau, est un simple fichier sur le site de
fichiers :

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

Remplacez `<slug>` par le nom de l'emoji. Par exemple, voici le visage souriant
aux grands yeux :

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

Collez un lien comme celui-ci dans votre navigateur et l'emoji apparaît. Faites
un clic droit dessus pour enregistrer le fichier.

## Trouver le nom (le slug)

Le slug est la description anglaise de l'emoji en minuscules, avec des tirets
entre les mots : `grinning-face-with-big-eyes`, `waving-hand`.

Les emojis avec teintes de peau ajoutent l'une de ces terminaisons : `-light`,
`-medium-light`, `-medium`, `-medium-dark`, `-dark`. Ainsi `waving-hand` est la
main jaune par défaut et `waving-hand-medium-dark` est le même salut dans une
teinte moyenne-foncée.

Si deux emojis devaient partager un nom, le second reçoit `-2` (puis `-3`). Un
slug ne change jamais une fois publié, vos liens continuent donc de fonctionner.

Pour parcourir tous les noms, ouvrez l'index :

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## Choisir un format

| Format | Chemin              | À utiliser pour                             |
| ------ | ------------------- | ------------------------------------------- |
| GIF    | `/gif/<slug>.gif`   | Tout ce qui s'anime : Slack, e-mail, README |
| WebP   | `/webp/<slug>.webp` | Animation à bords lisses, sur fonds sombres |
| PNG    | `/png/<slug>.png`   | Une image fixe : Google Docs, Slides        |

## Slack

1. Téléchargez
   `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`.
2. Dans Slack, ouvrez le sélecteur d'emojis, choisissez **Add Emoji**, puis
   **Upload Image**.
3. Choisissez le fichier, nommez-le (par exemple `wave`) et enregistrez.

Tapez `:wave:` dans n'importe quel message pour l'utiliser.

## Notion

Collez le lien de l'image dans une page et choisissez **Embed as image**, ou
tapez `/image`, choisissez **Embed link** et collez le même lien.

## Google Docs et Slides

Google Docs et Slides affichent une image fixe, utilisez donc le PNG. Choisissez
**Insert**, **Image**, **By URL** et collez :

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## E-mail

Insérez le GIF comme image, depuis le fichier ou par son lien. La plupart des
applications de messagerie le lisent. Quelques-unes, comme certaines versions de
bureau d'Outlook, n'affichent que la première image.

## Un README GitHub

Markdown :

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

HTML, si vous voulez fixer la taille :

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

Conservez le texte `alt`. C'est ce que dit un lecteur d'écran.

## Fonds sombres

La transparence d'un GIF est du tout ou rien : chaque pixel est soit totalement
transparent, soit totalement opaque. Les bords doux peuvent donc laisser voir
une frange claire sur un fond sombre. Dans ce cas, utilisez le WebP ou le PNG,
qui gardent des bords lisses.

## Crédit

Les illustrations des emojis appartiennent à Microsoft, et leur usage est soumis
aux conditions de Microsoft. Ce projet n'est ni affilié à Microsoft ni approuvé
par elle. Certains emojis proviennent du dépôt de Microsoft sous licence MIT ;
la mention qui leur est applicable se trouve à
`/LICENSE-fluentui-emoji-animated.txt`. L'attribution se trouve à `/NOTICE.txt`.
Vérifiez les conditions qui s'appliquent aux illustrations avant de les utiliser
dans votre propre travail.

Vous construisez un site web ou une application ? Le
[guide d'utilisation](../usage.md) couvre la bibliothèque.
