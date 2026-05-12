# Milestone 3: Tracked Profiles

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 2 (Authentication)

---

## About This Handoff

**What you're receiving:** ready-to-integrate React components, types, sample data, and tests. Your job is to back this section with a real scrape pipeline (Apify + a queue), persist tracked accounts per-user, and wire the callbacks to your API.

---

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
