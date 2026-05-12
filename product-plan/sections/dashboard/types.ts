/**
 * Type contracts for the Dashboard section.
 *
 * The screen consumes these via DashboardProps. Data is required; callbacks
 * are optional so the preview can render without handlers.
 */

export type Platform = 'instagram' | 'tiktok'

export type TimeRange = '24h' | '7d' | '30d'

export interface TimeRangeOption {
  id: TimeRange
  label: string
  longLabel: string
}

export type StatTone = 'violet' | 'cyan' | 'amber' | 'rose'

export type StatIcon = 'users' | 'image' | 'trending-up' | 'hash'

export type DeltaDirection = 'up' | 'down' | 'flat'

export interface StatDelta {
  /** Absolute change vs the previous comparable period. */
  value: number
  direction: DeltaDirection
  /** Pre-formatted label, e.g. "+184 vs prev 7d" or "−4 vs prev 7d". */
  label: string
}

export interface DashboardStat {
  id: string
  label: string
  /** Raw numeric value — useful for sorting or comparison. */
  value: number
  /** Pre-formatted display string, e.g. "1,284" or "4.82%". */
  formattedValue: string
  icon: StatIcon
  tone: StatTone
  delta: StatDelta
}

export type PostType = 'photo' | 'video' | 'carousel' | 'reel'

export interface TopPost {
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
  /** Hue (0–359) used to generate a synthetic thumbnail gradient when no real image is available. */
  thumbnailHue: number
}

export type ActivityEventType =
  | 'new_post'
  | 'follower_spike'
  | 'trending_hashtag'
  | 'scrape_complete'
  | 'scrape_failed'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  /** Null for events that aren't tied to a specific platform (e.g. trending hashtag). */
  platform: Platform | null
  /** Null for events not tied to a specific tracked profile. */
  profileUsername: string | null
  message: string
  createdAt: string
}

export interface DashboardUser {
  displayName: string
  firstName: string
}

export interface DashboardProps {
  // ---- data ----
  currentUser: DashboardUser
  timeRange: TimeRange
  timeRangeOptions: TimeRangeOption[]
  stats: DashboardStat[]
  topPosts: TopPost[]
  activity: ActivityEvent[]

  // ---- callbacks ----

  /** Time-range segmented selector change. */
  onTimeRangeChange?: (range: TimeRange) => void

  /** "View all" link on the top-posts header — should route to the Posts section. */
  onViewAllPostsClick?: () => void

  /** Click on a top-post card — should open the post detail (in the Posts section). */
  onPostClick?: (post: TopPost) => void

  /** Click on an activity event with a profile reference — should navigate to that profile's detail page. */
  onActivityProfileClick?: (event: ActivityEvent) => void

  /** Click on the activity feed's "View all activity" link. */
  onViewAllActivityClick?: () => void
}
