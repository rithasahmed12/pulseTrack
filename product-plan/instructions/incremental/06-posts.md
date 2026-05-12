# Milestone 6: Posts

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles)

---

## About This Handoff

Ready-to-integrate feed components with infinite scroll, filter logic, and a detail modal. Wire pagination and detail-fetching to your API.

---

## Goal

The unified, filterable feed of every scraped post across all tracked profiles, with a rich detail modal.

## Overview

A 4:5 uniform card grid with tabs (post type), filter bar (platform, date range, min engagement slider), and infinite scroll via `IntersectionObserver`. Each card hover-reveals metrics; each click opens a centered modal with the caption, hashtag chips, all metrics, and a 7-day engagement-over-time mini-chart.

**Key Functionality:**
- Post-type tabs (All / Photos / Videos / Carousels / Reels)
- Platform toggle (Both / IG / TikTok), date range dropdown (24h / 7d / 30d / 90d), min-engagement slider
- Infinite scroll with prefetch (200px ahead)
- Hover-reveal full metrics on every card
- Detail modal with caption, hashtag chips, 6-metric grid, 7-day engagement line chart
- Hashtag chips route to Trending pre-filtered

## Components Provided

Copy from `product-plan/sections/posts/components/`:

- `PostsView` — orchestrator (handles filtering, sorting, pagination sentinel)
- `PostCard` — uniform 4:5 card
- `FilterBar` — sticky filter strip with custom slider
- `PostDetailModal` — full detail with mini-chart

## Props Reference

```ts
interface PostsProps {
  posts: Post[]
  filterControls: FilterControls
  dateRangeOptions: DateRangeOption[]
  pagination: Pagination
  // callbacks
}
```

The component applies filters in-memory. If you have many thousands of posts and want server-side filtering, intercept `onPostTypeChange`, `onPlatformChange`, `onDateRangeChange`, `onMinEngagementChange` and re-fetch instead of letting the component filter locally.

## Callback Wiring

| Callback | Wires To |
|----------|---------|
| `onPostClick(post)` | Set local modal state `openPost: post` |
| `onLoadMore()` | Fetch next page from `/posts?page=...`, append to `posts`, update `pagination` |
| `onHashtagClick(tag)` | Close modal + `router.push(\`/trending?tag=${encodeURIComponent(tag)}\`)` (or `/posts?tag=...` if you prefer filtering in place) |
| `onResetFilters()` | Reset local state to defaults |

## Expected User Flows

### Flow 1: Filter and scroll
- User clicks "Videos" tab → component filters to `postType === 'video'`
- User drags min-engagement slider to 7% → grid trims further
- User scrolls near bottom → sentinel enters viewport → `onLoadMore` fires
- **You:** fetch page 2, append posts, set `hasMore: false` if exhausted

### Flow 2: Open post detail
- User clicks a card → `onPostClick(post)` fires
- **You:** open the `PostDetailModal` with the full `Post` object (already has `engagementOverTime`)
- User hovers the MiniLineChart → guide + dot + value label appear
- User clicks a hashtag chip → `onHashtagClick(tag)` fires
- Escape / backdrop click → modal closes

## Testing

See `product-plan/sections/posts/tests.md`.

## Done When

- [ ] All tabs and filters re-derive the visible feed correctly
- [ ] Min-engagement slider has a violet-filled track and tabular readout
- [ ] Infinite scroll loads the next page when sentinel enters the viewport
- [ ] "All caught up" footer renders when `pagination.hasMore` is false
- [ ] Detail modal opens, locks body scroll, closes on Escape
- [ ] MiniLineChart renders 7 day ticks and a hover tooltip
- [ ] Hashtag chips route to the correct destination
