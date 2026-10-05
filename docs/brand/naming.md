# Naming — Animated Fluent Emojis

Draft v1 (2026-10-05). Status: awaiting a decision. The brief
([`brief.md`](brief.md)) asks for a playful name that is not boxed into
Microsoft's "Fluent" name and that fits the frame-strip metaphor.

## Method

Candidates came from the brief's metaphor (a strip of frames: flipbook, reel,
zoetrope) and its playful register (wiggle, flip), combined with the `-moji`
suffix where a plain word was taken. Each one was filtered by:

- npm package name availability (`npm view <name>`)
- GitHub repo slug under `AndryOre` (`gh api repos/AndryOre/<slug>`)
- Domain availability on Porkbun, `.dev` and `.app`. Informational only: no
  domain is bought at this stage.
- A web search for existing products, apps or brands with the same name

The current name, **Animated Fluent Emojis**, competes as one candidate.

## Candidates checked

| Name           | npm       | GitHub slug | Domain (.dev / .app) | Collision                                                                                                 |
| -------------- | --------- | ----------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| **Framemoji**  | free      | free        | free / free          | none found                                                                                                |
| **Flipmoji**   | free      | free        | free / free          | no product found; "Emoji Flipper" (a mirror-your-emoji tool) and many "flip emoji" pages crowd the search |
| **Wigglemoji** | free      | free        | free / free          | none found                                                                                                |
| Reelmoji       | free      | free        | free / free          | none found, but "reel" reads as video (Instagram Reels) more than animation                               |
| Kinemoji       | free      | free        | free / free          | none found, but hard to say and spell                                                                     |
| Livemoji       | free      | free        | free / free          | **ruled out**: existing apps called Livemoji (an Animoji camera app, a Devpost project)                   |
| flipbook       | **taken** | free        | taken / taken        | **ruled out**: npm package "Scroll-based inline flipbook animation", both domains taken                   |
| zoetrope       | **taken** | free        | not checked          | **ruled out**: npm package "A lightweight animation helper"; also long to type                            |
| animoji        | **taken** | free        | not checked          | **ruled out**: Apple's Animoji trademark                                                                  |

Domain prices on Porkbun: `.dev` 8.75 USD the first year then 12.87; `.app` 8.75
then 14.93. The current name is also available as `animated-fluent-emojis.dev`
and `animatedfluentemojis.dev/.app`.

## The "Fluent" question

The current name uses "Fluent", Microsoft's name for its emoji set and its
design system.

- The emoji set is MIT licensed, so using the artwork is fine.
- Microsoft's trademark guidelines allow a wordmark to be used to truthfully
  describe a product, as long as people are not led to think Microsoft is
  affiliated with or endorses it. Logos and app icons need a license.
- So the name is not forbidden. "Fluent" in a name does lean on Microsoft's
  brand, but in practice it is widespread: `@lobehub/fluent-emoji` (1.55M
  downloads a month), `react-fluentui-emoji` and Microsoft's own
  `fluentui-emoji` repo all use it. The legal risk is low, and a plain "not
  affiliated with Microsoft" line covers it. Dropping "Fluent" is a branding
  preference (headroom, playfulness), not a legal need.

Sources:

- [Microsoft Trademark and Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks)
- [microsoft/fluentui-emoji](https://github.com/microsoft/fluentui-emoji) (MIT)

The "-moji" suffix has one strong neighbour, Bitmoji (Snap). It is a generic
suffix and a different product, so it is a note and not a blocker.

## Head-to-head

Scored 0 to 10 on seven axes. This is directional judgment, not a formula.
Higher is better on every axis.

| Axis                                                  | Animated Fluent Emojis                           | Framemoji                      | Flipmoji                                                   | Wigglemoji                    |
| ----------------------------------------------------- | ------------------------------------------------ | ------------------------------ | ---------------------------------------------------------- | ----------------------------- |
| Sound and catchiness                                  | 3: long and literal                              | 7: clear, a little mechanical  | 9: bouncy, easy to say                                     | 8: fun, three syllables       |
| npm and GitHub collision                              | 10: ours                                         | 10: free                       | 10: free                                                   | 10: free                      |
| Brand and category collision                          | 6: near-identical to the 1,102-star Tarikul repo | 9: none found                  | 8: "Emoji Flipper" and "flip emoji" pages crowd the search | 9: none found                 |
| Fit with the brief (frame strip, playful)             | 5: literal, no personality                       | 9: the metaphor is in the name | 7: flipbook echo, but "flip" also suggests mirroring       | 5: movement, not frames       |
| Headroom (landing, README files, other emoji sets)    | 3: boxed to Fluent                               | 8: any animated emoji          | 8: any animated emoji                                      | 6: suggests only wiggling     |
| Warmth and mascot potential                           | 3                                                | 6                              | 9                                                          | 10                            |
| Overpromise and legal risk (lower risk scores higher) | 7: leans on "Fluent", but widely used            | 10: promises nothing specific  | 7: implies flipping                                        | 6: implies everything wiggles |
| **Total /70**                                         | **37**                                           | **59**                         | **58**                                                     | **54**                        |

Reading it straight:

- The current name loses on sound, headroom and personality, and wins on being
  the phrase people already type. The score is revised from 35 to 37 after
  checking how much the "Fluent" risk really matters (see above).
- **Framemoji** and **Flipmoji** are a one-point tie. Framemoji says what the
  library does (frames) and carries the brief's metaphor. Flipmoji is the more
  playful word but is ambiguous, and its search space is noisy.
- Wigglemoji is the warmest and the least precise. It would fix the product to
  one motion.

## Two decisions, not one

The name and what happens to the package are separate.

**1. The brand name.** Recommendation: **Framemoji**. Alternate: **Flipmoji**.

**2. What happens to the npm package and the repo.**

| Option                                                   | What changes                                                                                                                                          | Cost                                                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| A. Keep everything                                       | Nothing                                                                                                                                               | None, but the brand is not applied                                                                         |
| B. Brand name, keep the package `animated-fluent-emojis` | README, landing and social say Framemoji. The package, repo and URLs keep the literal name.                                                           | Two names to explain. The package still carries "Fluent".                                                  |
| C. Full rename                                           | New package `framemoji`, the old one gets `npm deprecate` pointing to it, the repo is renamed (GitHub redirects the old URL), the Pages project moves | A migration for about 280 downloads a month. Search discoverability moves to keywords and the description. |

### Search check (2026-10-05)

Does keeping the literal name solve search? Partly.

- **npm search:** `animated-fluent-emojis` is first for the exact phrase
  "animated fluent emojis" (plural). It is **not in the top 20** for "animated
  fluent emoji" (singular), "fluent emoji react", "animated emoji react",
  "microsoft animated emoji" or "teams emoji react". Those queries are matched
  on keywords and description, which do not depend on the name.
- **Web search:** the literal phrase does not give us the result. A copy of our
  description, `ashymee/animated-fluent-emojis` (created 2025-04, not a fork, 0
  stars), came first, and Tarikul's 1,102-star repository shares the phrase. Our
  own repository only showed up in the second query, through a pull request.
- **What a rename would lose:** the exact-phrase rank on npm and the recognition
  of existing users, mitigated by `npm deprecate` and by keeping "animated
  Fluent emoji" in the description and keywords.
- **What the literal name does not buy:** ownership of the phrase. Others
  already use it.

### Recommendation

**One name everywhere.** Option B above, with the package literal and the
landing page and README branded Framemoji, splits the identity: someone reads
"Framemoji" on the landing page and then has to install
`animated-fluent-emojis`. That is the worst of both worlds, so it is dropped.
The real choice is between two coherent paths:

| Path                              | Name everywhere (npm, repo, README, landing, social)                                    | What it costs                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Literal name** (recommended) | Animated Fluent Emojis. The brand is applied as identity: mark, voice, palette, motion. | A long wordmark and a low sound score, so the mark leads and the voice carries the playfulness. "Fluent" stays in the name, with a non-affiliation line.         |
| **2. Framemoji everywhere**       | Framemoji. This is option C: new package, deprecate the old one, rename the repo.       | The exact-phrase search position and the recognition of current users start from zero. The landing page has to carry the phrase "animated Fluent emojis" itself. |

Why path 1 now:

- **Every competitor in this niche is literal.** `@lobehub/fluent-emoji`,
  `react-fluentui-emoji`, Tarikul's `animated-fluent-emoji.vercel.app`,
  LobeHub's `fluent-emoji.lobehub.com`. People look for this by what it is.
- **The project has no audience yet** (0 stars, 280 downloads a month), so
  search, not word of mouth, is the main way people will find it. A new name has
  to be taught first; the literal name is understood on sight.
- **The rubric left discoverability out** (it follows Snug's seven axes, and
  Snug is a store listing with different search dynamics). Counting it would
  help the literal name. Framemoji would still score higher as a pure name, but
  not by enough to outweigh starting from zero.
- **The brand does not depend on the name.** The frame-strip mark, the playful
  voice, the palette and the motion all carry over to either path. If the
  project outgrows the Fluent set later, path 2 is still open, and Framemoji
  stays free on npm, GitHub and `.dev`/`.app` for now (that can change, and
  reserving it needs an explicit OK).

Path 2 is right if the plan is to leave the Fluent set soon or if a distinctive
name matters more than being found by description.

Tagline, either path: **animated Fluent emojis**, with no framework in it. The
README and the landing page say which frameworks are supported; the name does
not.

Nothing is renamed, published or bought until an explicit OK.

## Decision: keep Animated Fluent Emojis

Chosen 2026-10-05 (path 1). One name everywhere: npm, repo, README, landing page
and social. The brand is applied as identity (mark, voice, palette, motion), not
as a new name.

- **Name:** Animated Fluent Emojis. The package stays `animated-fluent-emojis`.
- **Tagline basis:** "animated Fluent emojis", with no framework in it.
- **Carried forward:** the wordmark is long, so the logo leads with the mark.
  The non-affiliation line sits next to "Fluent" wherever people decide to use
  the library.
- **Kept open:** Framemoji (path 2) if the project outgrows the Fluent set.
  Nothing is reserved, renamed, published or bought.
