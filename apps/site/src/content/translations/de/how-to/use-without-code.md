---
title: Die Emojis ohne Code verwenden
sourceHash: 040399c5bc04b224
---

Bring ein animiertes Fluent-Emoji in Slack, Notion, Google Docs, eine E-Mail
oder eine GitHub-README. Du brauchst nur einen Link oder eine Datei. Keine
Bibliothek, keine Installation.

Jedes Emoji, und jede Hautfarbe, ist eine einfache Datei auf der Files-Site:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

Ersetze `<slug>` durch den Namen des Emojis. Das hier ist zum Beispiel das
grinsende Gesicht mit großen Augen:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

Füge so einen Link in deinen Browser ein, und das Emoji erscheint. Mit
Rechtsklick kannst du die Datei speichern.

## Den Namen finden (den Slug)

Der Slug ist die Beschreibung des Emojis in Kleinbuchstaben, mit Bindestrichen
zwischen den Wörtern: `grinning-face-with-big-eyes`, `waving-hand`.

Emojis mit Hautfarben bekommen eine dieser Endungen: `-light`, `-medium-light`,
`-medium`, `-medium-dark`, `-dark`. So ist `waving-hand` die gelbe Standardhand
und `waving-hand-medium-dark` dieselbe Winkbewegung in einem mitteldunklen Ton.

Würden sich zwei Emojis einen Namen teilen, bekommt das zweite `-2` (dann `-3`).
Ein Slug ändert sich nie mehr, sobald er veröffentlicht ist, deine Links
funktionieren also weiter.

Um alle Namen zu durchsuchen, öffne den Index:

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## Ein Format wählen

| Format | Pfad                | Verwende es für                                         |
| ------ | ------------------- | ------------------------------------------------------- |
| GIF    | `/gif/<slug>.gif`   | Alles, was animiert: Slack, E-Mail, READMEs             |
| WebP   | `/webp/<slug>.webp` | Animation mit weichen Kanten, auf dunklen Hintergründen |
| PNG    | `/png/<slug>.png`   | Ein Standbild: Google Docs, Slides                      |

## Slack

1. Lade `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`
   herunter.
2. Öffne in Slack den Emoji-Picker, wähle **Add Emoji** und dann **Upload
   Image**.
3. Wähle die Datei, gib ihr einen Namen (zum Beispiel `wave`) und speichere.

Tippe `:wave:` in eine beliebige Nachricht, um es zu verwenden.

## Notion

Füge den Bildlink in eine Seite ein und wähle **Embed as image**, oder tippe
`/image`, wähle **Embed link** und füge denselben Link ein.

## Google Docs und Slides

Google Docs und Slides zeigen ein Standbild, verwende also das PNG. Wähle
**Insert**, **Image**, **By URL** und füge ein:

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## E-Mail

Füge das GIF als Bild ein, aus der Datei oder über seinen Link. Die meisten
E-Mail-Apps spielen es ab. Einige, etwa manche Desktop-Versionen von Outlook,
zeigen nur das erste Frame.

## Eine GitHub-README

Markdown:

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

HTML, wenn du die Größe festlegen willst:

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

Behalte den `alt`-Text. Er wird von Screenreadern vorgelesen.

## Dunkle Hintergründe

Die Transparenz eines GIFs ist alles oder nichts: Jeder Pixel ist entweder
völlig durchsichtig oder völlig deckend. Weiche Kanten können daher auf einem
dunklen Hintergrund einen hellen Rand zeigen. Verwende dort das WebP oder das
PNG, die weiche Kanten behalten.

## Credits

Die Emoji-Artwork gehört Microsoft, und ihre Nutzung unterliegt den Bedingungen
von Microsoft. Dieses Projekt steht in keiner Verbindung zu Microsoft und wird
von Microsoft nicht unterstützt. Einige Emojis stammen aus dem MIT-lizenzierten
Repository von Microsoft; der für sie geltende Hinweis steht unter
`/LICENSE-fluentui-emoji-animated.txt`. Die Namensnennung steht unter
`/NOTICE.txt`. Prüfe die für die Artwork geltenden Bedingungen, bevor du sie in
deiner eigenen Arbeit verwendest.

Baust du eine Website oder App? Der [Nutzungsleitfaden](../usage.md) behandelt
die Bibliothek.
