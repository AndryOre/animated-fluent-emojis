# Animated Fluent Emojis Brand Voice Guidelines

## Generation Metadata

- Created: 2026-10-05
- Version: 1
- Sources: `brief.md`, `naming.md`, `competitors.md` (this folder), plus the
  copy the project already ships: `README.md`, `CHANGELOG.md`, `ROADMAP.md` and
  the `CONTEXT.md` glossary
- Documents processed: 7
- Conversations analyzed: 0 (no issues, reviews or customer calls written in or
  about this voice yet)
- Discovery report used: No
- Overall confidence: **Medium** (0.62, see Confidence Scores). The terminology
  rests on an explicit glossary. The playful side of the voice is a new
  direction with no shipped copy to test it against, so it comes from the
  brief's decisions and not from evidence.
- Brand language: English only (closed decision in `brief.md`).

---

## Executive Summary

Animated Fluent Emojis talks to two readers. The developer wants an interface
that feels alive and does not want to pay for it in weight, layout shifts or
accessibility. The non-technical visitor (on the landing page and in social
posts) comes for the emoji, not for the code. The voice is the same for both:
**playful on the surface and precise underneath**: short, warm sentences and the
occasional small joke, backed by exact statements about what the emoji do, what
they cost and what belongs to Microsoft.

What changes between the two readers is the vocabulary, not the personality.
README, docs and npm use the technical terms of the glossary. The landing page
and social posts use everyday words and keep the technical terms out of sight
(see "Two vocabularies" in the Terminology Guide).

The emoji are the protagonist. The copy is the stage, so it stays short, makes
room for the animation, and never competes with it. Humor is a seasoning: one
light line per surface at most, and none in API docs, errors or the changelog (a
proposed limit, see open question 3).

What makes this voice different from the rest of the niche (see
`competitors.md`): the competitors are either a plain README or someone else's
brand. None has a voice. The project's own docs are already precise and candid
(the changelog flags every behavior change, the roadmap says being listed "would
never be a promise that they ship"), so the work is to add warmth on top of that
care, not to replace it.

---

## We Are / We Are Not

| We Are                                                                                                | We Are Not                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Playful** — warm, short, a little funny, and happy to let the emoji do the talking                  | **Goofy or meme-y** — no confetti-everywhere, no "supercharge", no decorative exclamation marks            |
| **Precise** — we say exactly what happens: lazy manifest, poster frame, fallback glyph                | **Vague** — no "lightweight", "optimized" or "seamless" without the fact behind it                         |
| **Honest about scope and license** — we say what ships today, and whose artwork it is                 | **Overclaiming** — no "exclusive", no "official", no feature that is only planned                          |
| **Plain-spoken** — an equal to the reader: code for developers, everyday words for everyone else      | **Salesy, condescending or jargon-heavy** — no pitch voice, no "just", no terms the reader never asked for |
| **Light-handed** — the copy gives the emoji room, and one emoji beats five                            | **Noisy** — no emoji on every heading, no walls of text, no decorative clutter around the real emoji       |
| **Considerate** — reduced motion, alt text and fallbacks are defaults, and we talk about them as care | **Compliance-flavored** — no "a11y support" checklist tone, no treating accessibility as a feature tag     |

### Voice Attributes Detail

#### Playful

- **What it means**: warmth and a light sense of humor, in the words and in the
  motion.
- **How it shows up**: short sentences; verbs that move ("waves", "bounces",
  "rests"); a joke that comes from the emoji itself, not from the copywriter.
- **What to avoid**: jokes at the reader's expense, memes, hype, and any humor
  in a context where the reader is debugging.
- **Evidence**: `brief.md` (emotional promise "Make your interface smile",
  playfulness section, the instruction to avoid generic "fun" clichés); Andry's
  request for a more playful brand (2026-10-05). No shipped copy yet.
- **Confidence**: Medium

#### Precise

- **What it means**: every claim has a mechanism behind it.
- **How it shows up**: "the manifest loads lazily, never at import time" instead
  of "lightweight"; "an empty `aria-hidden` placeholder of the final size holds
  the layout" instead of "no layout shift".
- **What to avoid**: adjectives with no fact: "fast", "tiny", "powerful".
- **Evidence**: `README.md` (Playback, Fallback, Images and HD sprite sheets);
  `CONTEXT.md`; `CHANGELOG.md` ("**Behavior change**" labels). Counter-evidence:
  the README's feature bullets ("Lightweight: Optimized for performance") are
  vague and should be rewritten.
- **Confidence**: High

#### Honest about scope and license

- **What it means**: say what ships now, and say whose artwork it is.
- **How it shows up**: the same idea everywhere people decide to use the
  library, at two levels of detail. README and npm: the artwork is Microsoft's,
  the code is ISC, the project is not affiliated with or endorsed by Microsoft.
  Landing page and social: "The emoji artwork is Microsoft's. The code is open
  source. Not affiliated with or endorsed by Microsoft." Future features (a
  landing page, README-embeddable files) are never described as available.
- **What to avoid**: "exclusive", "first time", "official", "powered by
  Microsoft"; any wording that suggests the Teams sprites are licensed or free
  to reuse.
- **Evidence**: `brief.md` (Relationship with Microsoft); `ROADMAP.md` (out of
  scope and "never a promise"); the README's "Assets and licensing" section.
  Counter-evidence: the README's "Exclusive Feature" callout.
- **Confidence**: High

#### Plain-spoken

- **What it means**: speak to the reader as an equal, in the reader's own words.
- **How it shows up**: for developers, the code sample leads, competence is
  assumed, and options are listed with defaults, not sold. For everyone else,
  everyday words: "animation", "still picture", "hosted for you". Technical
  terms appear only where the reader needs them.
- **What to avoid**: "simply", "just", pitch language, explaining React to a
  developer, and repository, license or pipeline vocabulary in front of a
  non-technical visitor.
- **Evidence**: `README.md` (props table, Next.js notes) for the developer side;
  `brief.md` (cultural position; Andry's note of 2026-10-05 that the project can
  also serve non-technical people, so the landing page cannot lean on technical
  terms). No shipped non-technical copy yet.
- **Confidence**: Medium

#### Light-handed

- **What it means**: the brand is the stage and the emoji are the show.
- **How it shows up**: short copy around demos; one real Fluent emoji where a
  visual is needed; whitespace.
- **What to avoid**: decorative Unicode emoji in headings (six of the README's
  top-level sections have one today), emoji strings in running text, long intros
  before the first code block.
- **Evidence**: `brief.md` (visual world: "it does not steal the scene");
  `competitors.md` (LobeHub and Tarikul both lean on emoji-decorated headings,
  which is not a differentiator).
- **Confidence**: Medium

#### Considerate

- **What it means**: people who cannot or do not want motion are part of the
  design, not an edge case.
- **How it shows up**: reduced motion, `alt` text and fallback glyphs are
  described as defaults and as a courtesy: "rests on its poster frame when
  someone asks for less motion".
- **What to avoid**: a checkbox tone ("WCAG compliant", "a11y ready") and any
  claim of conformance we have not tested.
- **Evidence**: `README.md` (Reduced motion, Fallback, `alt` default);
  `brief.md` (pain 3).
- **Confidence**: Medium

---

## Brand Personality

- **Archetype**: **The Playful Craftsperson**. Delights people with the result
  and is careful about how it was made.
- **If our brand were a person**: a developer who shipped a tiny thing that
  makes people grin, and who documented every edge case in it. They crack one
  joke, then show you the props table.
- **Core values expressed in voice**: delight, exactness, candor about what is
  and is not theirs, and respect for the reader's time and attention.

---

## Messaging Framework

### Primary Value Proposition

Microsoft's animated Fluent emojis as one React component: they move, they stay
light, and they respect the people who do not want motion.

Variations observed:

- "A React component library that brings Microsoft's Fluent emojis to life in
  your web applications" (Source: `README.md`, `package.json`). Accurate and
  generic; it names no benefit.
- "Fluent emoji — a collection of familiar, friendly, and modern emoji from
  Microsoft" (Source: LobeHub, in `competitors.md`). The category leader's
  framing, which is static.

Every statement in the framework describes what ships today. A landing page and
README-embeddable files are planned and stay out of copy until they exist.

### Key Message Pillars

1. **Alive**
   - Core idea: the emoji move, and you choose when.
   - When to use: hero lines, demos, the first screen of the README.
   - Example phrasing: "They wave back. Hover one and see." (illustrative; the
     copy step finalizes it)
2. **Light**
   - Core idea: motion without the usual cost.
   - When to use: performance questions, comparisons, release notes.
   - Example phrasing: "One small manifest, fetched when the first emoji renders
     and never at import time." For non-technical readers: "They never push your
     page around while they load."
3. **Considerate**
   - Core idea: reduced motion, `alt` text and fallbacks come standard.
   - When to use: accessibility questions, docs, the landing page's trust
     section.
   - Example phrasing: "If someone asks their system for less motion, the emoji
     rests on its first frame." For non-technical readers: "If someone asks
     their device for less motion, the emoji stays still."
4. **Clear about what is whose**
   - Core idea: the artwork is Microsoft's, the code is ours, and nobody should
     have to guess.
   - When to use: README, npm page, landing footer, licensing questions.
   - Example phrasing: "The artwork belongs to Microsoft. The code is ISC. This
     project is not affiliated with or endorsed by Microsoft." For non-technical
     readers: "The emoji artwork is Microsoft's. The code is open source. Not
     affiliated with or endorsed by Microsoft."

### Competitive Positioning

- vs. **`@lobehub/fluent-emoji`**: it is the category leader and mostly static
  and 3D, with animated packs published as separate packages. We focus on the
  animated set, in one component.
- vs. **`react-fluentui-emoji` and the other static packs**: they ship still
  images. We ship the animated ones, with playback control.
- vs. **Tarikul's `Animated-Fluent-Emojis`** (a repository and a site of
  copy-and-paste images): it is a catalog of files. We are a maintained
  component with loading, reduced motion and a fallback.
- vs. **Status quo** (download a file, copy a tag): it works for one emoji. With
  a component you do not manage files, sizes or frames.

---

## Tone-by-Context Matrix

Voice is constant. Tone flexes along three dimensions.

| Context                            | Formality  | Energy      | Technical Depth | Key Principle                                        |
| ---------------------------------- | ---------- | ----------- | --------------- | ---------------------------------------------------- |
| README intro                       | Low-Medium | Medium-High | Low             | A smile, then the code                               |
| API docs and props tables          | Medium     | Low         | High            | Exact and quiet; no jokes                            |
| Release notes and changelog        | Medium     | Low         | High            | Say what changed and flag behavior changes           |
| Dev warnings and error messages    | Medium     | Low         | High            | Say what happened and what to do; never cute         |
| npm description and GitHub About   | Low-Medium | Medium      | Low             | One plain sentence with the searchable phrase        |
| GitHub issue and PR replies        | Low        | Medium      | Medium-High     | Thank them, answer plainly, stay light               |
| Landing page (future)              | Low        | High        | Low, no jargon  | Let the emoji lead; short lines; the fact under each |
| Social posts and captions (future) | Low        | High        | Low             | One emoji, one idea                                  |

### Context-Specific Guidelines

#### README intro

- **Overall tone**: warm and brief.
- **Opening approach**: the emoji first, one sentence second, the import third.
- **Do's**: show a real Fluent animation; name the benefit with its mechanism.
- **Don'ts**: "Exclusive", decorative emoji in headings, a feature list of
  adjectives.
- **Example**: "Fluent emojis, but they move. One component, one import."

#### API docs and errors

- **Overall tone**: plain.
- **Do's**: state the default, the type and the edge case.
- **Don'ts**: humor, exclamation marks, "just".
- **Example**: "An unknown id renders the `fallback` node, or nothing. It does
  not call `onError`."

#### Release notes

- **Overall tone**: candid.
- **Do's**: label behavior changes; say what was wrong, then what is fixed.
- **Don'ts**: celebrate your own release.
- **Example**: "Fixed: a finished run is no longer restarted by toggling
  `playing`."

#### Landing page and social (future, Low confidence)

- **Overall tone**: playful, with the fact beside the joke, in everyday words.
- **Do's**: lead with motion; keep the non-affiliation line near the install
  command or the download; keep any developer detail one click away (a link to
  the README), not above the fold.
- **Don'ts**: claim README-embeddable files before they ship; use Microsoft's or
  Teams' branding; name Microsoft's repository, the license or any pipeline term
  in the hero, the pillars or the footer line.
- **Example**: "Hover it. It waves back."

---

## Terminology Guide

### Must-Use Terms

| Term                       | Usage                                                                      | Instead Of                            | Example                                              |
| -------------------------- | -------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| **animated Fluent emojis** | The searchable phrase; in prose, lowercase "animated" and capital "Fluent" | "animated emoji pack"                 | "Animated Fluent emojis for the web."                |
| **catalog**                | The full set of emojis the asset site publishes                            | library, collection, emoji list       | "Every emoji in the catalog has a stable id."        |
| **sprite sheet**           | The stacked frames of one emoji                                            | spritesheet, atlas, animation file    | "Each emoji is one sprite sheet."                    |
| **poster frame**           | The frame an emoji rests on when it does not animate                       | thumbnail, still, first image         | "Under reduced motion it rests on its poster frame." |
| **manifest**               | The file the component fetches lazily                                      | index, catalog file                   | "The manifest loads once, on first render."          |
| **asset site**             | Where the manifest and sprite sheets are hosted                            | CDN, bucket                           | "Point `assetSiteUrl` at your own asset site."       |
| **fallback glyph**         | The native Unicode character shown when a sheet fails                      | placeholder (that is the loading box) | "If it fails, the fallback glyph shows."             |
| **lookup**                 | Resolving text or a unicode emoji to catalog emojis                        | search API, finder, resolver          | "Use lookup to find an id from a character."         |

These come from the `CONTEXT.md` glossary, which is the source of truth.
"Library" is fine for the package ("a React component library"); the rule is
that it does not mean the set of emojis.

### Two vocabularies

The glossary terms above are for the README, the docs, npm, the changelog and
issue replies. On the landing page and in social posts, say it the way a
non-technical person would. The facts stay the same; only the words change.

| Technical (README, docs, npm) | Plain (landing page, social)                     |
| ----------------------------- | ------------------------------------------------ |
| sprite sheet                  | animation                                        |
| poster frame                  | still picture, first frame                       |
| manifest, asset site          | (do not mention; "ready to use" says enough)     |
| fallback glyph                | the regular emoji shows instead                  |
| lookup                        | find an emoji                                    |
| reduced motion                | "less motion" (an option on the person's device) |
| ISC, MIT-licensed repository  | "open source" (code), "artwork by Microsoft"     |
| catalog                       | "all the emojis"; no count unless verified       |

### Preferred Terms

| Term                                         | Usage                                                                                         | Example                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **emoji** / **emojis**                       | Both are fine; "emojis" in the project name                                                   | "Pick an emoji, set a size."                                 |
| **play**, **rest**, **wave**                 | Motion verbs for what emojis do                                                               | "It rests on the poster frame."                              |
| **from Microsoft's MIT-licensed repository** | README and docs only, for the emojis the glossary calls "official"; never on the landing page | "Some emojis come from Microsoft's MIT-licensed repository." |

### Avoid These Terms

| Term                                                                                            | Reason                                                     | Alternative                                                               |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| "lightweight", "optimized"                                                                      | Vague without the mechanism                                | State it: lazy manifest, HD only on HD screens                            |
| "official emoji" in public copy                                                                 | Reads as endorsement; keep it for internal docs            | README: "from Microsoft's MIT-licensed repository". Landing: leave it out |
| Glossary terms on the landing page (sprite sheet, manifest, poster frame, repository, ISC, MIT) | Jargon for a non-technical visitor                         | The plain column in "Two vocabularies"                                    |
| "Teams emoji" in public copy                                                                    | Implies a Microsoft product tie; keep it for internal docs | "the animated emojis Microsoft Teams uses", once                          |
| "easy", "simply", "just"                                                                        | Condescending to a peer                                    | Show the code                                                             |
| "accessible", "a11y ready"                                                                      | Claims conformance we have not tested                      | Describe the behavior: reduced motion, alt text                           |

### Never-Use Terms

| Term                                                       | Reason                                            |
| ---------------------------------------------------------- | ------------------------------------------------- |
| "exclusive", "for the first time"                          | False; the animated set is in public repositories |
| "official", "Microsoft's official", "powered by Microsoft" | Implies endorsement                               |
| "supercharge", "blazing fast", "seamless", "robust"        | Hype with no fact behind it                       |
| A catalog size we did not read from the live manifest      | Numbers go stale and have been wrong before       |

---

## Language to Avoid

### Anti-Patterns

1. **"🎉 Exclusive Feature: Until now, these emojis were only available within
   Microsoft Teams. This library makes them accessible for the first time."**
   (current `README.md`) — Problem: it claims exclusivity that is not true and
   leans on Teams. Better: "Fluent emojis, but they move. One component, one
   import."
2. **"Lightweight: Optimized for performance to keep your applications fast."**
   (current `README.md`) — Problem: three adjectives, no fact. Better: "The
   manifest is fetched lazily, and HD sprite sheets only reach high-density
   screens."
3. **Emoji in section headings** ("Features 🌟", "Installation 🔧" and four more
   in the current `README.md`) — Problem: decorative Unicode emoji from the
   reader's system compete with the real Fluent ones. Better: plain headings,
   and Fluent animations where a visual helps.

---

## Content Examples

### Excellent Examples

> **Fluent emojis, but they move.** One component, one import:
> `<Emoji id="1f44b_wavinghand" />`. They play on load or on hover, rest on a
> still frame when someone asks for less motion, and hold their space in the
> layout while they load.
>
> The artwork belongs to Microsoft. The code is ISC. This project is not
> affiliated with or endorsed by Microsoft.

Why it works: one playful line, then three facts that are all true today
(playback options, reduced motion, placeholder of the final size), then the
license split in plain words. It makes no claim about features that do not ship.

For the landing page (future), the same facts in everyday words:

> **Hover it. It waves back.** Microsoft's animated Fluent emojis, ready to drop
> into your website. They never push your page around while they load, and if
> someone asks their device for less motion, they stay still.
>
> The emoji artwork is Microsoft's. The code is open source. Not affiliated with
> or endorsed by Microsoft.

### Examples to Avoid

> 🎉 **Supercharge your app with exclusive animated emojis!** 🚀 Seamless,
> lightweight and blazing fast — now available for the first time!

Why it fails: hype words, a false exclusivity claim and decorative emoji, with
no fact the reader can check. Fix: lead with the animation, state one mechanism,
and add the license sentence.

---

## Confidence Scores

| Section             | Confidence                            | Basis                                                                                        | Sources |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| Voice Attributes    | Medium                                | The precise side is demonstrated in shipped docs; the playful side comes only from the brief | 5       |
| Messaging Framework | Medium                                | Pillars map to documented features; the positioning is inferred from `competitors.md`        | 4       |
| Tone Matrix         | Medium for rows 1-6, Low for rows 7-8 | Docs and changelog are shipped; no landing page or social copy exists yet                    | 4       |
| Terminology         | High                                  | An explicit glossary in `CONTEXT.md`, plus the brief's never-use rules                       | 3       |
| Language Patterns   | Low                                   | No transcripts, issues or reviews; only the current README as an anti-pattern source         | 1       |

Aggregate: 0.62, which is **Medium**, near the bottom of the band. The tone
score is weighted by matrix rows: six rows at Medium (0.6) and two at Low (0.3)
give 0.525. So: voice 0.18, messaging 0.15, tone 0.105, terminology 0.15,
language 0.03.

---

## Open Questions for Team Discussion

### High Priority (blocks guideline completion)

1. **The word "official"**
   - What was found: `CONTEXT.md` defines **Official emoji** for the emojis from
     Microsoft's MIT-licensed repository, while `brief.md` says never to use
     "official" in public copy because it reads as endorsement.
   - Agent recommendation: keep the glossary term in internal docs and code. In
     the README and docs, say "from Microsoft's MIT-licensed repository" where
     it matters. On the landing page and in social posts, do not name the
     repository at all: say "The emoji artwork is Microsoft's" and link to the
     README's "Assets and licensing" section for anyone who wants the detail.
   - Need from you: confirm, or rename the glossary term.
   - **Resolved 2026-10-05:** confirmed as recommended.

### Medium Priority (improves quality)

2. **Decorative emoji in the README**
   - What was found: six top-level README headings carry a Unicode emoji, and
     LobeHub's README does the same.
   - Agent recommendation: drop them from headings and show real Fluent
     animations instead, so the only emoji on the page are the product.
   - Need from you: confirm, since it changes the README's table-of-contents
     anchors.
   - **Resolved 2026-10-05:** confirmed as recommended.
3. **How much humor**
   - What was found: the brief asks for a more playful brand but sets no limit.
   - Agent recommendation: at most one light line per surface, and none in API
     docs, errors or the changelog, as set out in the tone matrix.
   - Need from you: confirm the limit.
   - **Resolved 2026-10-05:** confirmed as recommended.

### Low Priority (nice to have)

4. **Person and address**
   - What was found: the docs are impersonal ("this library", "you").
   - Agent recommendation: keep "you" for the reader, avoid "we" and "I" in
     docs, and allow a first-person voice only in posts under Andry's name.
   - Need from you: confirm.
   - **Resolved 2026-10-05:** confirmed as recommended.

---

## Data Gaps & Recommendations

- [ ] No user language: read GitHub issues and discussions after launch and add
      the words people use.
- [ ] No landing or social copy exists, so those rows are provisional: revisit
      this guide when the landing page is drafted.
- [ ] No tested accessibility claim: before any copy says "accessible", run an
      audit and cite it.
- [ ] No verified catalog size: read the count from the live `manifest.json`
      before any copy states one.
- [ ] The three README anti-patterns above (the "Exclusive Feature" callout, the
      vague feature bullets and the heading emoji) are rewritten in the apply
      stage, through `apply-spec.md`, not in this guide.

---

## Appendix: Sources

| #   | Source                      | Platform | Type          | Date       | Key Sections Used                             | Confidence |
| --- | --------------------------- | -------- | ------------- | ---------- | --------------------------------------------- | ---------- |
| 1   | `docs/brand/brief.md`       | Repo     | Authoritative | 2026-10-05 | Emotional promise, playfulness, what to avoid | High       |
| 2   | `docs/brand/naming.md`      | Repo     | Authoritative | 2026-10-05 | Decision, tagline basis                       | High       |
| 3   | `docs/brand/competitors.md` | Repo     | Operational   | 2026-10-05 | Competitor positioning                        | Medium     |
| 4   | `README.md`                 | Repo     | Operational   | 2026-10-05 | Features, playback, license wording           | High       |
| 5   | `CHANGELOG.md`              | Repo     | Operational   | 2026-10-05 | Release-note tone                             | Medium     |
| 6   | `ROADMAP.md`                | Repo     | Operational   | 2026-10-05 | Candor about scope                            | Medium     |
| 7   | `CONTEXT.md`                | Repo     | Authoritative | 2026-10-05 | Terminology glossary                          | High       |
