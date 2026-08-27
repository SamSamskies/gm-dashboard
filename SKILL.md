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
3. News: X first, then Reddit, Nostr, then wire. Cite URLs. Label Confirmed / Developing / Rumor. Skip empty categories. Last ~24h unless an older item has a real update.
4. Prediction markets: 3–4 trending Polymarket markets worth caring about (geopolitics, disasters, AI/tech policy, crypto legislation, science, culture, housing/macro). Skip Bitcoin price ladders and single-stock price markets. Do not pin Fed or CLARITY unless odds are moving a lot. Live fetch from `gamma-api.polymarket.com` with baked fallback.
5. Publish by updating GitHub `index.html` on `main` (contents API or fast-forward push). Commit message: `Good Morning dashboard — <Month D, YYYY>`.

## Keep working

- Side-by-side charts (~180px), click-to-expand modal
- BTC: rolling 24h, Coinbase 5-min candles on load, then live poll
- Dow: last session when closed
- Weather: NWS on load (Camp Mabry KATT + EWX grid), not a baked snapshot
- Ask-AI sparkle on each `article.card`
