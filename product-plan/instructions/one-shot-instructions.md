# PulseTrack — Complete Implementation Instructions

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Testing

Each section includes a `tests.md` file with UI behavior test specs. These are **framework-agnostic** — adapt them to your testing setup.

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

---

# Product Overview

## Description
PulseTrack is a unified social media intelligence platform for trend researchers and analysts who need to monitor competitor and creator activity across Instagram and TikTok in one place. It pairs deep per-profile analytics with cross-platform tracking so analysts can spot what's moving, why, and on which surface — without juggling separate dashboards.

## Problems & Solutions

### Problem 1: Instagram and TikTok live in separate dashboards
Trend researchers waste hours toggling between two analytics environments with different metrics, vocabularies, and refresh cadences. PulseTrack normalizes data from both platforms into a single feed, single profile view, and single trending surface — so comparing a Reel to a TikTok is one glance, not two tabs.

### Problem 2: Profile-level insight is shallow in existing tools
Most scrapers stop at follower counts and a list of recent posts. PulseTrack delivers deep per-profile analytics — engagement-rate trend lines, follower growth curves, post-type breakdowns, best-performing post highlights, and posting-time heatmaps — so analysts can build a real narrative about how a creator or brand operates.

### Problem 3: Trend detection lags behind reality
By the time something shows up in a weekly report, it's already saturated. PulseTrack ranks posts by 24-hour velocity, surfaces hashtags by recent growth percentage, and streams a live activity feed of follower spikes and new posts, so researchers catch shifts while they're still actionable.

### Problem 4: Official APIs are gated, expensive, and incomplete
Researchers without ad-budget access or enterprise API contracts can't track competitor accounts they don't own. PulseTrack uses Apify-powered scraping (Instagram + TikTok actors) to make any public profile observable, with automatic re-scraping on a 6-hour cadence.

### Problem 5: Manual reporting is repetitive and disconnected
Analysts copy numbers into spreadsheets, screenshot charts, and reassemble narratives every week. PulseTrack centralizes tracked profiles, persists historical snapshots (follower counts, post engagement, hashtag growth), and exposes them through ready-to-share views, with CSV export when a deliverable demands it.

## Key Features
- Cross-platform tracking — add any Instagram or TikTok public profile and PulseTrack normalizes posts, metrics, and hashtags into a shared schema
- Per-profile deep analytics — engagement trends, follower growth, post-type donut, top-post highlight, and platform-specific metrics (Reel plays, TikTok views, etc.)
- Unified posts view — masonry feed across all tracked profiles with platform/type filters, engagement floor slider, and hover-reveal insights
- Trending detection — top 10 posts by 24-hour velocity, ranked hashtag list with growth percentages, platform-comparison charts, and a best-posting-time heatmap
- Live activity feed — real-time stream of new posts, follower spikes, and trending hashtag detections via Supabase Realtime
- Scheduled scraping — Apify-backed scrape jobs run every 6 hours per tracked account with retry and snapshot history
- Editorial dark UI — glass-morphism cards, accent glow, and theme/accent customization built for long analyst sessions


---

# Milestone 1: Shell

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None


## Goal

Set up the design tokens and application shell — the persistent chrome that wraps every section.

## What to Implement

### 1. Design Tokens

Configure your styling system with the PulseTrack tokens:

- **CSS variables:** see `product-plan/design-system/tokens.css`. Drop it into your global stylesheet and reference variables from your CSS or Tailwind config.
- **Tailwind:** see `product-plan/design-system/tailwind-colors.md`. Primary `violet`, secondary `cyan`, neutral `slate`. Surface colors are arbitrary values (`bg-[#0F0F18]`) so no config extension is required.
- **Fonts:** see `product-plan/design-system/fonts.md`. Inter (heading + body) + JetBrains Mono (mono eyebrows). Drop the `<link>` into your `<head>` or import via CSS.

### 2. Application Shell

Copy the components from `product-plan/shell/components/` into your project:

- `AppShell.tsx` — the main wrapper. Accepts `children`, `navigationItems`, `user`, `pageTitle`, `notificationCount`, and callbacks.
- `MainNav.tsx` — sidebar body (brand, search affordance, primary + secondary nav).
- `UserMenu.tsx` — avatar + dropdown (used in both sidebar footer and header).
- `index.ts` — barrel exports.

**Wire up navigation** to your router. The PulseTrack default nav structure:

| Label | Route | Notes |
|-------|-------|-------|
| Dashboard | `/dashboard` | Primary |
| Posts | `/posts` | Primary |
| Trending | `/trending` | Primary |
| Tracked | `/tracked` | Primary |
| (divider) | — | — |
| App Profile | `/profile` | Account |
| Settings | `/settings` | Account |

The shell uses `onNavigate(href)` callbacks for all nav links; wire those to `router.push(href)` (or your equivalent).

**User menu** expects:
- `user.name` (required), `user.handle` (optional), `user.avatarUrl` (optional — falls back to initials)
- `onLogout()` callback

### 3. Auth Layout (Outside Shell)

The Authentication section (next milestone) sits **outside** this shell. Set up routing so:
- `/login` and `/signup` render the auth screens at full viewport (no `AppShell` wrapper).
- All other routes render inside `AppShell` with the matching nav item marked active.

## Files to Reference

- `product-plan/design-system/` — All design tokens
- `product-plan/shell/README.md` — Shell intent and responsive behavior
- `product-plan/shell/components/` — React components

## Done When

- [ ] Inter + JetBrains Mono are loaded
- [ ] `tokens.css` variables are accessible globally
- [ ] `AppShell` renders with nav, header, and content area
- [ ] Nav links route to the correct paths
- [ ] Active nav item is highlighted based on the current route
- [ ] User menu shows the signed-in user and triggers logout on click
- [ ] Sidebar collapses to icon-only on tablets and to a drawer on mobile
- [ ] `/login` and `/signup` routes render WITHOUT the shell

---

# Milestone 2: Authentication

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) — for design tokens. Auth screens render OUTSIDE the shell.


## Goal

Implement the login + signup flow. Users sign in or create an account from a split-layout screen, then route to `/dashboard`.

## Overview

PulseTrack uses a restrained editorial split layout. The left panel carries the brand (wordmark + pull-quote + minimal stat strip). The right panel carries the form — email + password + social providers (Google, Apple), with inline validation and a password-strength meter on signup.

**Key Functionality:**
- Sign in with email + password (with "Remember me")
- Create an account with name + email + password + Terms acceptance
- Social authentication (Google, Apple) — wire to your OAuth provider
- Inline validation (required, valid email, ≥8 char password, password match)
- Show/hide password toggle
- Password strength meter (length / uppercase / digit / symbol)
- Switch between Login and Signup via a footer link
- Forgot password (route to a recovery flow — not implemented in v0.1)

## Components Provided

Copy from `product-plan/sections/authentication/components/`:

- `AuthLayout.tsx` — Full-viewport split wrapper; injects Inter + JetBrains Mono.
- `AuthBranding.tsx` — Left brand panel.
- `LoginForm.tsx` — Login form with show/hide, remember-me, social, footer link.
- `SignupForm.tsx` — Signup form with strength meter, T&C checkbox.
- `SocialAuthButtons.tsx` — Google + Apple buttons.

## Props Reference

The `LoginForm` props (full def in `types.ts`):

```ts
interface LoginFormProps {
  copy: AuthFormCopy
  providers: SocialProvider[]
  initialValues?: Partial<LoginFormValues>
  onSubmit?: (values: LoginFormValues) => void | Promise<void>
  onForgotPassword?: () => void
  onSwitchToSignup?: () => void
  onProviderClick?: (id: SocialProviderId) => void
}
```

| Callback | Triggered When |
|----------|---------------|
| `onSubmit(values)` | Valid form submitted — call your auth provider |
| `onSwitchToSignup` / `onSwitchToLogin` | Footer mode-toggle link clicked |
| `onForgotPassword()` | Recovery link clicked |
| `onProviderClick(id)` | Google / Apple button clicked — start OAuth handshake |

## Expected User Flows

### Flow 1: Sign in
1. User lands on `/login` → sees split layout with "Welcome back" copy
2. Enters email + password, optionally toggles "Keep me signed in"
3. Clicks "Sign in" → `onSubmit` fires with form values
4. **You:** authenticate via your provider; on success, route to `/dashboard`; on failure, surface an error (use the field error pattern or a toast)

### Flow 2: Create account
1. User clicks "Create one" from login → routes to `/signup` (or in-place mode swap in this preview)
2. Fills name + email + password + confirm + T&C
3. Strength meter live-updates as they type the password
4. Clicks "Create account" → `onSubmit` fires
5. **You:** create the account, sign them in, route to `/dashboard` (or `/tracked` for first-run onboarding)

### Flow 3: Social auth
1. User clicks Google or Apple button → `onProviderClick(id)` fires
2. **You:** redirect to the OAuth consent screen, then resume the session

## Empty / Error States

- Validation errors render inline below the offending field (already styled).
- During submit, the CTA button shows a spinner and form is disabled (already wired via internal `submitting` state).
- If your auth provider returns an error, you can surface it by passing an error message via the parent component (a future iteration) or by adding a toast at the layout level.

## Testing

See `product-plan/sections/authentication/tests.md`.

## Files to Reference

- `product-plan/sections/authentication/README.md`
- `product-plan/sections/authentication/tests.md`
- `product-plan/sections/authentication/components/`
- `product-plan/sections/authentication/types.ts`
- `product-plan/sections/authentication/sample-data.json`

## Done When

- [ ] `/login` and `/signup` routes render at full viewport (no `AppShell`)
- [ ] Email + password sign-in routes authenticated users to `/dashboard`
- [ ] Signup creates an account and routes to `/dashboard`
- [ ] Google + Apple buttons start the OAuth handshake (or display "Coming soon" if not implemented)
- [ ] Inline validation matches the test specs
- [ ] Authenticated user visiting `/login` is redirected to `/dashboard`

---

# Milestone 3: Tracked Profiles

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 2 (Authentication)


## Goal

Let analysts add, manage, filter, and remove tracked Instagram and TikTok profiles. This section unblocks every downstream page — Dashboard / Profile Detail / Posts / Trending all depend on having tracked accounts as their input.

## Overview

A responsive card grid of profiles, each showing identity, follower / following / posts counts, current engagement rate, scrape status, and quick actions. A smart Add Profile modal accepts either a pasted IG/TikTok URL (auto-detects platform) or a manual platform + username pick. Filters (platform), sort (4 options), and search re-derive the visible grid via `useMemo`.

**Key Functionality:**
- Add a profile via URL or manual entry
- Filter by platform, sort by 4 options, search by name or @username
- Per-card actions: navigate to profile detail, scrape now, pause/resume, remove (with confirm)
- Visual states: idle / scraping / failed / paused / newly added
- Empty state for no profiles, plus a "no matches" state for filtered-empty

## Components Provided

Copy from `product-plan/sections/tracked-profiles/components/`:

- `TrackedProfilesView` — orchestrator
- `HeaderControls` — sticky filter bar
- `ProfileCard` — per-profile card
- `AddProfileModal` — smart-input add flow
- `EmptyState` — two variants

## Props Reference

```ts
interface TrackedProfilesProps {
  trackedProfiles: TrackedProfile[]
  filterControls: FilterControls
  addProfileModalState: AddProfileModalState
  currentUserId: string
  // ...callbacks (see types.ts)
}
```

Key callbacks:

| Callback | Wires To |
|----------|---------|
| `onAddProfileSubmit({platform, username})` | POST `/tracked-accounts`, queue initial scrape, append optimistically |
| `onModalInputChange(value)` | Run URL detection client-side; update `addProfileModalState.detectedPlatform` |
| `onProfileClick(profile)` | `router.push(\`/profile/${profile.platform}/${profile.username}\`)` |
| `onScrapeNow(profileId)` | POST `/tracked-accounts/:id/scrape` |
| `onTogglePaused(profileId, nextIsActive)` | PATCH `/tracked-accounts/:id` `{ is_active: nextIsActive }` |
| `onRemoveProfile(profileId)` | DELETE `/tracked-accounts/:id` (soft delete) |
| `onRetryScrape(profileId)` | Same as `onScrapeNow` |
| `onFilterChange` / `onSortChange` / `onSearchChange` | Update local UI state; the component derives the visible list |

## Expected User Flows

### Flow 1: Add a profile via URL
1. Click "Add Profile" → `onAddProfileClick`
2. Modal opens; paste `https://www.tiktok.com/@vellum.notes`
3. The smart input parses → platform locked to "tiktok", username `vellum.notes`
4. Click "Add profile" → `onAddProfileSubmit({ platform: 'tiktok', username: 'vellum.notes' })`
5. **You:** insert into DB, queue scrape job, append to the list optimistically with `scrapeStatus: 'scraping'` and `isNew: true`

### Flow 2: Filter / sort / search
1. Click Instagram platform pill → `onFilterChange('instagram')`
2. Type `melodye` in search → `onSearchChange('melodye')`
3. Pick "Highest engagement" from sort → `onSortChange('highest-engagement')`
4. **You:** the component handles filtering/sorting in memory. If you want server-side sorting, intercept these callbacks and re-fetch instead.

### Flow 3: Per-card actions
- Card body click → navigate to detail
- Scrape now icon → push to your queue, optimistically flip to `scraping`
- Pause/Resume → toggle `is_active`
- Trash → confirm popover → confirms → soft delete, remove from list

### Flow 4: Empty states
- No profiles yet: `EmptyState` variant `no-profiles` with primary CTA wired to `onAddProfileClick`
- No matches: `EmptyState` variant `no-results` with "Clear filters" wired to reset filter + search

## Backend Considerations

- **Scrape pipeline:** Use Apify (`apify/instagram-scraper`, `clockworks/tiktok-scraper`) behind a Bull/Redis queue. Re-scrape every 6 hours per `is_active` account.
- **Real-time updates:** Subscribe to Supabase Realtime on the `tracked_accounts` table to push live `scrapeStatus` changes back to the UI.
- **`isNew` flag:** Set true for 24h after add, then unset on next scrape complete.

## Testing

See `product-plan/sections/tracked-profiles/tests.md`.

## Done When

- [ ] All four user flows above work end-to-end
- [ ] Cards reflect real `scrapeStatus`, `isActive`, `isNew` from the backend
- [ ] URL parsing handles `instagram.com/`, `tiktok.com/@`, `tiktok.com/`, `vm.tiktok.com`
- [ ] Confirm popovers close on Escape / outside-click
- [ ] Empty states render when expected

---

# Milestone 4: Dashboard

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles — needed for data)


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

---

# Milestone 5: Profile Detail

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles)


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

---

# Milestone 6: Posts

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles)


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

---

# Milestone 7: Trending

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 3 (Tracked Profiles), Milestone 6 (Posts — for detail modal)


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

---

# Milestone 8: App Profile

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 2 (Authentication)


## Goal

Let analysts edit their own identity (name, bio, avatar), see workspace stats, and connect their own creator accounts on IG and TikTok.

## Overview

A focused profile page with three sections:
1. **Identity card** — Avatar (with hover Change), Display name (40 chars), Email (read-only), Bio (280 chars). Save / Discard appears only when the form is dirty.
2. **Workspace stat tiles** — Member since, Tracked profiles, Posts scraped.
3. **Connections** — IG and TikTok cards. Linked cards show handle + last-sync; unlinked show "why connect" hint + Connect CTA.

## Components Provided

Copy from `product-plan/sections/app-profile/components/`:

- `AppProfileView` — orchestrator
- `IdentityCard` — editable form with conditional Save/Discard
- `WorkspaceStatTile` — same visual language as Dashboard stats
- `ConnectionCard` — large platform cards with status chips

## Backend Wiring

| Action | API |
|--------|-----|
| Avatar upload | POST to Supabase Storage (or your CDN), get URL, PATCH `profiles.avatar_url` |
| Save name/bio | PATCH `profiles` `{ display_name, bio }` |
| Connect platform | Start OAuth flow for that platform; on callback, store the linked handle + tokens |
| Disconnect | Revoke tokens server-side, set the connection record's `isConnected: false` |
| Workspace stats | Read-only aggregations same as the Dashboard |

## Callback Wiring

| Callback | Wires To |
|----------|---------|
| `onDisplayNameChange(value)` / `onBioChange(value)` | Update local `draft` state |
| `onAvatarChange(file)` | Upload file → set `draft.avatarUrl` to the uploaded URL (or a data-URL while uploading) |
| `onSave()` | Submit the draft to your API; on success, update `user` to match |
| `onDiscard()` | Revert `draft` back to `user` values |
| `onConnectClick(platform)` | Start OAuth — redirect to provider, then back to `/profile` |
| `onDisconnectClick(platform)` | Revoke + update connection state |

The component computes `isDirty` based on draft vs user. **You** maintain both pieces of state in the host.

## Expected User Flows

### Flow 1: Edit profile
1. User changes display name
2. `onDisplayNameChange` fires → host updates `draft`
3. Host sees `draft.displayName !== user.displayName` → sets `isDirty: true`
4. User clicks Save → host calls API → on success, sets `user = { ...user, ...draft }` and `isDirty: false`

### Flow 2: Upload avatar
1. User hovers avatar → "Change" pill visible
2. Click → file picker
3. User picks an image → `onAvatarChange(file)` fires with the `File`
4. **You:** read the file (FileReader for instant preview) + upload in the background

### Flow 3: Connect TikTok
1. User clicks "Connect TikTok" → `onConnectClick('tiktok')`
2. **You:** redirect to TikTok OAuth consent
3. On callback, set the connection record to `isConnected: true` with `connectedHandle` and `lastSyncedAt`
4. Card re-renders with emerald border + status chip + Disconnect button

## Testing

See `product-plan/sections/app-profile/tests.md`.

## Done When

- [ ] Name and bio edits work with debounced or on-blur saves
- [ ] Avatar upload uses Supabase Storage (or your equivalent) and the URL is persisted
- [ ] Email field is read-only (managed by auth)
- [ ] Connect / Disconnect flows work with OAuth or display "Coming soon" if not wired
- [ ] Workspace stat tiles reflect real aggregations

---

# Milestone 9: Settings

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 2 (Authentication), Milestone 8 (App Profile)


## Goal

Workspace administration — change password, manage 2FA, toggle notifications, customize appearance (accent + sidebar default), and handle data export / account deletion.

## Overview

A left-rail tab nav switches between four panes:
1. **Security** — Password change with strength meter, 2FA toggle + setup CTA
2. **Notifications** — 4 toggle cards (new post, follower spike, trending hashtag, weekly report email)
3. **Appearance** — Accent picker (Violet / Cyan / Rose / Amber) with live preview + sidebar default toggle
4. **Data & Privacy** — Clear scrape cache, Export CSV, and a Danger Zone with typed-DELETE account deletion

## Components Provided

Copy from `product-plan/sections/settings/components/`:

- `SettingsView` — orchestrator
- `SettingsNav` — left-rail tabs (collapses to horizontal scroll on mobile)
- `SecurityPane` — password form + 2FA card
- `NotificationsPane` — 4 toggle cards
- `AppearancePane` — accent swatches + live preview + sidebar default
- `DataPane` — action cards + Danger Zone with typed-DELETE
- `Switch` — shared toggle component (used in 3 places)

## Backend Wiring

| Action | API |
|--------|-----|
| Change password | POST `/auth/change-password` `{ current, next }` |
| Toggle 2FA | POST `/auth/2fa` `{ enabled }` |
| Set up authenticator | Generate TOTP secret, show QR (out of scope here) |
| Toggle notification preference | PATCH `profiles.notifications` JSONB column |
| Set accent / sidebar default | PATCH `profiles.accent_color`, `profiles.sidebar_collapsed` |
| Clear scrape cache | POST `/admin/clear-cache` (workspace-scoped) |
| Export CSV | GET `/admin/export.csv`, stream to browser as a download |
| Delete account | DELETE `/auth/account` (requires typed DELETE confirmation client-side) |

## Callback Wiring

| Callback | Notes |
|----------|-------|
| `onTabChange(tabId)` | Update local state; optionally update URL fragment for shareability |
| `onPasswordSubmit({current, next, confirm})` | Submit to API; on success, the form clears and a "Password updated" toast fades |
| `onTwoFactorToggle(enabled)` | Optimistic update + API call |
| `onNotificationToggle(id, enabled)` | Optimistic update + API call |
| `onAccentChange(accentId)` | Update local state immediately; persist on a debounce |
| `onSidebarDefaultToggle(collapsed)` | Same — persist on toggle |
| `onClearCache()` | Confirm popover already in component; just wire to API |
| `onExportCsv()` | Trigger download — `window.location.href = '/admin/export.csv'` or use a hidden anchor |
| `onDeleteAccount()` | Only fires when the typed DELETE matches; do not show a second confirm |

## Expected User Flows

### Flow 1: Change password
- User fills current + new + confirm
- Strength meter live-updates as they type
- Submit → `onPasswordSubmit` → toast "Password updated"

### Flow 2: Toggle 2FA + set up
- Toggle on → `onTwoFactorToggle(true)` → "Set up authenticator" button enables
- Click → `onSetUp2FAClick()` → open the TOTP setup modal/route

### Flow 3: Change accent
- User clicks the Rose swatch
- `onAccentChange('rose')` fires
- Live preview chip + button repaint immediately
- **You:** apply the accent to the rest of the app (update a CSS custom property like `--accent-primary` on `:root`)

### Flow 4: Delete account
- User types DELETE in the danger-zone input
- Button activates only when the input strictly equals "DELETE"
- Click → `onDeleteAccount()` → call API → sign out + route to a goodbye page

## Testing

See `product-plan/sections/settings/tests.md`.

## Done When

- [ ] All four panes render and switch via the left-rail nav
- [ ] Password change works with the strength meter
- [ ] 2FA toggle + setup flow is wired (or "Coming soon" if not implemented)
- [ ] Notification toggles persist to the `profiles.notifications` JSONB column
- [ ] Accent picker updates the global accent (e.g., via a CSS variable)
- [ ] Danger Zone correctly enforces the typed-DELETE rule
- [ ] CSV export downloads a file
- [ ] Active tab survives a page refresh (use URL fragment or local state)

---

