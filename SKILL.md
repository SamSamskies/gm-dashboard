---
name: gm-dashboard-bake
description: Use this when updating the Good Morning dashboard HTML or publishing it to GitHub Pages. Do not rebuild the page from scratch.
---

# Good Morning dashboard bake

Single-file dashboard. Edit `index.html` in place. Never replace the design.

## Source of truth

- GitHub: `SamSamskies/gm-dashboard` branch `main`
- Pages: https://samsamskies.github.io/gm-dashboard/

Keep `.nojekyll`. Filename stays `index.html`.

## Do not

- Rebuild the page or restyle it
- Force-push
- Change git config
- Amend commits
- Install an X connector
- Post, like, follow, or mutate anything on X (read-only)

## Every bake

1. Read the current `index.html` from GitHub `main`. Reuse layout, CSS, cards, charts, modal, Coinbase BTC poll, NWS fetch, Ask-AI drawer, Polymarket section.
2. Refresh data only: header as-of, Austin weather copy (NWS still fetches live on load), BTC/Dow figures and baked series (`#btc-series`, `#dow-series`), prediction-market cards, news cards, watch list, footer. Times in America/Chicago.
3. News: X first, then Reddit, Nostr, then wire. Cite URLs. Label Confirmed / Developing / Rumor. Skip empty categories. Last ~24h unless an older item has a real update. Nostr notes must be from the past 12h and only appear when they genuinely belong in Important or What I care about, as normal cards with a `Nostr · <author>` jumble.social source and a verified/speculation note. No Nostr placeholder cards.
4. Prediction markets: 5–6 trending Polymarket markets in the larger 3-column grid. Always include 1–2 markets about new AI model releases (named frontier models / next version by a date, e.g. Gemini Flash 3.8+). Also rotate geopolitics, disasters, AI/tech policy, crypto legislation, science, culture, housing/macro. Skip Bitcoin price ladders and single-stock price markets. Do not pin Fed or CLARITY unless odds are moving a lot. Live fetch from `gamma-api.polymarket.com` with baked fallback.
5. Publish by updating GitHub `index.html` on `main` (contents API or fast-forward push). Commit message: `Good Morning dashboard — <Month D, YYYY>`.

## Layout

Section order: Austin weather → Markets → Important → What I care about → Prediction markets → Watch (last, just above the footer). No separate Nostr section and no sticky jump nav.

## Keep working

- Side-by-side charts (~180px), click-to-expand modal
- BTC: rolling 24h, Coinbase 5-min candles on load, then live poll
- Dow: last session when closed
- Weather: NWS on load (Camp Mabry KATT + EWX grid), not a baked snapshot
- Ask-AI sparkle on each `article.card`

## Card media (images, video, tweet embeds)

News items may carry an optional `media` list (max 1 per card, ~4–6 per board). Types: `image`, `video` (direct mp4/webm), `youtube` (click-to-load iframe), `tweet` (x.com status URL → official X embed with `data-theme="dark" data-dnt="true"`; `widgets.js` loads once, async, only if a tweet exists; the blockquote holds the verbatim post text as a fallback).

- Every X-sourced item embeds the actual post. Keep the card summary and its verified/speculation label. Only real status URLs from the X pass.
- Add images/video only when they carry information: NHC cones, NWS graphics, USGS ShakeMaps, disaster photos from the reporting outlet, launch screenshots/demo video, media attached to the cited post, source charts. No stock, decorative, generic file-photo, or AI-generated images.
- Use media from the original source (article og:image only if it depicts the event, the post's own media, official agency graphics). Never fabricate a URL; verify 200 + `image/*`/`video/*` before embedding.
- Images: lazy, rounded, max-height ~180px, click opens a full-size lightbox. Every embed has a small credit link. Broken media hides itself via `onerror`.
- Media CSS/JS lives between `gm-media:start` / `gm-media:end` markers in `index.html`; the bake replaces that block in place.
