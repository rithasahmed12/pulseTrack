# Trending

## Overview

The "what's moving right now" surface — four stacked sections that surface velocity-ranked posts (last 24h), growing hashtags, side-by-side platform engagement, and a best-posting-time heatmap. Every element answers the question "where should I look right now?"

## User Flows

- Land on `/trending` → 4 sections render: Trending Posts (10 ranked rows, #1 crowned), Trending Hashtags (cloud + ranked list), Platform Comparison (two sparkline cards), Best Posting Times heatmap (7×24).
- Hover a trending post row → row lifts subtly.
- Click a trending post → opens the Posts detail modal (via callback).
- Click a hashtag (cloud chip or list row) → route to Posts pre-filtered to that tag.
- Hover a hashtag in either column → it raises and the matching row in the other column highlights (shared hover state).
- Hover a heatmap cell → tooltip with weekday + hour + value.

## Design Decisions

- **No window selector** — Trending is always last-24h scoped (intentional design choice). The other sections handle longer windows.
- **Velocity chip glow scales with the value** — `+312% / 24h` literally glows more than `+28% / 24h`. The intensity = `min(abs(percent), 300) / 300`, applied to the chip's box-shadow.
- **Tag cloud uses three signals at once** — font-size (usage), color (rising vs falling), font-weight (weight as a backup intensity cue). The ranked list mirrors with growth bars and chips.
- **Cross-column hover sync** in the hashtag block — hovering a cloud tag highlights its row, and vice versa. Lets you connect the visual weight to the numbers quickly.
- **Heatmap uses opacity, not color stops** — single violet accent at `rgba(124,58,237, opacity)` where opacity = normalized engagement value. Keeps the palette quiet and the data legible.
- **Peak slot called out in the heatmap header** — analyst gets the answer before they ever hover.

## Data Shapes

**Entities:** `TrendingPost`, `TrendingHashtag` (with `weight: 0-1` for cloud scaling), `PlatformSeries` (with `series: PlatformSeriesPoint[]`), `HeatmapCell`, `Heatmap`.

**From global entities:** `Post` (specialized as `TrendingPost`), `Hashtag` (specialized as `TrendingHashtag` with the addition of `weight` and `growthPercent`).

## Components Provided

- **`TrendingView`** — Orchestrator: gradient "trending" header → 4 stacked sections.
- **`TrendingPostRow`** — Ranked horizontal row: mono-tabular rank (or Crown badge for #1), 60px thumbnail, identity, caption snippet, velocity chip (intensity-scaled glow), engagement chip.
- **`HashtagBlock`** — Two-column inside one card: weighted tag cloud (left), ranked list with growth bars (right), with shared hover state.
- **`PlatformCompareCards`** — Two cards side-by-side: large platform-color icon tile, big avg engagement value, delta chip, gradient sparkline with endpoint glow dot.
- **`PostingTimeHeatmap`** — 7-day × 24-hour grid, opacity-scaled violet cells, hour ticks every 6 hours, weekday labels, peak slot in header, gradient legend, live hover tooltip.

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onPostClick(post)` | Trending post row clicked — open the Posts detail modal |
| `onHashtagClick(tag)` | Hashtag clicked in either column — route to Posts filtered by tag |
| `onHeatmapCellClick(cell)` | Heatmap cell clicked — could deep-link to a "schedule a post" panel |

## Visual Reference

The #1 trending post row gets a soft amber glow + amber-violet hairline gradient on top + a Crown icon. Trending hashtags falling in usage tint rose; rising ones tint violet. Heatmap legend at the bottom shows a 7-step gradient from low to high opacity.
