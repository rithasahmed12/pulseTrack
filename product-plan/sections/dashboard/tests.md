# Test Specs: Dashboard

These specs are **framework-agnostic**. Adapt to your testing setup.

## Overview

The dashboard composes four stat cards, six top-post cards, and a sticky activity feed. The time-range selector re-scopes everything; hovering a post reveals metrics; clicking opens the detail modal.

---

## User Flow Tests

### Flow 1: Switch time range

1. Render `DashboardView` with `timeRange: '7d'`.
2. User clicks the `24h` button in the segmented selector.
3. `onTimeRangeChange('24h')` fires.

**Expected:**
- [ ] Active pill switches to `24h` (violet-tinted background + inset ring).
- [ ] Page eyebrow updates to read "Last 24 hours".
- [ ] Top-posts header note updates to "...last 24 hours".

### Flow 2: Open a top post

1. User hovers a top-post card.
2. The metrics overlay slides up with a 3-col grid showing Likes, Comments, [Shares|Saves|Views], Engagement.
3. User clicks the card.
4. `onPostClick(post)` fires with the full `TopPost` object.

**Expected:**
- [ ] Overlay visibility is purely CSS-driven on hover/focus (no React state required for the reveal).
- [ ] Rank pill (#1, #2, etc.) is rendered in the bottom-left corner.

### Flow 3: Click an activity event

For an `ActivityEvent` with `profileUsername: 'ortega.films'`:

1. User hovers the event.
2. The event shows "Open profile →" link.
3. User clicks it.
4. `onActivityProfileClick(event)` fires with the full event object.

For an `ActivityEvent` with `profileUsername: null` (e.g., trending hashtag):

- [ ] No "Open profile" link rendered.

---

## Stat Card Tests

For each stat:

- [ ] Tone-mapped icon tile renders (violet / cyan / amber / rose).
- [ ] Value is rendered with `tabular-nums` class.
- [ ] Delta chip shows:
  - **up**: emerald, ArrowUpRight icon.
  - **down**: rose, ArrowDownRight icon.
  - **flat**: slate, Minus icon, value rendered as `0`.
- [ ] Hovering the card lifts it 0.5px and tints border to violet/25.

---

## Activity Feed Tests

- [ ] "Live" pulse indicator renders next to the heading with an animated emerald ping.
- [ ] Events animate in via `act-rise` keyframe with staggered delay (capped at 12 items).
- [ ] Each event's type chip uses the right color: `new_post` → cyan, `follower_spike` → violet, `trending_hashtag` → amber, `scrape_complete` → emerald, `scrape_failed` → rose.
- [ ] The profile handle inside the event message is **bolded** (`text-slate-100`) compared to the surrounding text (`text-slate-300`).
- [ ] Empty `events: []` renders the helper text "No activity yet…"

---

## Empty States

- [ ] If `topPosts` is empty, the top-posts grid card renders no cards. (No explicit empty state required — preview will look intentional with the header and divider remaining.)
- [ ] If `activity` is empty, see Activity Feed Tests for the empty placeholder copy.

---

## Component Interaction Tests

- [ ] "View all" link on top-posts header fires `onViewAllPostsClick()` and renders an ArrowUpRight icon that translates 0.5px on hover.
- [ ] "View all" link on activity feed fires `onViewAllActivityClick()`.
- [ ] Sticky activity sidebar uses `lg:sticky lg:top-[80px]` and does not overlap the page header.

---

## Edge Cases

- [ ] Posts with `views > 0` show the Views metric; posts without show Saves instead. Engagement always renders.
- [ ] Stat formatting handles 4.82% → "4.82%" and 1284 → "1,284" via the pre-formatted `formattedValue` field.
- [ ] Time-since formatting in activity feed: `45000` ms ago → "now", `120000` → "2m", `7200000` → "2h", `172800000` → "2d".

---

## Accessibility Checks

- [ ] Each top-post card is `role="button"` with `tabIndex={0}` and a descriptive `aria-label`.
- [ ] Enter / Space on a focused card opens the detail (calls `onClick`).
- [ ] Activity feed has `aria-label="Recent activity"` on the `<section>`.

---

## Sample Test Data

Reference `sample-data.json` for full fixtures. Quick stub:

```typescript
const mockStat = {
  id: 'tracked-profiles',
  label: 'Tracked profiles',
  value: 9,
  formattedValue: '9',
  icon: 'users' as const,
  tone: 'violet' as const,
  delta: { value: 2, direction: 'up' as const, label: '+2 vs prev 7d' },
}
```
