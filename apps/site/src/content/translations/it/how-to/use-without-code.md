---
title: Usare le emoji senza codice
sourceHash: 1a25330011d80c02
---

Metti un'emoji Fluent animata in Slack, Notion, Google Docs, un'email o un
README di GitHub. Ti basta un link o un file. Nessuna libreria, nessuna
installazione.

Ogni emoji, e ogni tonalità della pelle, è un semplice file sul sito dei file:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

Sostituisci `<slug>` con il nome dell'emoji. Per esempio, questa è la faccina
sorridente con occhi grandi:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

Incolla un link come questo nel browser e l'emoji compare. Fai clic con il tasto
destro per salvare il file.

## Trova il nome (lo slug)

Lo slug è la descrizione dell'emoji in minuscolo, con trattini tra le parole:
`grinning-face-with-big-eyes`, `waving-hand`.

Le emoji con tonalità della pelle aggiungono una di queste terminazioni:
`-light`, `-medium-light`, `-medium`, `-medium-dark`, `-dark`. Quindi
`waving-hand` è la mano gialla predefinita e `waving-hand-medium-dark` è lo
stesso saluto in una tonalità medio-scura.

Se due emoji avrebbero lo stesso nome, la seconda riceve `-2` (poi `-3`). Uno
slug non cambia mai una volta pubblicato, quindi i tuoi link continuano a
funzionare.

Per sfogliare tutti i nomi, apri l'indice:

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## Scegli un formato

| Formato | Percorso            | Usalo per                                       |
| ------- | ------------------- | ----------------------------------------------- |
| GIF     | `/gif/<slug>.gif`   | Tutto ciò che si anima: Slack, email, README    |
| WebP    | `/webp/<slug>.webp` | Animazione con bordi morbidi, su sfondi scuri   |
| PNG     | `/png/<slug>.png`   | Un'immagine statica: Google Docs, Presentazioni |

## Slack

1. Scarica
   `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`.
2. In Slack, apri il selettore delle emoji, scegli **Add Emoji**, poi **Upload
   Image**.
3. Scegli il file, dagli un nome (per esempio `wave`) e salva.

Scrivi `:wave:` in qualsiasi messaggio per usarla.

## Notion

Incolla il link dell'immagine in una pagina e scegli **Embed as image**, oppure
scrivi `/image`, scegli **Embed link** e incolla lo stesso link.

## Google Docs e Presentazioni

Google Docs e Presentazioni mostrano un'immagine statica, quindi usa il PNG.
Scegli **Inserisci**, **Immagine**, **Da URL** e incolla:

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## Email

Inserisci la GIF come immagine, dal file o tramite il suo link. La maggior parte
delle app di posta la riproduce. Alcune, come certe versioni desktop di Outlook,
mostrano solo il primo fotogramma.

## Un README di GitHub

Markdown:

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

HTML, se vuoi impostare la dimensione:

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

Mantieni il testo `alt`. È ciò che legge uno screen reader.

## Sfondi scuri

La trasparenza di una GIF è tutto o niente: ogni pixel è completamente
trasparente o completamente pieno. I bordi morbidi possono quindi mostrare un
alone chiaro su uno sfondo scuro. In quel caso usa il WebP o il PNG, che
mantengono i bordi morbidi.

## Crediti

L'artwork delle emoji è di Microsoft e il suo uso è soggetto ai termini di
Microsoft. Questo progetto non è affiliato né approvato da Microsoft. Alcune
emoji provengono dal repository di Microsoft con licenza MIT; l'avviso che si
applica a esse si trova in `/LICENSE-fluentui-emoji-animated.txt`.
L'attribuzione è in `/NOTICE.txt`. Verifica i termini che si applicano
all'artwork prima di usarlo nei tuoi lavori.

Stai creando un sito web o un'app? La [guida all'uso](../usage.md) spiega la
libreria.
