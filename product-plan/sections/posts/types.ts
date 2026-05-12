/**
 * Type contracts for the Posts section.
 *
 * The screen consumes these via PostsProps. Data is required; callbacks are
 * optional so the preview renders without handlers wired.
 */

export type Platform = 'instagram' | 'tiktok'

export type PostType = 'photo' | 'video' | 'carousel' | 'reel'

export type PostTypeFilter = 'all' | PostType

export type PlatformFilter = 'both' | Platform

export type DateRange = '24h' | '7d' | '30d' | '90d'

export interface DateRangeOption {
  id: DateRange
  label: string
}

export interface EngagementPoint {
  /** Day index within the post's 7-day window (1–7). */
  day: number
  /** Engagement rate percent. */
  value: number
}

export interface Post {
  id: string
  platform: Platform
  profileUsername: string
  profileDisplayName: string
  postType: PostType
  caption: string
  hashtags: string[]
  likes: number
  comments: number
  shares: number
  saves: number
  views: number
  engagementRate: number
  postedAt: string
  /** Hue (0–359) for the synthetic thumbnail gradient. */
  thumbnailHue: number
  /** 7-day engagement-over-time series consumed by the detail modal chart. */
  engagementOverTime: EngagementPoint[]
}

export interface FilterControls {
  postType: PostTypeFilter
  platform: PlatformFilter
  dateRange: DateRange
  /** Minimum engagement-rate floor in percent (0–10). */
  minEngagement: number
}

export interface Pagination {
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PostsProps {
  // ---- data ----
  posts: Post[]
  filterControls: FilterControls
  dateRangeOptions: DateRangeOption[]
  pagination: Pagination

  // ---- callbacks ----

  /** Post-type tab change. */
  onPostTypeChange?: (type: PostTypeFilter) => void

  /** Platform toggle change. */
  onPlatformChange?: (platform: PlatformFilter) => void

  /** Date-range dropdown change. */
  onDateRangeChange?: (range: DateRange) => void

  /** Minimum-engagement slider change. */
  onMinEngagementChange?: (value: number) => void

  /** Reset all filters to default. */
  onResetFilters?: () => void

  /** Card click — opens the detail modal. */
  onPostClick?: (post: Post) => void

  /** Hashtag chip click inside the modal — routes to Trending. */
  onHashtagClick?: (tag: string) => void

  /** Infinite-scroll sentinel reached — host should append the next page. */
  onLoadMore?: () => void
}
