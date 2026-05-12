# UI Field ← Apify Field Map

Maps every field from `product-plan/data-shapes/overview.ts` to its source. Where a field is `MISSING`, the listed Svelte components must guard with `{#if value != null}` or drop the affected UI element entirely. Move this file to `apps/api/src/scraper/FIELD_MAP.md` after Phase 1 scaffold.

---

## `Post` (sections/posts/, sections/dashboard/TopPost)

| UI field | Instagram source | TikTok source |
| --- | --- | --- |
| `id` | DB-generated uuid | DB-generated uuid |
| `platform` | literal `'instagram'` | literal `'tiktok'` |
| `profileUsername` | `ownerUsername` | `authorMeta.name` |
| `profileDisplayName` | `ownerFullName` | `authorMeta.nickName` |
| `postType` | mapped from `type` + `productType` | `isSlideshow ? 'photo' : 'video'` |
| `caption` | `caption` | `text` |
| `hashtags[]` | `hashtags` | `hashtags[].name` |
| `likes` | `likesCount` | `diggCount` |
| `comments` | `commentsCount` | `commentCount` |
| `shares` | **MISSING → null** | `shareCount` |
| `saves` | **MISSING → null** | `collectCount` |
| `views` | `videoViewCount` (videos/reels only, null on photos) | `playCount` |
| `engagementRate` | computed | computed |
| `postedAt` | `timestamp` | `createTimeISO` |
| `thumbnailHue` | derived from `id` hash (fallback) | derived from `id` hash (fallback) |
| `thumbnailUrl` *(added)* | `displayUrl` | `videoMeta.coverUrl` |
| `engagementOverTime[]` | computed from snapshots | computed from snapshots |

### Components that must guard against null shares/saves/views

- `apps/web/src/lib/components/posts/PostCard.svelte` — hover-reveal metrics overlay. Drop the tile when the field is null. Layout: switch from `grid-cols-3 gap-2` to `grid-cols-auto`.
- `apps/web/src/lib/components/posts/PostDetailModal.svelte` — stat grid. IG posts → 3 tiles (likes/comments/views or likes/comments/engagement), TikTok → 5 tiles (all metrics).
- `apps/web/src/lib/components/dashboard/TopPostCard.svelte` — engagement chip. The chip uses `engagementRate`, no change. But the hover overlay full-metrics grid follows the same rule as PostCard.
- `apps/web/src/lib/components/posts/PostsFilterBar.svelte` — "Min engagement" filter uses `engagementRate`, no change.

---

## `TrackedProfile` (sections/tracked-profiles)

| UI field | Instagram source | TikTok source |
| --- | --- | --- |
| `id` | DB uuid | DB uuid |
| `platform` | literal | literal |
| `username` | `username` | `authorMeta.name` |
| `displayName` | `fullName` | `authorMeta.nickName` |
| `avatarUrl` | `profilePicUrlHD` ?? `profilePicUrl` | `authorMeta.avatar` |
| `bio` | `biography` | `authorMeta.signature` |
| `followersCount` | `followersCount` | `authorMeta.fans` |
| `followingCount` | `followsCount` | `authorMeta.following` |
| `postsCount` | `postsCount` | `authorMeta.video` |
| `engagementRate` | computed (avg of last 25 posts) | computed (avg of last 25 posts) |
| `lastScrapedAt` | `scrape_jobs.completed_at` of last successful job | same |
| `scrapeStatus` | DB state machine (`idle`/`scraping`/`failed`) | same |
| `scrapeError` | `scrape_jobs.error_message` of last failed job | same |
| `isActive` | DB column | DB column |
| `isNew` | computed: `created_at > now() - 24h` | same |
| `createdAt` | DB column | DB column |

No nulls. Reject `private === true` accounts at the add-flow step with a user-facing error.

---

## `DetailedProfile` (sections/profile-detail)

| UI field | Instagram source | TikTok source |
| --- | --- | --- |
| `id` | DB uuid | DB uuid |
| `platform` | literal | literal |
| `username` | `username` | `authorMeta.name` |
| `displayName` | `fullName` | `authorMeta.nickName` |
| `avatarUrl` | `profilePicUrlHD` | `authorMeta.avatar` |
| `bio` | `biography` | `authorMeta.signature` |
| `isVerified` | `verified` | `authorMeta.verified` |
| `joinedAt` | **MISSING → null** | `authorMeta.createTime` (unix → ISO) |
| `followersCount` | `followersCount` | `authorMeta.fans` |
| `followingCount` | `followsCount` | `authorMeta.following` |
| `postsCount` | `postsCount` | `authorMeta.video` |
| `engagementRate` | computed | computed |
| `platformMetrics.rows[]` | computed (avg likes, avg comments, avg views, top hashtag) | computed (avg likes, avg comments, avg views, avg shares) |

### Components that must guard

- `apps/web/src/lib/components/profile-detail/ProfileHero.svelte` — drop the "Joined" pill for IG profiles. Render only `Followers / Following / Posts / Avg Engagement`.

---

## `TopPost` (sections/dashboard)

Subset of `Post` minus `hashtags` and `engagementOverTime`. Same null rules apply for `shares`, `saves`, `views`.

---

## `TrendingPost` (sections/trending)

| UI field | Source |
| --- | --- |
| `id` | DB uuid |
| `platform` | DB column |
| `profileUsername` | join from `tracked_accounts.username` |
| `profileDisplayName` | join from `tracked_accounts.display_name` |
| `caption` | `posts.caption` |
| `engagementRate` | `posts.engagement_rate` |
| `velocityPercent` | computed: `(last24hEng - prev24hEng) / prev24hEng * 100` |
| `thumbnailHue` | derived from `id` hash |
| `postedAt` | `posts.posted_at` |

No null fields. `velocityPercent` is `0` if no prior window data exists.

---

## `TrendingHashtag` (sections/trending)

| UI field | Source |
| --- | --- |
| `tag` | `hashtags.tag` |
| `usageCount` | `hashtags.usage_count` |
| `growthPercent` | computed: `(usage_count - prev_window_count) / prev_window_count * 100` |
| `weight` | `usage_count / max(usage_count)` clamped to `[0,1]` |

---

## `PlatformSeries` / `HeatmapCell` (sections/trending)

Both fully computed from `posts` + `tracked_accounts`. No Apify dependency.

---

## `AppUser` (sections/app-profile)

Sourced entirely from Supabase `auth.users` + our `profiles` table. No Apify dependency.

| UI field | Source |
| --- | --- |
| `id` | `auth.users.id` |
| `displayName` | `profiles.display_name` |
| `email` | `auth.users.email` |
| `bio` | `profiles.bio` |
| `avatarUrl` | `profiles.avatar_url` (Supabase Storage `media` bucket) |
| `joinedAt` | `profiles.created_at` |

---

## `ActivityEvent` (sections/dashboard, Supabase Realtime)

Sourced from our `activity_log` table. Emitted by `ScraperService` and `TrackedAccountsService`.

| Event type | When emitted |
| --- | --- |
| `new_post` | After scrape, for each post not seen in prior scrapes (matched by `platform_post_id`) |
| `follower_spike` | When latest snapshot's `followers_count` > prev snapshot * 1.05 within 24h |
| `trending_hashtag` | When a hashtag's `usage_count` grows >50% in last 24h (cron-detected) |
| `scrape_complete` | At end of successful scrape, with `posts_scraped` count |
| `scrape_failed` | At end of failed scrape, with `error_message` |

---

## Summary — non-null guarantees in DB

- **Always populated:** `platform`, `platform_post_id`, `post_type`, `posted_at`, `likes_count`, `comments_count`, `engagement_rate`, `hashtags`, `caption`, `thumbnail_url`.
- **Nullable (handle in UI):** `shares_count`, `saves_count`, `views_count`, `joined_at` (on profile-detail page only).
- **Computed by us:** `engagement_rate`, `velocity_percent`, `growth_percent`, `weight`, `engagementOverTime`, `platformMetrics`, all heatmap and platform-series data.
