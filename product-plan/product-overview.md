# PulseTrack — Product Overview

## Summary

PulseTrack is a unified social media intelligence platform for trend researchers and analysts who need to monitor competitor and creator activity across Instagram and TikTok in one place. It pairs deep per-profile analytics with cross-platform tracking so analysts can spot what's moving, why, and on which surface — without juggling separate dashboards.

## Problems Solved

- **Cross-platform fragmentation:** Analysts no longer need to toggle between separate IG and TikTok dashboards. PulseTrack normalizes data from both into a single feed, single profile view, and single trending surface.
- **Shallow profile insight:** Most scrapers stop at follower counts and recent posts. PulseTrack delivers per-profile engagement trends, follower-growth curves, post-type breakdowns, top-post highlights, and best-posting-time heatmaps.
- **Lagging trend detection:** PulseTrack ranks posts by 24-hour velocity, surfaces hashtags by recent growth percent, and streams a live activity feed of follower spikes and new posts.
- **API gating costs:** Apify-powered scraping (Instagram + TikTok actors) makes any public profile observable, with automatic re-scraping every 6 hours.
- **Manual reporting pain:** Tracked profiles, persisted history (follower snapshots, post engagement, hashtag growth), and CSV export reduce the weekly-report burden.

## Planned Sections

1. **Authentication** — Split-layout login + signup outside the app shell. Email + password + social providers (Google, Apple) with inline validation and password-strength meter.
2. **Tracked Profiles** — Grid view of every IG/TikTok account the analyst monitors. Smart add-flow accepts URL paste or manual entry. Per-card states (idle / scraping / failed / paused / new), filter / sort / search controls.
3. **Dashboard** — Headline stats with deltas, top-performing posts grid, live activity feed (Supabase Realtime). Time-range selector (24h / 7d / 30d).
4. **Profile Detail** — The hero analytics surface for a single profile. Restrained identity hero, 30-day engagement + follower charts (inline SVG), post-type donut, recent posts grid, top-post highlight, quick stats.
5. **Posts** — Unified filterable feed of every scraped post. Tabs by type, filter bar (platform / date range / min engagement), infinite scroll, hover-reveal metrics on cards, full-detail modal with caption + hashtag chips + 7-day mini-chart.
6. **Trending** — "What's moving right now" surface. Top 10 velocity-ranked posts (#1 crowned), weighted hashtag cloud + ranked list (cross-column hover sync), platform-comparison sparkline cards, 7×24 best-posting-time heatmap.
7. **App Profile** — Analyst's own account view: identity editing, workspace stats, connected creator accounts (UI-only OAuth in v0.1).
8. **Settings** — Four-pane preferences: Security (password + 2FA), Notifications (4 event toggles), Appearance (accent picker + sidebar default), Data & Privacy (CSV export, cache clear, typed-DELETE account deletion).

## Product Entities

- **Profile** — The PulseTrack user / analyst. Holds display name, avatar, theme/accent preferences, notification settings.
- **TrackedAccount** — A public Instagram or TikTok profile the analyst monitors. Has many Posts, FollowerSnapshots, ActivityEvents, ScrapeJobs.
- **Post** — A scraped post tied to a TrackedAccount. Normalized metrics across IG/TikTok; references many Hashtags.
- **Hashtag** — Observed tags with usage count + growth tracking.
- **ActivityEvent** — Timeline events (new post, follower spike, trending hashtag, scrape complete/failed). Belongs to Profile, optionally to TrackedAccount.
- **FollowerSnapshot** — Historical point-in-time follower count per TrackedAccount.
- **ScrapeJob** — Queued or completed Apify scrape run.

See `data-shapes/overview.ts` for the full TypeScript contract.

## Design System

**Colors:**
- Primary: `violet` (violet-600 #7C3AED)
- Secondary: `cyan` (cyan-500 #06B6D4)
- Neutral: `slate` (text + borders)
- Functional accents (used sparingly): rose (destructive), amber (paused / top post), emerald (positive delta / connected)

**Typography:**
- Heading: Inter (600 / 700)
- Body: Inter (400 / 500)
- Mono: JetBrains Mono (eyebrows, tabular numbers, kbd shortcuts)

**Aesthetic direction:** Quiet operations console. Dark-only canvas (#0A0A0F), glass surfaces (`backdrop-blur-xl` over translucent panels), single-accent emphasis (violet) with chromatic accents earned by data. Tabular numerals everywhere, mono used only as a typographic eyebrow.

## Implementation Sequence

Build PulseTrack in nine milestones:

1. **Shell** — Design tokens, fonts, and the persistent navigation chrome
2. **Authentication** — Login + signup screens outside the shell
3. **Tracked Profiles** — Unblocks every downstream section
4. **Dashboard** — At-a-glance home page
5. **Profile Detail** — Hero analytics view
6. **Posts** — Unified feed + detail modal
7. **Trending** — Velocity, hashtags, comparison, heatmap
8. **App Profile** — User's own account
9. **Settings** — Workspace preferences

Each milestone has a dedicated instruction document in `product-plan/instructions/incremental/`. The combined `product-plan/instructions/one-shot-instructions.md` is suitable for a full one-session build.
