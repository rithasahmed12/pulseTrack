# Posts

## Overview

The unified, filterable feed of every scraped post across all tracked profiles. Post-type tabs above a filter bar (platform / date range / min engagement) feed a uniform 4:5 card grid that infinite-scrolls as the analyst pages through. Each card hover-reveals full metrics; each click opens a detail modal with the full caption, hashtag chips, all metrics, and a 7-day engagement-over-time chart.

## User Flows

- Land on `/posts` → All tab active, default filters (Both platforms, last 30 days, 0% engagement floor), first page of posts sorted by recency.
- Tab change (All / Photos / Videos / Carousels / Reels) → grid re-filters.
- Platform toggle (Both / IG / TikTok) → grid re-filters.
- Date range dropdown (24h / 7d / 30d / 90d) → grid re-scopes.
- Drag the min-engagement slider → result count updates live, grid trims.
- Scroll near the bottom → `IntersectionObserver` triggers `onLoadMore()` for pagination.
- Hover a card → metrics overlay slides up.
- Click a card → detail modal opens.
- Click a hashtag chip in the modal → fires `onHashtagClick(tag)` (route to Trending pre-filtered).
- Backdrop click or Escape closes the modal.

## Design Decisions

- **Uniform 4:5 cards** — consistent rhythm, easy to scan. Not masonry.
- **Always-visible username pill** on every card — scan a 32-card grid and instantly know who's who without hovering.
- **IntersectionObserver with `rootMargin: '200px'`** — loading kicks in before the sentinel actually hits the viewport. Smoother than a strict trigger.
- **Modal metrics dim N/A values** — IG photos don't have Views/Shares; the tile renders em-dash with slate-600 instead of being hidden, so the 6-tile grid layout stays stable across post types.
- **Custom violet slider track** — inline-style linear-gradient on the range input so the fill is themable and visually consistent with the rest of the UI.

## Data Shapes

**Entities:** `Post` (with `engagementOverTime: EngagementPoint[]`), `FilterControls`, `Pagination`, `DateRangeOption`, plus union types for `PostTypeFilter`, `PostsPlatformFilter`, `DateRange`.

**From global entities:** `Post`.

## Components Provided

- **`PostsView`** — Orchestrator: filter bar + grid + IntersectionObserver sentinel + empty state. Computes visible posts via `applyFilters()` (filters by type/platform/min engagement, scopes by date range, sorts by recency).
- **`PostCard`** — 4:5 card with synthetic-hue thumbnail, platform + type chips, engagement chip, username pill, hover-revealed 6-metric grid.
- **`FilterBar`** — Sticky strip: title + count, post-type tab pills, platform pills, date range dropdown, **min-engagement range slider** with live readout, conditional "Reset filters" link.
- **`PostDetailModal`** — Full modal: two-column on desktop. Hero thumbnail + caption + clickable hashtag chips on the left; 6-metric grid + MiniLineChart (7-day) + meta on the right.

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onPostTypeChange(type)` | Tab pill change |
| `onPlatformChange(platform)` | Platform toggle change |
| `onDateRangeChange(range)` | Date range dropdown change |
| `onMinEngagementChange(value)` | Slider value change (live, during drag) |
| `onResetFilters()` | "Reset filters" link clicked |
| `onPostClick(post)` | Card body clicked — open the detail modal |
| `onHashtagClick(tag)` | Hashtag chip clicked inside the modal — route to Trending |
| `onLoadMore()` | Sentinel reached — implementer should fetch and append the next page |

## Visual Reference

The MiniLineChart inside the modal shows day-by-day engagement over the post's first week (d1–d7) with hover guide + dot + value label. Peak day is called out in the chart header eyebrow.
