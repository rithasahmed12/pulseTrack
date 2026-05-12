# Dashboard

## Overview

The analyst's home screen. Four headline stats with period-over-period deltas, the six top-performing posts across all tracked profiles for the current time window, and a live-updating activity feed of new posts, follower spikes, trending hashtags, and scrape events. A time-range selector (24h / 7d / 30d) re-scopes every metric on the page.

## User Flows

- Analyst lands on `/dashboard` → sees greeting, four stat cards with deltas, six top-post cards, and the live activity sidebar.
- Toggle the time range (24h / 7d / 30d) → every metric on the page re-scopes.
- Hover a top-post card → metrics overlay slides up (likes / comments / shares / saves / views / engagement / caption).
- Click a top-post card → opens the post detail (handled by the Posts section's detail modal).
- Click an activity event with a profile reference → navigate to that profile's detail page.
- New activity events animate in at the top of the feed (via Supabase Realtime, or your own websocket).

## Design Decisions

- **Two-column layout below the stats:** top posts on the left (2/3), activity feed on the right (1/3) — sticky on desktop, stacks on tablet.
- **Per-tone stat cards:** four tones (violet / cyan / amber / rose) keyed by `tone` field. The card's corner bloom is colored to match.
- **Unique synthetic thumbnails per post** — each `TopPost` carries a `thumbnailHue: number` that the component converts to a gradient, so the row feels editorial rather than templated. Replace with real `thumbnailUrl` when your scraper persists CDN URLs.

## Data Shapes

**Entities:** `DashboardUser`, `TimeRange`, `TimeRangeOption`, `DashboardStat`, `TopPost`, `ActivityEvent`.

**From global entities:** `Post` (specialized as `TopPost` for the dashboard's needs — fewer fields, plus `thumbnailHue`), `ActivityEvent`, `Profile` (just for the greeting).

## Components Provided

- **`DashboardView`** — Orchestrator: header with greeting + time-range selector → stat row → 2-column body.
- **`StatCard`** — Tone-mapped icon tile, label, large tabular value, delta chip (emerald up / rose down / slate flat), corner color bloom.
- **`TopPostCard`** — 4:5 aspect with synthetic thumbnail, platform + post-type chips, engagement chip, rank pill, username pill, hover-revealed full metrics grid.
- **`ActivityFeed`** — Sticky sidebar with colored event dots on a rail, type chips per event, platform pills, relative timestamps, "Live" pulse indicator, fade gradient at bottom.
- **`TimeRangeSelector`** — Segmented `24h / 7d / 30d` switch.

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onTimeRangeChange(range)` | User toggles 24h / 7d / 30d |
| `onViewAllPostsClick()` | User clicks "View all" on the top-posts header — route to `/posts` |
| `onPostClick(post)` | User clicks a top-post card — open the Posts detail modal |
| `onActivityProfileClick(event)` | User clicks "Open profile" on an event tied to a profile |
| `onViewAllActivityClick()` | User clicks "View all" on the activity feed header |

## Visual Reference

The greeting heading colors the user's first name with a violet-to-cyan gradient — the only place chromatic emphasis appears in the heading hierarchy. Activity feed events animate in with a staggered slide-up via CSS keyframes.
