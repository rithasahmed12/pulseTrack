# Test Specs: Posts

These specs are **framework-agnostic**. Adapt to your testing setup.

## Overview

The unified feed with tabs, filter bar, infinite scroll, and a detail modal containing a 7-day engagement mini-chart.

---

## User Flow Tests

### Flow 1: Filter by post type

1. Render `PostsView` with all defaults.
2. User clicks the "Videos" tab → `onPostTypeChange('video')` fires.
3. Host re-renders with `filterControls.postType: 'video'`.

**Expected:**
- [ ] Only posts where `postType === 'video'` render.
- [ ] The count updates to show "X / 32" (filtered / total).
- [ ] "Reset filters" link becomes visible.

### Flow 2: Engagement floor slider

1. User drags the slider thumb to 7.0%.
2. Each step fires `onMinEngagementChange(value)` with the new number.

**Expected:**
- [ ] Slider track fills proportionally (`linear-gradient` with violet fill).
- [ ] Live readout shows the current value with one decimal.
- [ ] Grid trims to posts with `engagementRate >= 7.0`.

### Flow 3: Reset filters

1. User has set `postType: 'reel'`, `platform: 'instagram'`, `minEngagement: 5`.
2. User clicks "Reset filters".

**Expected:**
- [ ] `onResetFilters()` fires.
- [ ] Host resets to defaults; the link disappears.

### Flow 4: Infinite scroll

**Setup:** `pagination.hasMore === true`, `IntersectionObserver` mocked.

1. The sentinel `<div>` enters the viewport.
2. `onLoadMore()` fires.

**Expected:**
- [ ] `IntersectionObserver` is constructed with `rootMargin: '200px'`.
- [ ] Spinner + "Loading more posts…" renders below the grid while `hasMore` is true.

**End of pagination:**
- [ ] When `pagination.hasMore === false`, the sentinel area renders "· all caught up ·" instead.

### Flow 5: Open post detail modal

1. User clicks a card.
2. `onPostClick(post)` fires.

**Expected:**
- [ ] Modal renders with `role="dialog"` and `aria-modal="true"`.
- [ ] Body has `overflow: hidden` while open.
- [ ] Pressing Escape closes the modal (re-renders with `post: null` from the host).
- [ ] Clicking the backdrop calls `onClose`.

### Flow 6: Hashtag click

In the open detail modal:
1. User clicks a hashtag chip (e.g., `#linenseason`).
2. `onHashtagClick('#linenseason')` fires.

**Expected:**
- [ ] Chip renders with violet ring + violet text.
- [ ] Click does not bubble up to the backdrop (modal stays open until host closes it via callback).

---

## Card Tests

- [ ] Each card renders a synthetic hue-based gradient thumbnail.
- [ ] Platform badge top-left + post-type badge stacked next to it.
- [ ] Engagement chip top-right with `tabular-nums` percent.
- [ ] Username pill always visible at bottom-right (never hover-only).
- [ ] Hover overlay shows up to 6 metrics with N/A handling: posts with `views: 0` skip the Views row; posts with `shares: 0` skip Shares.

---

## Modal Tests

- [ ] Header shows platform badge + post-type chip + handle + display name + long-form posted-at.
- [ ] Caption renders as plain text.
- [ ] Hashtag chips render below caption (clickable).
- [ ] **Metric grid is 6 tiles, always** — N/A values render `—` with dimmed opacity (40%) rather than being hidden.
- [ ] MiniLineChart day ticks render `d1` through `d7`.
- [ ] Peak day callout in chart header shows `peak {N}d` where N is the day index with the maximum engagement value.
- [ ] "Open on Instagram" / "Open on TikTok" link points to the correct URL (`https://instagram.com/{username}` or `https://tiktok.com/@{username}`).

---

## Empty States

- [ ] When `applyFilters()` returns an empty array, the "No posts match these filters" empty state renders.
- [ ] Clicking "Reset filters" in the empty state fires `onResetFilters()`.

---

## Edge Cases

- [ ] Filter `dateRange: '24h'` with `postedAt` older than 24h: post is excluded.
- [ ] Filter `minEngagement: 0`: every post is included (no filtering on engagement).
- [ ] A post with `hashtags: []` renders no chips in the modal (the `flex-wrap` block is omitted).
- [ ] Card grid uses `auto-fill, minmax(220px, 1fr)` — 1 column at 240px viewport, ~5 columns at 1280px.

---

## Accessibility

- [ ] Each card is `role="button"` with `tabIndex={0}` and `aria-label` mentioning the username.
- [ ] Pressing Enter/Space on a focused card opens the modal.
- [ ] The modal close button has `aria-label="Close"`.
- [ ] Escape closes the modal regardless of focus location.

---

## Sample Test Data

Reference `sample-data.json` — 32 posts across IG/TikTok with mixed post types. Each post has an `engagementOverTime` array of 7 daily points for the mini-chart.
