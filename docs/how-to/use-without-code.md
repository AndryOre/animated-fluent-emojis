# Use the emojis without code

Put an animated Fluent emoji in Slack, Notion, Google Docs, an email or a GitHub
README. You only need a link or a file. No library, no install.

Every emoji, and every skin tone, is a plain file on the files site:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/<slug>.gif
```

Swap `<slug>` for the name of the emoji. For example, this is the grinning face
with big eyes:

```text
https://animated-fluent-emojis-files.andryore.dev/gif/grinning-face-with-big-eyes.gif
```

Paste a link like that into your browser and the emoji appears. Right-click it
to save the file.

## Find the name (the slug)

The slug is the emoji's description in lowercase, with dashes between words:
`grinning-face-with-big-eyes`, `waving-hand`.

Emojis with skin tones add one of these endings: `-light`, `-medium-light`,
`-medium`, `-medium-dark`, `-dark`. So `waving-hand` is the default yellow hand
and `waving-hand-medium-dark` is the same wave in a medium-dark tone.

If two emojis would share a name, the second gets `-2` (then `-3`). A slug never
changes once it is published, so your links keep working.

To browse every name, open the index:

```text
https://animated-fluent-emojis-files.andryore.dev/index.json
```

## Pick a format

| Format | Path                | Use it for                                       |
| ------ | ------------------- | ------------------------------------------------ |
| GIF    | `/gif/<slug>.gif`   | Anything that animates: Slack, email, READMEs    |
| WebP   | `/webp/<slug>.webp` | Animation with smooth edges, on dark backgrounds |
| PNG    | `/png/<slug>.png`   | A still picture: Google Docs, Slides             |

## Slack

1. Download
   `https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif`.
2. In Slack, open the emoji picker, choose **Add Emoji**, then **Upload Image**.
3. Pick the file, name it (for example `wave`) and save.

Type `:wave:` in any message to use it.

## Notion

Paste the image link into a page and choose **Embed as image**, or type
`/image`, pick **Embed link** and paste the same link.

## Google Docs and Slides

Google Docs and Slides show a still picture, so use the PNG. Choose **Insert**,
**Image**, **By URL** and paste:

```text
https://animated-fluent-emojis-files.andryore.dev/png/waving-hand.png
```

## Email

Insert the GIF as an image, from the file or by its link. Most email apps play
it. A few, such as some desktop versions of Outlook, show only the first frame.

## A GitHub README

Markdown:

```markdown
![Waving hand](https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif)
```

HTML, if you want to set the size:

```html
<img
  src="https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand.gif"
  alt="Waving hand"
  width="48"
/>
```

Keep the `alt` text. It is what a screen reader says.

## Dark backgrounds

A GIF's transparency is all-or-nothing: each pixel is either fully see-through
or fully solid. Soft edges can therefore show a light fringe on a dark
background. There, use the WebP or the PNG, which keep smooth edges.

## Credit

The emoji artwork is Microsoft's, and its use is subject to Microsoft's terms.
This project is not affiliated with or endorsed by Microsoft. Some emojis come
from Microsoft's MIT-licensed repository; the notice that applies to them is at
`/LICENSE-fluentui-emoji-animated.txt`. The attribution is at `/NOTICE.txt`.
Check the terms that apply to the artwork before you use it in your own work.

Building a website or app? The [usage guide](../usage.md) covers the library.
