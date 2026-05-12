# Milestone 7: Trending

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles), Milestone 6 (Posts — for detail modal)

---

## About This Handoff

Ready-to-integrate components for ranked posts, weighted hashtag block, platform comparison cards, and a 7×24 heatmap.

---

## Goal

The "what's moving right now" surface. Always last-24h scoped, so the analyst gets the freshest signal.

## Overview

Four stacked sections:
1. **Trending Posts** — top 10 by 24h engagement velocity (rank #1 gets a Crown + amber glow)
2. **Trending Hashtags** — weighted tag cloud + ranked list with growth chips (cross-column hover sync)
3. **Platform Comparison** — two side-by-side sparkline cards (IG vs TikTok 7-day engagement)
4. **Best Posting Times** — 7×24 heatmap with opacity-scaled cells + hover tooltip

## Components Provided

Copy from `product-plan/sections/trending/components/`:

- `TrendingView` — orchestrator
- `TrendingPostRow` — ranked row (rank pill or Crown for #1)
- `HashtagBlock` — two-column cloud + list with shared hover state
- `PlatformCompareCards` — gradient sparkline cards
- `PostingTimeHeatmap` — 7×24 grid with peak callout + legend

## Backend Aggregation Expectations

| Field | Computation |
|-------|-------------|
| `trendingPosts[*].velocityPercent` | `(engagement in last 24h - engagement in prior 24h) / prior * 100` |
| `trendingHashtags[*].growthPercent` | Same formula but for hashtag usage count |
| `trendingHashtags[*].weight` | Normalized 0–1 score from `usageCount / max(usageCount)` |
| `platformComparison[*].series` | Daily avg engagement per platform for 7 days |
| `platformComparison[*].deltaPercent` | `(currentWeek - prevWeek) / prevWeek * 100` |
| `heatmap.cells` | Avg engagement per `(day, hour)` slot — 168 cells |

## Callback Wiring

| Callback | Wires To |
|----------|---------|
| `onPostClick(post)` | Open the Posts detail modal (route to `/posts?postId=...`) |
| `onHashtagClick(tag)` | Route to `/posts?tag=${tag}` (or `/trending?tag=...` for a tag-specific drilldown) |
| `onHeatmapCellClick(cell)` | Optional: open a "schedule a post" panel for that slot |

## Expected User Flows

### Flow 1: Spot a top mover
- User lands on `/trending` → sees Crown on row #1 with amber glow + "Top mover" eyebrow
- User clicks #1 → opens detail modal

### Flow 2: Investigate a hashtag
- User scans the tag cloud, notices a large violet tag
- Hovers it → matching list row highlights (cross-column hover sync)
- Clicks → routes to Posts pre-filtered to that hashtag

### Flow 3: Pick a posting window
- User scans the heatmap → peak callout in the header says "Thu 8 PM · 9.80%"
- User hovers other cells to compare → tooltip updates live
- Clicks a cell → optionally opens a "schedule a post" UI

## Testing

See `product-plan/sections/trending/tests.md`.

## Done When

- [ ] Top 10 posts ranked by real velocity values
- [ ] #1 row renders Crown + amber glow + Top mover eyebrow
- [ ] Tag cloud font-size and color correctly map to weight and growth
- [ ] Cross-column hover sync works (cloud ↔ list)
- [ ] Sparkline endpoints have a colored glow dot
- [ ] Heatmap peak slot is correctly identified and shown in the header
- [ ] Heatmap legend gradient renders 7 graduated swatches
- [ ] All click handlers route to the correct destinations
