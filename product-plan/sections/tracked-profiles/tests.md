# Test Specs: Tracked Profiles

These specs are **framework-agnostic**. Adapt to your testing setup.

## Overview

Tracked Profiles is a grid of cards for managing the IG/TikTok accounts the analyst monitors. Filters and search re-derive the visible grid. The smart Add Profile modal auto-detects platform from a pasted URL.

---

## User Flow Tests

### Flow 1: Add a profile via URL paste

**Setup:** Render `TrackedProfilesView` with the sample data. The modal is closed (`isOpen: false`).

#### Success Path

1. User clicks "Add Profile" — `onAddProfileClick()` fires.
2. Host opens the modal: re-render with `isOpen: true`.
3. User pastes `https://www.tiktok.com/@vellum.notes` into the smart input — `onModalInputChange('https://...')` fires.
4. Host re-renders with `detectedPlatform: 'tiktok'`. The hint reads "Will track @vellum.notes on TikTok · detected" and the platform toggle is locked.
5. User clicks "Add profile" → `onAddProfileSubmit({ platform: 'tiktok', username: 'vellum.notes' })` fires.

**Expected results:**
- [ ] After submit, the new profile appears at the top of the grid with `isNew: true` (shows "New" badge) and `scrapeStatus: 'scraping'`.

#### Failure Path: empty username

1. User opens modal.
2. User types nothing.
3. The "Add profile" button is disabled.

**Expected results:**
- [ ] Submit button has `disabled` attribute.
- [ ] Pressing Enter inside the input does not fire `onAddProfileSubmit`.

#### Manual entry path (no URL)

1. User types `melodye.haus` (plain username).
2. The hint shows "Will track @melodye.haus on Instagram".
3. User clicks the TikTok toggle card → `onModalPlatformChange('tiktok')` fires.
4. The hint updates to "...on TikTok".
5. User submits → `onAddProfileSubmit({ platform: 'tiktok', username: 'melodye.haus' })`.

### Flow 2: Filter by platform + search

1. User clicks the "Instagram" platform pill → `onFilterChange('instagram')` fires.
2. Host re-renders with `filterControls.platform: 'instagram'`.

**Expected results:**
- [ ] Only IG profiles render in the grid.
- [ ] The count shows "5 / 9" (filtered visible / total).

**Then:**
3. User types `melodye` in the search input → `onSearchChange('melodye')` fires.

**Expected results:**
- [ ] Only `@melodye.haus` is visible.

### Flow 3: Per-card actions

For a profile card with `scrapeStatus: 'idle'` and `isActive: true`:

- [ ] Clicking the card body fires `onProfileClick(profile)` (not blocked by action icons).
- [ ] Clicking the refresh icon fires `onScrapeNow(profile.id)` and does **not** also fire `onProfileClick`.
- [ ] Clicking pause icon fires `onTogglePaused(profile.id, false)` — passing the desired *next* `isActive`.
- [ ] Clicking the trash icon opens an inline confirm popover. Clicking "Remove" inside the popover fires `onRemoveProfile(profile.id)`. Clicking "Cancel" or Escape closes it without firing.

For a profile with `scrapeStatus: 'failed'`:

- [ ] The card shows "Failed" with an AlertTriangle icon and a "Retry" button.
- [ ] Clicking Retry fires `onRetryScrape(profile.id)`.

### Flow 4: Empty states

**No profiles tracked yet (`trackedProfiles: []`):**
- [ ] The radar empty state renders with heading "No profiles tracked yet".
- [ ] Clicking "Add your first profile" fires `onAddProfileClick()`.

**No filter matches (`trackedProfiles.length > 0` but `visible.length === 0`):**
- [ ] The "No matches" empty state renders with the user's search query in the message.
- [ ] Clicking "Clear filters" fires `onFilterChange('all')` and `onSearchChange('')`.

---

## Component Interaction Tests

- [ ] Sort dropdown shows the four options (Recently added / Most followers / Highest engagement / Last scraped) with a check next to the active one.
- [ ] Selecting a sort option closes the dropdown.
- [ ] Cards with `isActive: false` render with an amber-tinted border and a "Paused" status line.
- [ ] Cards with `scrapeStatus: 'scraping'` show a Loader2 spinner in the status line and an animated pulse ring on the avatar.

---

## Edge Cases

- [ ] Profile with empty bio renders italic "No bio" placeholder, not a blank line.
- [ ] Profile with very long bio truncates to 2 lines via `line-clamp-2`.
- [ ] Followers count formats: 24180 → "24.2K", 1428500 → "1.4M".
- [ ] Removing a card from a 9-card grid does not blank out the layout — the grid reflows immediately.
- [ ] Newly added card appears at the top regardless of `sort` value when `sort === 'recently-added'`.

---

## Sample Test Data

Reference `sample-data.json` — 9 profiles spanning every state (idle, scraping, failed, paused, new). To craft additional fixtures:

```typescript
const mockProfile = {
  id: 'tp_test_1',
  platform: 'instagram',
  username: 'test.user',
  displayName: 'Test User',
  avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=test.user',
  bio: '',
  followersCount: 12000,
  followingCount: 200,
  postsCount: 50,
  engagementRate: 4.5,
  lastScrapedAt: '2026-05-12T10:00:00Z',
  scrapeStatus: 'idle' as const,
  scrapeError: null,
  isActive: true,
  isNew: false,
  createdAt: '2026-04-01T00:00:00Z',
}
```
