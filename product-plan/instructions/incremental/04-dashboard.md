# Milestone 4: Dashboard

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles — needed for data)

---

## About This Handoff

Ready-to-integrate components, types, sample data, and tests. Wire the four stat aggregations, top-posts ranking, and live activity feed to your backend.

---

## Goal

The analyst's home page. Surface headline stats, top-performing posts for the selected window, and a live-updating activity feed.

## Overview

Four glass stat cards with period-over-period deltas, six top-post cards across all tracked profiles, and an activity sidebar streaming new posts / follower spikes / trending hashtags / scrape events. A time-range selector (24h / 7d / 30d) re-scopes every metric on the page.

**Key Functionality:**
- Time-range scoping (24h / 7d / 30d)
- Four headline stats with delta chips
- Six top-performing posts (sorted by engagement rate)
- Live activity feed (Supabase Realtime / your websocket)
- Hover-reveal post metrics; click to open the Posts detail modal
- Click an activity event to navigate to the profile

## Components Provided

Copy from `product-plan/sections/dashboard/components/`:

- `DashboardView` — orchestrator
- `StatCard` — tone-mapped stat tile
- `TopPostCard` — 4:5 post card with hover overlay
- `ActivityFeed` — sticky sidebar
- `TimeRangeSelector` — segmented switch

## Props Reference

```ts
interface DashboardProps {
  currentUser: DashboardUser
  timeRange: TimeRange
  timeRangeOptions: TimeRangeOption[]
  stats: DashboardStat[]
  topPosts: TopPost[]
  activity: ActivityEvent[]
  // callbacks
}
```

Backend aggregation expectations:

| Field | Computation |
|-------|-------------|
| `stats[0]` Tracked profiles | `count(tracked_accounts where user_id = ? and is_active = true)` |
| `stats[1]` Posts scraped | `count(posts where tracked_account in user's accounts and scraped_at within window)` |
| `stats[2]` Avg engagement | `avg(post.engagement_rate)` across user's posts in window |
| `stats[3]` Trending hashtags | `count(distinct hashtag where growth_percent > threshold)` |
| `delta.value` | Diff vs previous comparable window (e.g. previous 7d) |
| `topPosts` | Top 6 by `engagement_rate desc` across user's posts in window |

## Expected User Flows

### Flow 1: Switch time range
- User clicks 24h / 7d / 30d → `onTimeRangeChange(range)` fires
- **You:** re-fetch stats, topPosts, activity scoped to the new window

### Flow 2: Open a top post
- User hovers a card → CSS overlay reveals all metrics
- User clicks → `onPostClick(post)` fires
- **You:** open the Posts section's detail modal (Milestone 6) — easiest is route to `/posts?postId=...` and have the Posts view auto-open the modal

### Flow 3: Click an activity event
- Event tied to a profile → user clicks "Open profile"
- `onActivityProfileClick(event)` fires with the full event
- **You:** `router.push(\`/profile/${event.platform}/${event.profileUsername}\`)`

### Flow 4: New event arrives
- Supabase Realtime push → host appends to `activity` prepended
- New row animates in via the `act-rise` keyframe (already baked in)

## Testing

See `product-plan/sections/dashboard/tests.md`.

## Done When

- [ ] All four stat cards reflect real aggregations with correct deltas
- [ ] Time-range selector re-fetches and updates the page
- [ ] Top posts route opens the post detail when clicked
- [ ] Activity feed streams new events in real-time
- [ ] Sticky sidebar stays visible while the main column scrolls
