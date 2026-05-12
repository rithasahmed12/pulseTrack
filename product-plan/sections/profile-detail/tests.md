# Test Specs: Profile Detail

These specs are **framework-agnostic**. Adapt to your testing setup.

## Overview

A single-profile deep-dive page with a restrained hero, two big SVG charts, a post-type donut, recent-posts grid, top-post highlight, and a quick-stats sidebar.

---

## User Flow Tests

### Flow 1: Remove from tracking

**Setup:** Render `ProfileDetailView` with `isTracked: true`.

1. User clicks "Remove from tracking" in the hero.
2. A confirm popover appears with copy "Stop tracking @melodye.haus?"
3. User clicks "Remove".

**Expected:**
- [ ] `onRemoveTracking()` fires once.
- [ ] Popover closes.

**Cancel path:**
- [ ] Pressing Escape with the popover open closes it without firing the callback.
- [ ] Clicking outside the popover closes it without firing.

### Flow 2: Track this profile

**Setup:** Render with `isTracked: false`.

- [ ] The hero shows "Track this profile" (violet CTA) instead of Remove.
- [ ] Clicking it fires `onTrackProfile()`.

### Flow 3: Open a recent post

- [ ] Hovering any post card in the Recent Posts grid reveals the metrics overlay (CSS-driven).
- [ ] Clicking fires `onPostClick(post)` with the full `ProfilePost` object.
- [ ] The post whose `id === topPost.id` renders with amber border + Trophy "Top" badge in the bottom-left.

### Flow 4: Open the top-post highlight

- [ ] Clicking the sidebar Top Post highlight card fires `onTopPostClick(topPost)`.

### Flow 5: Click a donut slice

- [ ] Hovering a slice raises its stroke width by 3px and adds a drop shadow.
- [ ] The donut center text swaps from the dominant type's percentage to the hovered slice's count + percent.
- [ ] Clicking a slice fires `onPostTypeClick(type)`.

---

## Chart Tests

### LineChart (engagement) and AreaChart (followers)

- [ ] Mouse movement across the chart updates the hover guide + focus dot to the nearest data point's x position.
- [ ] Tooltip flips to the **left** of the cursor when within `w + 12` px of the right edge (no clipping).
- [ ] Mouse leave removes the guide and tooltip.
- [ ] Y-axis ticks render with mono font and `rgba(148,163,184,0.6)` color.

### DonutChart

- [ ] Each slice's stroke length equals its `count / total * circumference`.
- [ ] Slices are positioned cumulatively starting at 12 o'clock (`rotate(-90)`).
- [ ] Legend rows mirror the segment colors and click-fires `onSliceClick(type)`.

---

## Hero Tests

- [ ] Avatar is 80–88px depending on breakpoint, with a 6px platform badge overlay (gradient pink-orange for IG, black for TikTok).
- [ ] If `isVerified`, a violet BadgeCheck icon renders next to the name.
- [ ] Stat pills (Followers / Following / Posts / Engagement) format counts via `formatCount` (1428500 → "1.4M").
- [ ] Engagement stat uses violet-200 text via the `accent` flag.
- [ ] Platform-specific metrics row renders each row with the formatted value + a delta chip (emerald up / rose down). Rows with `deltaPercent === 0` render no chip.

---

## Empty States

- [ ] If `recentPosts: []`, the Recent posts grid section can render an empty card body (no posts) — no explicit empty state UI for this case; treat it as expected for a newly tracked profile.
- [ ] If `engagementSeries: []` or `followerSeries: []`, the chart cards still render their headers; the SVG path is empty (no error).
- [ ] If `quickStats: []`, the Quick Stats panel renders just the header.

---

## Edge Cases

- [ ] Profile with empty bio shows italic "No bio set on this profile."
- [ ] Joined-at formatting handles ISO strings; falls back to the raw string on parse failure.
- [ ] Heatmap-style hue → gradient: a hue of 0 (red) and 359 (red) both render correctly in `ProfilePostCard` without modular-arithmetic bugs.
- [ ] Following count of 0 still renders as "0" (not blank).

---

## Accessibility

- [ ] All chart `<svg>` elements have `role="img"` and an `aria-label`.
- [ ] Donut slices and legend rows are keyboard-focusable (`<button type="button">`).
- [ ] Hero name has `id="profile-name"` and the section uses `aria-labelledby="profile-name"`.

---

## Sample Test Data

Reference `sample-data.json`. The profile is **Melodye Haus** (Instagram, 184K followers). Charts include 30 daily points for engagement and follower series; donut has 3 slices summing to 318 posts. Use these to verify chart math and donut percentage calculations.
