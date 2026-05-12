# Tracked Profiles

## Overview

The workspace for managing every Instagram and TikTok account an analyst is monitoring. A responsive grid of profile cards surfaces up-to-the-minute stats, scrape status, and quick actions. Paired with a smart "Add Profile" flow that accepts either a pasted URL (auto-detects platform) or a manual platform + username pick.

## User Flows

- **Add a profile:** click "Add Profile" → modal opens → paste an IG/TikTok URL OR type a username + pick platform → submit → card appears with "New" badge and initial scrape queues.
- **Filter the grid:** filter by platform (All / Instagram / TikTok), sort by recently-added / most-followers / highest-engagement / last-scraped, or search by display name or @username.
- **Navigate to profile detail:** click anywhere on a card body → routes to `/profile/:platform/:username`.
- **Per-card actions:** Scrape now (refresh icon), Pause / Resume monitoring (pause/play icon), Remove (trash icon with confirm popover).
- **Failed scrape recovery:** card shows error chip + one-click Retry.
- **Empty state:** if no profiles tracked yet, an illustrated empty state appears with "Add your first profile" CTA.

## Design Decisions

- **Uniform card grid** (auto-fill, minmax 260px) — not masonry. Predictable rhythm across breakpoints.
- **Confirm popovers, not modals** for destructive actions — keeps the user in context.
- **Card body click target** for navigation, with action icons stopping propagation. Lets you click anywhere without bullseye-precision.
- **Live state visualization:** card border tints amber when paused, rose when failed, default slate otherwise. Avatar gets a subtle violet ring-pulse while scraping.

## Data Shapes

**Entities:** `TrackedProfile` (the global `TrackedAccount` entity), `FilterControls`, `AddProfileModalState`.

**From global entities:** uses `TrackedAccount` (renamed to `TrackedProfile` in this section's contract to match the section name).

## Components Provided

- **`TrackedProfilesView`** — Orchestrator: header + filter logic + card grid + modal + empty states. Computes filtered/sorted view from `trackedProfiles` + `filterControls` via `useMemo`.
- **`HeaderControls`** — Sticky strip with title + count, search input, platform filter pills, sort dropdown (custom), Add Profile button.
- **`ProfileCard`** — Per-profile card: avatar with platform badge, identity row + "New" badge, 3-stat row, engagement chip, status line, action cluster with inline confirm popover.
- **`AddProfileModal`** — Glass-overlay modal with smart URL/username input, live resolution hint, platform toggle cards (auto-locked when URL detected), submit/cancel.
- **`EmptyState`** — Two variants: `no-profiles` (animated radar SVG illustration) and `no-results` (no-matches state).

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onAddProfileClick()` | User clicks "Add Profile" button |
| `onModalInputChange(value)` | User types in the smart input — implementer should run URL detection here |
| `onModalPlatformChange(platform)` | User clicks a platform toggle card (only active for plain-text input) |
| `onAddProfileSubmit({ platform, username })` | Modal submitted with a resolved platform + username |
| `onAddProfileCancel()` | Modal cancelled or backdrop clicked |
| `onFilterChange(filter)` | Platform filter pill clicked |
| `onSortChange(sort)` | Sort dropdown selection changed |
| `onSearchChange(query)` | Search input changed |
| `onProfileClick(profile)` | Card body clicked — navigate to `/profile/:platform/:username` |
| `onScrapeNow(profileId)` | Manual scrape action on a card |
| `onTogglePaused(profileId, nextIsActive)` | Pause/Resume action on a card |
| `onRemoveProfile(profileId)` | Trash action (after the inline confirm popover) |
| `onRetryScrape(profileId)` | Retry button on a failed card |

## Visual Reference

Hover lifts cards 0.5px and tints the border to violet/40. A top hairline gradient (violet → cyan) flashes on hover. Failed cards keep a rose-tinted border; paused cards keep an amber-tinted border at low opacity.
