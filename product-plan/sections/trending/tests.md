# Test Specs: Trending

These specs are **framework-agnostic**. Adapt to your testing setup.

## Overview

Four stacked sections — ranked posts, weighted hashtag block (cloud + list), platform-compare sparkline cards, and a 7×24 heatmap. Always last-24h scoped; no internal window selector.

---

## User Flow Tests

### Flow 1: Rank #1 visual treatment

For `trendingPosts[0]` (the #1 row):

- [ ] Rank cell renders a Crown icon inside an amber-tinted circle (not the numeric "01").
- [ ] Card border is amber/30 with a hover state of amber/50.
- [ ] A top hairline gradient (amber → violet) renders above the card body.
- [ ] A "Top mover" eyebrow with a Flame icon renders next to the identity row.

For rows #2 through #10:
- [ ] Rank cell renders the mono-tabular two-digit number ("02", "03", … "10").
- [ ] Border defaults to `[#1E1E2E]`; hover goes to violet/30.

### Flow 2: Click a trending post

- [ ] Clicking any row fires `onPostClick(post)` with the full `TrendingPost`.
- [ ] Pressing Enter on a focused row also fires `onPostClick`.
- [ ] ArrowUpRight icon at the far right translates 0.5px on hover.

### Flow 3: Velocity chip glow scales with value

- [ ] For `velocityPercent: 312`, the chip's box-shadow opacity ≈ `0.25 + 0.35 * (300/300) = 0.6`.
- [ ] For `velocityPercent: 28`, the box-shadow is much fainter.
- [ ] Falling velocity (negative) renders rose-tinted; rising velocity renders emerald.

### Flow 4: Hashtag cross-column hover sync

1. User hovers `#linenseason` in the **tag cloud**.
2. The cloud entry scales 5% larger with a text-shadow.
3. The matching row in the **ranked list** highlights with `bg-white/[0.04]`.

**And vice versa:**
1. User hovers the `#linenseason` row in the list.
2. The cloud entry scales + glows.

### Flow 5: Click a hashtag

- [ ] Clicking a hashtag in either column fires `onHashtagClick('#linenseason')`.

### Flow 6: Heatmap hover + click

1. User hovers a cell at `day: 3, hour: 19` (Thursday 7 PM).
2. The cell gains a violet ring with offset.
3. The bottom-right tooltip area updates: "Thursday · 7 PM · 9.40% avg eng".

- [ ] The peak slot pre-rendered in the header reads "Thu 8 PM · 9.80%" (or whichever cell has `max value`).
- [ ] Clicking a cell fires `onHeatmapCellClick(cell)`.

---

## Tag Cloud Tests

For each `TrendingHashtag h`:

- [ ] Font size = `11 + h.weight * 18` (px) — ranges from 11px to 29px.
- [ ] Font weight = `500 + round(h.weight * 200)`.
- [ ] Color shifts to violet for `growthPercent >= 0`, to rose for negative.
- [ ] Color intensity scales with `min(abs(growthPercent), 300) / 300`.

## Hashtag List Tests

- [ ] Rows render in the order they appear in the `hashtags` array.
- [ ] Each row shows: rank number, hashtag, usage bar, usage count (formatted as e.g. "1.8K"), growth chip.
- [ ] Growth chip uses ArrowUpRight for positive, ArrowDownRight for negative, with emerald/rose tinting.

## Platform Compare Tests

For each `PlatformSeries`:

- [ ] Large platform-color icon tile renders (IG gradient pink-orange / TikTok black).
- [ ] Current avg engagement renders large with `tabular-nums`.
- [ ] Delta chip shows formatted `deltaPercent` with appropriate emerald/rose tone.
- [ ] Sparkline draws a smooth line using the platform's primary color, with an endpoint dot.
- [ ] Day labels (Mon, Tue, etc.) align under each data point; first label is `text-anchor: start`, last is `text-anchor: end`.

## Heatmap Tests

- [ ] 7 rows × 24 columns = 168 cells.
- [ ] Each cell's background opacity = `0.08 + ((value - min) / (max - min)) * 0.85`.
- [ ] Hour ticks render at hours 0, 6, 12, 18 (every 6 hours); other slots render a dim `·`.
- [ ] Weekday labels (Mon…Sun) render to the left of each row with mono uppercase.
- [ ] Legend at the bottom-left renders 7 graduated swatches from `rgba(124,58,237,0.08)` to `rgba(124,58,237,0.93)`.
- [ ] Horizontal scroll enabled below `md`: parent has `overflow-x-auto`, inner content has `min-w-[640px]`.

---

## Empty States

- [ ] If `trendingPosts: []`, the section renders the header only (empty body).
- [ ] If `trendingHashtags: []`, the tag cloud column is empty; the ranked list shows nothing.
- [ ] If `heatmap.cells: []`, all cells are missing — the grid just renders empty rows.

---

## Edge Cases

- [ ] A hashtag with `weight: 0` renders at the smallest font size (11px) and the lowest font weight (500).
- [ ] A `growthPercent` of exactly 0 still renders as "rising" (positive branch).
- [ ] Heatmap `min === max` (all cells equal): opacity falls back to a non-NaN value via the `Math.max(0.01, ...)` guard.

---

## Accessibility

- [ ] Each heatmap cell has an `aria-label` with weekday, hour-formatted-time, and value (e.g., "Thursday 7 PM — 9.40% engagement").
- [ ] The TrendingView root header uses semantic `<h1>` for "What's trending".
- [ ] Live indicator on the activity-like "Live signal · last hour" header has `aria-hidden` on the ping animation.

---

## Sample Test Data

Reference `sample-data.json`. The heatmap is shaped with high values in evenings (18–22h) and weekends (days 5–6 = Sat/Sun) — verify your engagement formulas match this pattern in production.
