# Profile Detail

## Overview

PulseTrack's hero analytics surface — a single-profile deep dive an analyst opens to understand momentum on one Instagram or TikTok account. Pairs a restrained identity header with a 30-day engagement chart, 30-day follower growth chart, post-type donut, recent-posts grid, a highlighted top post, and a quick-stats sidebar.

Routed by `/profile/:platform/:username`.

## User Flows

- Analyst lands on `/profile/:platform/:username` → sees identity hero with key stat row, platform-specific metrics, and "Tracking" / "Track this profile" button.
- Click "Remove from tracking" → confirm popover → confirms → soft-remove (handled by the Tracked Profiles store).
- Click "Track this profile" (when not tracked) → kicks off the add flow.
- Hover Engagement Rate chart → tooltip with date + value.
- Hover Follower Growth chart → tooltip with date + follower count.
- Hover a donut segment → segment lifts, center number updates to that type's count + percent.
- Hover a recent post → metrics overlay (same pattern as Dashboard).
- Click any recent post or the Top Post highlight → opens the Posts detail modal.

## Design Decisions

- **Restrained header** — no banner photo, no gradient hero. A platform-color accent strip at the top of the card and an 80px avatar with platform badge.
- **Hand-rolled SVG charts, zero deps** — `LineChart`, `AreaChart`, `DonutChart` are inline SVG so the export has no chart library dependency. Replace with Recharts/Visx if you prefer.
- **Top post is double-marked** — amber border + Trophy badge on its card in the grid, plus a separate full highlight card in the sidebar. Hard to miss.
- **Sidebar sticky on desktop** — the donut, top post, and quick stats panel stay visible while the analyst scrolls the charts and recent posts.

## Data Shapes

**Entities:** `DetailedProfile` (with `platformMetrics: PlatformMetrics`), `TimePoint`, `PostTypeSlice`, `ProfilePost`, `QuickStat`.

**From global entities:** `TrackedAccount` (specialized as `DetailedProfile` here with the additional platform-specific metrics block), `Post` (specialized as `ProfilePost`), `FollowerSnapshot` (mapped to `followerSeries: TimePoint[]`).

## Components Provided

- **`ProfileDetailView`** — Orchestrator: hero → 2-column body (charts + recent posts on left, donut + top post + quick stats on right).
- **`ProfileHero`** — Restrained header card: avatar, name + verified-style chip + platform pill, bio, primary stat pills (Followers / Following / Posts / Avg Engagement), platform-specific metrics row with delta chips, "Open on platform" + "Remove / Track" actions.
- **`Charts`** — Exports `LineChart`, `AreaChart`, `DonutChart`. All inline SVG with hover guides, focus dots, flip-aware tooltips, and accent-colored drop shadows.
- **`ProfilePostCard`** — 4:5 thumbnail with hover-revealed metrics; gets amber Trophy decoration when `isTopPost`.
- **`TopPostHighlight`** — Amber-bordered "🏆 Top post" card with thumbnail, caption, 4-metric strip.
- **`QuickStatsPanel`** — Iconified list of per-post averages and best posting cadence.

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onTrackProfile()` | "Track this profile" CTA (when `isTracked === false`) |
| `onRemoveTracking()` | "Remove from tracking" CTA confirmed (when `isTracked === true`) |
| `onPostClick(post)` | Any recent-posts grid card clicked |
| `onTopPostClick(post)` | Top Post highlight card clicked |
| `onPostTypeClick(type)` | Donut segment clicked — route to Posts pre-filtered to that type |

## Visual Reference

The platform-color accent strip at the top of the hero card distinguishes IG (gradient pink → orange) from TikTok (gradient cyan → violet). Charts share a coherent palette: violet (engagement), cyan (follower growth), amber (donut emphasis).
