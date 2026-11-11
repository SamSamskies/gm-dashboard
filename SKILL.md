---
name: gm-dashboard-bake
description: Bake and publish the Good Morning dashboard (index.html on SamSamskies/gm-dashboard -> Vercel). Edit in place; never rebuild from scratch.
---

# Good Morning Dashboard Bake

Single-file static dashboard (`index.html`) deployed from `SamSamskies/gm-dashboard` branch `main` to https://gm-dashboard-samsamskies.vercel.app/ (with `/api/dow` serverless function on Vercel).

## Non-negotiable rules

- **Edit `index.html` in place** using `patch.py` and a `cards.json` payload. Never rewrite or restyle the page from scratch.
- **No secrets or local filesystem paths** in `index.html`, commit messages, or this repo.
- **All displayed times** in `America/Chicago` (CT).
- **Read-only on X / Nostr / Reddit / news wires**: never post, like, follow, or mutate anything.

## Page layout & invariants (`patch.py` enforces these)

The page has **seven sections** in this fixed order:
1. **Austin weather** (`wx-label`) — live NWS (`KATT` + `EWX/156,91`) on load + baked fallback
2. **Markets** (`mkt-label`) — BTC + Dow cards with side-by-side ~180px charts and click-to-expand modal
3. **Household readiness · PANTRYCON** (`pantry-label`, `#pantry-section`) — DEFCON-style 5 → 1 household food/water supply readiness meter (`cards.json` `"pantry"` key)
4. **Important** (`imp-label`) — numbered cards (`Confirmed` / `Developing` / `Rumor`)
5. **What I care about** (`care-label`) — numbered cards
6. **Prediction markets** (`pm-label`) — 1–6 Polymarket cards with live `gamma-api.polymarket.com` refresh
7. **Watch** (`watch-label`) — **must be the last `<section>`** right before `<footer class="foot">`

Layout rules:
- **No separate Nostr section** (`nostr-label` must not exist). Recent Nostr notes (**≤ 12 hours old**, linked to `https://jumble.social/notes/note1...`) go into `important` or `care` as normal cards with a `Nostr · <author>` source chip.
- **No sticky jump nav** (`nav.jump` must not exist).
- **Keep all live IDs & scripts intact**: `wx-temp`, `wx-cond-main`, `wx-cond-sub`, `wx-cond-obs`, `wx-high`, `wx-high-s`, `wx-low`, `wx-hi`, `wx-rain`, `wx-rain-s`, `wx-adv-until`, `wx-hourly-cap`, `wx-hourly-row`, `wx-now-use`, `wx-live`, `pm-live`, `pm-grid`, `btc-price`, `btc-chg`, `btc-meta`, `btc-series`, `dow-session`, `dow-price`, `dow-chg`, `dow-meta`, `dow-series`, `/api/dow`, `gamma-api.polymarket.com`, and the Ask-AI script (marker counts below). Do not add or remove occurrences of `SYSTEM`, `seedHistory`, or `runInference`.

## Ask AI sparkle buttons

Every card gets a sparkle button from the Ask-AI script at the bottom of `index.html`. The drawer, `window.inference` request path, and chat UI stay in the file. The button action depends on the mode:

- **Copy prompt (default).** Clicking a sparkle copies a plain-text prompt and shows a short “Copied” toast. The prompt is the same pair of messages the drawer would send: the system instructions (including the current America/Chicago time) and the card block (`Card: <title>`, the card’s visible text, and a `Sources:` list). The two parts are separated by a `---` line, and each line’s extra indentation is collapsed so the paste reads clearly in ChatGPT. The messages sent to Inference Bridge are unchanged. Clipboard order is `navigator.clipboard.writeText` when it exists on a secure page, then `document.execCommand("copy")`, then a selectable textarea if both fail. The toggle sits under the date line, on the left, so the drawer does not cover it.
- **Inference Bridge.** The sparkle opens the existing drawer and uses `window.inference` exactly as before. If bridge mode is on but `window.inference` is missing, the drawer still shows the existing unavailable message and adds a **Copy prompt** button for that same text.

Switch modes without editing code:

- **Flag (default only):** `USE_INFERENCE_BRIDGE` in the Ask-AI script. `false` means copy; `true` means Inference Bridge. This applies only when nothing else is set.
- **Header toggle:** `AI: Copy prompt / Inference Bridge`. The choice is stored in `localStorage` under `gm-ai-mode` (`copy` or `bridge`) and beats the flag.
- **URL override (this visit):** `?ai=copy` or `?ai=bridge` beats both the saved toggle and the flag. Picking either side of the toggle saves that choice and removes the `ai` query.

Leave the marker counts exact. The copy path must not add another `SYSTEM`, `seedHistory`, or `runInference`; it reuses the existing system prompt through the helper that `seedHistory` already calls.

## Household Supply Readiness (`"pantry"` · `PANTRYCON`)

`patch.py` renders `#pantry-section` (`Household readiness · PANTRYCON`) right below `Markets` and above `Important` (with a Level 5 default if `"pantry"` is omitted from `cards.json`). Include a `"pantry"` object in `cards.json` on every bake, grounded in real weather/ERCOT, cyber/infrastructure, civil-unrest, and geopolitical signals on the board (zero fearmongering):

- **PANTRYCON 5 · Normal Larder (3–7 days):** Routine baseline. Keep 3–7 days of water (1 gal/person/day) and shelf-stable meals for normal Texas storms or brief outages.
- **PANTRYCON 4 · Top Off the Pantry (2 weeks):** Elevated background risk (active cyber/infra campaigns, allied 72h preparedness advisories, pre-election tension, or regional conflict escalation). Keep 14 days of shelf-stable food, water, pet/household essentials, power banks charged, and some small-bill cash.
- **PANTRYCON 3 · Deep Pantry (30 days):** Credible near-term grid, supply-chain, or civil-disorder threat (e.g., ERCOT emergency watch, major tropical/freeze threat to Austin, Insurrection Act / US-Iran war odds spiking above ~35%, or active U.S. infrastructure cyber disruption). Stock 30 days of non-perishable food, water storage/filtration, prescriptions, fuel, and cash.
- **PANTRYCON 2 · Bunkered (60 days):** Imminent or unfolding homeland disruption, major war mobilization, or widespread grid/payment-system outages. 60 days of food/water/fuel, full tanks, backup power ready.
- **PANTRYCON 1 · Full FORTRESS (90+ days):** Active grid-down, nationwide emergency, or major conflict affecting U.S. supply chains (matching the Pentagon's 90-day FORTRESS standard).

```json
"pantry": {
  "level": 4,
  "headline": "Top Off the Pantry — Keep ~2 Weeks of Food & Water",
  "sub": "Elevated background risk · No panic buying",
  "rationale": "1–2 grounded sentences explaining why PANTRYCON is at this level today and what practical supplies to keep on hand.",
  "signals": [
    {"label": "Austin/ERCOT: Calm", "tone": "ok"},
    {"label": "Cyber/Grid: Elevated (PHP flaw + UK/US hardening)", "tone": "warn"},
    {"label": "Insurrection Act: 19%", "tone": "warn"},
    {"label": "US–Iran Ceasefire: 85.5%", "tone": "warn"}
  ],
  "checklist": [
    "14 days shelf-stable food",
    "Water (~14 gal/person)",
    "Small-bill cash",
    "Charged power bank"
  ],
  "sources": [
    {"href": "https://...", "label": "Source · topic"}
  ]
}
```

## Optional `why` ("Why it matters:") on `important` / `care` cards

Each item in `important` or `care` may include an optional `"why"` string:
- **Selective, not every card**: only include `"why"` when the takeaway, second-order effect, or action item isn't already obvious from `"html"` (e.g. "patch Brotli if you run Node or Bun", "why this benchmark matters for local Mac inference"). Omit `"why"` on routine or self-explanatory items.
- **One concise sentence**: plain text (no HTML tags needed; `patch.py` strips any leading `"Why it matters:"` prefix and renders `<p class="card-why"><strong class="card-why-label">Why it matters:</strong> …</p>` in warm amber `#e08a3c` / light-mode `#b85d14` between the summary `<p>` and any media/sources).

## Rich media on `important` / `care` cards

Add a `media` list (max **2 per card**, **6 per board**) when an item genuinely benefits from a visual or primary post:
- `"type": "image"` — real `https://` image URL (maps, USGS shakemaps, NHC cones, charts). Click-to-zoom lightbox.
- `"type": "tweet"` — real `https://x.com/<handle>/status/<id>` post URL, with verbatim `text`, `handle`, `date`, `credit`. Rendered via X's dark-theme `widgets.js` with styled blockquote fallback.
- `"type": "youtube"` — real `https://www.youtube.com/watch?v=<id>` URL, privacy-enhanced click-to-play `youtube-nocookie.com` embed.
- `"type": "video"` — direct `https://` `.mp4`/`.webm` with `<video controls muted playsinline preload="metadata">`.

Every media item is live-verified before baking (HTTP 200 + `image/*` or `video/*`, X syndication lookup for tweets, YouTube oEmbed 200 for videos); broken URLs are automatically dropped.

## Verification before & after publish

1. **Fact-check**: Every claim, number, date, and quote in `important`, `care`, `watch`, and any `"why"` line must appear in its cited source URLs (checked via `factcheck.py`).
2. **Sanity check**: `patch.py` validates all required DOM IDs, section ordering (`watch-label` last), `#pantry-section` presence, Ask-AI marker counts (`SYSTEM` = 2, `seedHistory` = 3, `runInference` = 4), absence of `nostr-label` and `nav.jump`, `btc-series` OHLC keys, and single media-assets block. Keep the sparkle-button copy path and the `USE_INFERENCE_BRIDGE` flag; do not add new references to those three identifiers.
3. **Live verification**: After pushing `index.html` to `main`, confirm `https://gm-dashboard-samsamskies.vercel.app/` serves the new build.

## PANTRYCON: one section only

The dashboard has exactly one PANTRYCON card (`#pantry-section`, from `cards.json` `"pantry"`). Do not add a second national card, a fetch-and-render script, or any `<script type="module">` for it. The standalone PANTRYCON site is reviewed separately. Run `node --test test/pantry-section.test.mjs` after a bake.
