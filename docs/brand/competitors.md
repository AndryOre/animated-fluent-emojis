# Competitor analysis — animated and Fluent emoji for the web

Scope: ways a web developer can get Fluent or animated emoji into a React app.
Static emoji packs are included because they are what people find first when
they search for "fluent emoji". Emoji pickers and general icon libraries are out
of scope (different job).

Data collected 2026-10-05 from the npm registry, the npm downloads API and the
GitHub API. Downloads are the last 30 days.

## Our own listing (baseline)

- **Package:** `animated-fluent-emojis` 0.5.1, first published 2024-08-22
- **Downloads:** 280 last month (129 a month earlier)
- **GitHub:** 0 stars, ISC license, active (last push 2026-10-05)
- **Positioning:** React component that renders Microsoft's animated Fluent
  emoji from an asset site; lazy slim manifest, HD sprite sheets, ESM only
- **Name:** generic and literal. It is also the name of other GitHub repos (see
  below)
- **Gaps:** no landing or docs site (the Pages domain returns 404 at `/`), no
  logo or visual identity beyond the Microsoft artwork, a long generic
  description

## Direct and adjacent options

| Option                                                                 | What it is                                                                                               | Reach                                           | Animated? | Notes                                                                                                                  |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| **`@lobehub/fluent-emoji`** (+ `-3d`, `-flat`, `-mono`, `-anim-1/2/3`) | React component and static asset packs of the Fluent emoji, served from a CDN, with a browsing site      | 1.55M downloads a month (main), 84 stars        | Partly    | The category leader. Branded with the LobeHub logo, has its own gallery (`fluent-emoji.lobehub.com`), MIT, active      |
| **`microsoft/fluentui-emoji-animated`**                                | Microsoft's own repository of the animated set                                                           | 165 stars, MIT, last push 2024-10               | Yes       | The source of the sprites, not a React API. No npm package                                                             |
| **`Tarikul-Islam-Anik/Animated-Fluent-Emojis`**                        | GitHub repository and website of PNGs and an `<img>` tag copier, built for READMEs and GitHub profiles   | 1,102 stars, 121 forks, last push 2025-03       | Yes       | The reference for "animated fluent emojis" in search results. Not a package. Its repo name is nearly identical to ours |
| **`react-fluentui-emoji`** (MKAbuMattar)                               | React components for the static Fluent emoji                                                             | 16.4k downloads a month, 10 stars               | No        | Plain README, last published 2025-07                                                                                   |
| **`@fluentui-emoji/react`, `@fluentui-emoji/svg`** (MKAbuMattar)       | Newer tree-shakeable typed components and SVGs (flat, high-contrast, modern)                             | 726 downloads a month                           | No        | Same author, actively published (2026-08)                                                                              |
| **`@iconify-json/fluent-emoji*`**                                      | Iconify data for the Fluent emoji (color, flat, high contrast)                                           | 14.9k to 29.8k downloads a month                | No        | Used through Iconify; no component of its own                                                                          |
| **`fluentui-emoji`, `fluentui-emoji-js`**                              | JS wrappers for the static Fluent emoji                                                                  | 5.2k and 4.8k downloads a month                 | No        | Small, undifferentiated                                                                                                |
| **`@remotion/animated-emoji`**                                         | Google Noto animated emoji as Remotion components (a different emoji set)                                | 63.5k downloads a month; Remotion has 62k stars | Yes       | Shows the demand for animated emoji, but for video, not the web UI, and it is Google's set                             |
| **`emoji-animation`**                                                  | Animated emoji React components with their own reactions                                                 | 41 downloads a month                            | Yes       | Different artwork, no traction                                                                                         |
| **Forks and copies**                                                   | `ashymee/animated-fluent-emojis` copies our description word for word; several forks of the Tarikul repo | 0 stars each                                    | —         | Confirms there is no protected brand, only a generic phrase                                                            |

## Takeaways for naming and positioning

- **Nobody owns "animated Fluent emoji" as a React package.** The leader by far
  is `@lobehub/fluent-emoji`, but it is mostly static and 3D, and it is a
  product of a larger brand. The animated set is covered by repositories
  (Microsoft's, Tarikul's), not by a maintained component.
- **The phrase people search is the literal one.** Every successful option here
  is named for what it contains: "fluent emoji", "animated fluent emojis",
  `fluentui-emoji`. The one with the most stars (1,102) has our exact words.
  This favors keeping the current name; a new brand name would have to earn that
  discoverability back.
- **The gap is identity and presentation, not features.** Competitors have
  either a plain README (MKAbuMattar) or someone else's brand (LobeHub). None
  has a visual identity of its own, and none shows the animation well in its
  first screen. Our README already uses animated webp in the header.
- **Our edge is technical and not visible yet:** one manifest fetched lazily, HD
  sprite sheets, ESM only, React 18 and 19, TypeScript. The brand should make
  "animated, light, easy" visible instead of listing mechanics.
- **There is a trust angle.** The sprites are Microsoft's. LobeHub and Tarikul
  both rely on the same assets, and Tarikul's repo shows a license of "other". A
  clear, short statement of what is ours (the code, ISC) and what is Microsoft's
  (the artwork, MIT) is a differentiator, and it is also the protection against
  looking like an official Microsoft project.
- **Demand is small and real.** 280 downloads a month for a package with 0 stars
  next to 1.55M for the leader and 63.5k for the animated Remotion pack. The
  brand work should stay proportionate: a light kit, not a campaign.

## Open questions for the brief

- Who is the reader: a React developer adding emoji to a UI, or someone who
  wants the README and profile emoji (Tarikul's audience)? The package serves
  the first; the search results serve the second.
- Is the Pages site meant to become a browsable gallery (the LobeHub model), or
  stay an asset host? Decided for now: no landing page, so the gallery question
  is parked.
