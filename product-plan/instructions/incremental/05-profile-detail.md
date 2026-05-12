# Milestone 5: Profile Detail

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles)

---

## About This Handoff

Ready-to-integrate components including three hand-rolled SVG charts. No external chart library dependency.

---

## Goal

A deep analytics view for a single tracked Instagram or TikTok profile, routed by `/profile/:platform/:username`.

## Overview

The hero analytics surface. Identity header with stats and platform-specific metrics, two 30-day SVG charts (engagement line + follower growth area), a post-type donut, a recent-posts grid, a highlighted top post, and a quick-stats sidebar.

**Key Functionality:**
- Identity hero with primary stats + platform-specific metrics row
- Track / Untrack action (with confirm on remove)
- 30-day engagement rate line chart with hover tooltips
- 30-day follower growth area chart
- Post-type donut with hover interactions
- 5 recent posts with hover-reveal metrics
- Top Post highlight card with 🏆 badge
- Quick stats sidebar (averages + best posting cadence)

## Components Provided

Copy from `product-plan/sections/profile-detail/components/`:

- `ProfileDetailView` — orchestrator
- `ProfileHero` — restrained identity card
- `Charts` (exports `LineChart`, `AreaChart`, `DonutChart`)
- `ProfilePostCard` — local card variant (with optional Trophy decoration)
- `TopPostHighlight` — amber-bordered top-post card
- `QuickStatsPanel` — iconified stats list

## Backend Aggregation Expectations

| Field | Source |
|-------|--------|
| `profile` | `tracked_accounts` row, joined with platform-specific metrics |
| `isTracked` | Whether this user has this profile in their workspace |
| `engagementSeries` | `posts.engagement_rate` averaged per day for the last 30 days |
| `followerSeries` | `follower_snapshots` for the account over the last 30 days |
| `postTypeBreakdown` | `posts` grouped by `post_type` with counts |
| `recentPosts` | 5 most recent posts for this profile |
| `topPost` | Highest `engagement_rate` post for this profile in the window |
| `quickStats` | Computed averages + a best-day/best-hour heuristic from `posts.posted_at` |

## Callback Wiring

| Callback | Wires To |
|----------|---------|
| `onTrackProfile()` | POST `/tracked-accounts` `{ platform, username }` |
| `onRemoveTracking()` | DELETE `/tracked-accounts/:id` (soft) |
| `onPostClick(post)` / `onTopPostClick(post)` | Route to `/posts?postId=...` (open detail modal) |
| `onPostTypeClick(type)` | Route to `/posts?postType=...` (pre-filter the feed) |

## Expected User Flows

### Flow 1: View a tracked profile
- User lands on `/profile/instagram/melodye.haus` from Tracked or any deep link
- **You:** fetch profile + series + posts + breakdown; pass to `ProfileDetailView`
- Charts render immediately; donut shows dominant type %; sidebar Top Post badged

### Flow 2: Remove from tracking
- User clicks "Remove from tracking" → confirm popover → confirms
- `onRemoveTracking()` fires
- **You:** soft-delete, route back to `/tracked`, show toast

### Flow 3: Hover charts
- Mouse over Engagement line → tooltip with date + percent
- Mouse over Follower area → tooltip with date + follower count
- Mouse over donut slice → segment lifts, center text swaps

## Testing

See `product-plan/sections/profile-detail/tests.md`.

## Done When

- [ ] Hero shows real profile data with the correct verified-style chip if applicable
- [ ] Platform-specific metrics render (Story views/Reel plays for IG, video views/duets for TikTok)
- [ ] Both charts hover-tooltip correctly
- [ ] Donut sums to 100% and reflects real post-type counts
- [ ] Top Post highlight is the actual highest-engagement post in the window
- [ ] Track/Untrack flow is reversible
