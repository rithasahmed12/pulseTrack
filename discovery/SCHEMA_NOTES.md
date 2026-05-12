# Apify Actor Schemas — Phase 0 Discovery

Pulled 2026-05-12 via `mcp__apify__fetch-actor-details`. These will be the source of truth for the NestJS `ScraperService` normalization layer. Move this file to `apps/api/src/scraper/SCHEMA_NOTES.md` after the workspace is scaffolded in Phase 1.

---

## Instagram — `apify/instagram-scraper`

- **Pricing model:** PAY_PER_EVENT, free tier `$0.0027` per result, no actor-start fee.
- **Strategy:** One call per tracked profile with `resultsType: 'details'` — the response contains profile metadata **and** `latestPosts[]` inline, so we get both the `TrackedAccount` row and a fresh batch of `Post` rows in a single billable scrape.
- **Pagination:** `resultsLimit` is the per-URL cap. Default 100. We use 25 for routine re-scrapes (covers ~2 weeks of posting for active accounts).
- **Date filter:** `onlyPostsNewerThan` accepts ISO date or relative ("1 day", "2 months"). Use this on re-scrapes to skip already-known posts: `onlyPostsNewerThan = lastScrapedAt - 1 day` (1-day overlap so we catch late edits).

### Input we send

```json
{
  "resultsType": "details",
  "directUrls": ["https://www.instagram.com/<username>/"],
  "resultsLimit": 25,
  "onlyPostsNewerThan": "<iso-or-omit>",
  "addParentData": false
}
```

### Output — profile (top-level fields we use)

| Apify field | Type | Notes |
| --- | --- | --- |
| `username` | string | |
| `fullName` | string | → `displayName` |
| `biography` | string | → `bio` |
| `profilePicUrl` / `profilePicUrlHD` | string | prefer HD |
| `followersCount` | number | |
| `followsCount` | number | → `followingCount` |
| `postsCount` | number | |
| `verified` | boolean | → `isVerified` |
| `private` | boolean | reject — we only track public |
| `isBusinessAccount` | boolean | display-only |
| `businessCategoryName` | string | display-only |
| `externalUrl` | string | display-only |
| `latestPosts[]` | array | inline posts feed (see below) |

### Output — post (`latestPosts[]` items, also top-level for post-URL inputs)

| Apify field | Type | Notes |
| --- | --- | --- |
| `id` | string | → `platform_post_id` (unique) |
| `shortCode` | string | for canonical URL `instagram.com/p/<shortCode>` |
| `type` | `'Image' \| 'Video' \| 'Sidecar'` | map to `post_type` |
| `productType` | string | `'clips'` indicates Reel; otherwise feed |
| `caption` | string | |
| `displayUrl` | string | → `thumbnail_url` |
| `images[]` | string[] | additional media |
| `videoUrl` | string | for Video/Reel |
| `url` | string | post URL |
| `timestamp` | string (ISO) | → `posted_at` |
| `ownerUsername` | string | |
| `ownerFullName` | string | |
| `ownerId` | string | |
| `likesCount` | number | → `likes_count` |
| `commentsCount` | number | → `comments_count` |
| `videoViewCount` | number | → `views_count` (videos/reels only) |
| `videoPlayCount` | number | fallback for views |
| `videoDuration` | number | seconds |
| `hashtags[]` | string[] | |
| `mentions[]` | string[] | |
| `childPosts[]` | array | carousel children |
| `taggedUsers[]` | array | |
| `locationName` / `locationId` | string | optional |
| `musicInfo` | object | reels only |
| `dimensionsHeight` / `dimensionsWidth` | number | for masonry layout hints |

### Missing on Instagram (must be null)

- **`shares_count`** — IG does not expose shares per post.
- **`saves_count`** — IG does not expose saves per post.
- **`joinedAt`** on profile — IG does not expose account creation date.

### `post_type` mapping

```
type='Image'                    → 'photo'
type='Sidecar'                  → 'carousel'
type='Video' && productType='clips' → 'reel'
type='Video' (else)             → 'video'
```

---

## TikTok — `clockworks/tiktok-scraper`

- **Pricing model:** PAY_PER_EVENT, free tier `$0.0037` per result + `$0.001` actor-start. Date filter is an additional `$0.0013/result` (charged on free tier).
- **Strategy:** TikTok actor does not have a separate "details" mode. We always request videos with `profiles: [username]`. Profile metadata is embedded in every video's `authorMeta` — we read it from the first item.
- **Pagination:** `resultsPerPage` per profile. Default 100. We use 25 for routine re-scrapes.
- **Date filter:** `oldestPostDateUnified` — costs extra. Skip for now (cheaper to over-fetch and dedupe by `platform_post_id`).

### Input we send

```json
{
  "profiles": ["<username>"],
  "resultsPerPage": 25,
  "profileScrapeSections": ["videos"],
  "profileSorting": "latest",
  "excludePinnedPosts": false,
  "shouldDownloadCovers": false,
  "shouldDownloadAvatars": false,
  "proxyCountryCode": "None"
}
```

### Output — video item

| Apify field | Type | Notes |
| --- | --- | --- |
| `id` | string | → `platform_post_id` |
| `webVideoUrl` | string | canonical URL |
| `url` | string | dataset URL |
| `text` | string | → `caption` |
| `textLanguage` | string | display-only |
| `createTime` | number | unix seconds |
| `createTimeISO` | string | ISO — use this as `posted_at` |
| `diggCount` | number | → `likes_count` |
| `commentCount` | number | → `comments_count` |
| `shareCount` | number | → `shares_count` ✓ |
| `collectCount` | number | → `saves_count` ✓ |
| `playCount` | number | → `views_count` |
| `repostCount` | number | bonus, not in UI |
| `mediaUrls[]` | string[] | direct video CDN URLs (may expire) |
| `hashtags[]` | `{name, id, title, cover}` | use `.name` for our `hashtags text[]` |
| `mentions[]` | string[] | |
| `isAd` / `isPinned` / `isSponsored` | boolean | optional filters |
| `isSlideshow` | boolean | true → `post_type='photo'` |
| `videoMeta.coverUrl` | string | → `thumbnail_url` |
| `videoMeta.originalCoverUrl` | string | fallback |
| `videoMeta.duration` | number | seconds |
| `videoMeta.height` / `.width` | number | masonry hints |
| `videoMeta.downloadAddr` | string | watermark-free, only with `shouldDownloadVideos` |
| `musicMeta.musicName` / `.musicAuthor` / `.musicOriginal` | string/bool | optional |
| `locationMeta.locationName` / `.countryCode` | string | optional |

### Output — profile (read from `authorMeta` of any video)

| Apify field | Type | Notes |
| --- | --- | --- |
| `authorMeta.name` | string | → `username` |
| `authorMeta.nickName` | string | → `displayName` |
| `authorMeta.avatar` | string | → `avatar_url` |
| `authorMeta.signature` | string | → `bio` |
| `authorMeta.fans` | number | → `followersCount` |
| `authorMeta.following` | number | |
| `authorMeta.video` | number | → `postsCount` |
| `authorMeta.heart` | number | total hearts across all videos (not in UI) |
| `authorMeta.verified` | boolean | |
| `authorMeta.privateAccount` | boolean | reject — public only |
| `authorMeta.createTime` | number | unix seconds → `joinedAt` ISO |
| `authorMeta.bioLink` | string | display-only |
| `authorMeta.signature` | string | → `bio` |

### `post_type` mapping

```
isSlideshow === true → 'photo'
otherwise            → 'video'   (TikTok has no carousel/reel distinction)
```

### Missing on TikTok

- Nothing critical. TikTok exposes every metric the UI references.

---

## Cross-platform field gaps (impact on UI / DB)

| UI field (data-shapes/overview.ts) | Instagram | TikTok | DB nullable? | UI handling |
| --- | --- | --- | --- | --- |
| `Post.likes` | ✓ | ✓ | no | always rendered |
| `Post.comments` | ✓ | ✓ | no | always rendered |
| `Post.shares` | **MISSING** | ✓ | **yes** | hide tile when null |
| `Post.saves` | **MISSING** | ✓ | **yes** | hide tile when null |
| `Post.views` | photos→null, videos→✓ | ✓ | **yes** | hide tile when null |
| `Post.engagementRate` | computed | computed | no | always rendered |
| `Post.hashtags` | ✓ | ✓ (via `.name`) | no | |
| `DetailedProfile.isVerified` | ✓ | ✓ | no | |
| `DetailedProfile.joinedAt` | **MISSING** | ✓ | **yes** | hide on IG profile-detail hero |
| `TrackedProfile.bio` | ✓ | ✓ | yes (empty allowed) | |

## Engagement rate formula

```
engagementRate = ((likes + comments + (shares ?? 0)) / followersAtScrapeTime) * 100
```

`followersAtScrapeTime` = the tracked account's `followers_count` at the moment the post was scraped (we don't have point-in-time follower data per post). Note this as an approximation in `FIELD_GAPS.md` for the profile-detail and posts sections.

## Re-scrape cadence

`pg_cron` hourly job calls `POST /webhooks/cron/rescrape-due` on NestJS. The handler picks `tracked_accounts` where `is_active = true AND (last_scraped_at IS NULL OR last_scraped_at < now() - interval '6 hours')`, then dispatches scrapes with a concurrency of 3.
