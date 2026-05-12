/**
 * Type contracts for the Profile Detail section.
 *
 * The screen consumes these via ProfileDetailProps. Data is required;
 * callbacks are optional so the preview renders without handlers wired.
 */

export type Platform = 'instagram' | 'tiktok'

export type PostType = 'photo' | 'video' | 'carousel' | 'reel'

export interface PlatformMetricRow {
  label: string
  value: number
  formattedValue: string
  /** Percent change vs the previous comparable window. */
  deltaPercent: number
}

export interface PlatformMetrics {
  label: string
  rows: PlatformMetricRow[]
}

export interface DetailedProfile {
  id: string
  platform: Platform
  username: string
  displayName: string
  avatarUrl: string
  bio: string
  isVerified: boolean
  joinedAt: string
  followersCount: number
  followingCount: number
  postsCount: number
  engagementRate: number
  platformMetrics: PlatformMetrics
}

export interface TimePoint {
  /** ISO date (or datetime) for the X axis. */
  date: string
  /** Numeric Y value. */
  value: number
}

export interface PostTypeSlice {
  type: PostType
  count: number
}

export interface ProfilePost {
  id: string
  platform: Platform
  profileUsername: string
  profileDisplayName: string
  postType: PostType
  caption: string
  likes: number
  comments: number
  shares: number
  saves: number
  views: number
  engagementRate: number
  postedAt: string
  /** Hue (0–359) for the synthetic thumbnail gradient. */
  thumbnailHue: number
}

export interface QuickStat {
  label: string
  /** Raw numeric value (useful for sorting / comparisons). */
  value: number
  /** Pre-formatted display string. */
  formattedValue: string
}

export interface ProfileDetailProps {
  // ---- data ----
  profile: DetailedProfile
  isTracked: boolean
  engagementSeries: TimePoint[]
  followerSeries: TimePoint[]
  postTypeBreakdown: PostTypeSlice[]
  recentPosts: ProfilePost[]
  topPost: ProfilePost
  quickStats: QuickStat[]

  // ---- callbacks ----

  /** "Track this profile" button — only meaningful when isTracked is false. */
  onTrackProfile?: () => void

  /** "Remove from tracking" button — confirm-on-click, only meaningful when isTracked is true. */
  onRemoveTracking?: () => void

  /** Click a recent post card — should open the post detail flow. */
  onPostClick?: (post: ProfilePost) => void

  /** Click the highlighted top post card — same flow as onPostClick. */
  onTopPostClick?: (post: ProfilePost) => void

  /** Click on a donut chart segment — should navigate to the Posts section pre-filtered to that post type. */
  onPostTypeClick?: (type: PostType) => void
}
