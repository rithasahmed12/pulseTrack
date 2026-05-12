/**
 * Type contracts for the Trending section.
 *
 * The screen consumes these via TrendingProps. Data is required; callbacks
 * are optional so the preview renders without handlers wired.
 */

export type Platform = 'instagram' | 'tiktok'

export interface TrendingPost {
  id: string
  platform: Platform
  profileUsername: string
  profileDisplayName: string
  caption: string
  engagementRate: number
  /** Percent change in engagement vs the prior 24h window — drives the velocity chip. */
  velocityPercent: number
  /** Hue (0–359) for the synthetic thumbnail gradient. */
  thumbnailHue: number
  postedAt: string
}

export interface TrendingHashtag {
  tag: string
  usageCount: number
  /** Percent change vs prior 24h. Negative for falling tags. */
  growthPercent: number
  /** 0–1 normalized score used to scale the tag-cloud font size. */
  weight: number
}

export interface PlatformSeriesPoint {
  /** Day label, e.g. "Mon", "Tue". */
  day: string
  value: number
}

export interface PlatformSeries {
  platform: Platform
  label: string
  currentAvgEngagement: number
  previousAvgEngagement: number
  /** Percent delta vs the previous comparable window. */
  deltaPercent: number
  series: PlatformSeriesPoint[]
}

export interface HeatmapCell {
  /** 0 = Monday, 6 = Sunday. */
  day: number
  /** 0–23 hour. */
  hour: number
  /** Average engagement percent for this slot. */
  value: number
}

export interface Heatmap {
  weekdays: string[]
  cells: HeatmapCell[]
}

export interface TrendingProps {
  // ---- data ----
  trendingPosts: TrendingPost[]
  trendingHashtags: TrendingHashtag[]
  platformComparison: PlatformSeries[]
  heatmap: Heatmap

  // ---- callbacks ----

  /** Click a trending post — opens the post detail modal (handled by Posts section). */
  onPostClick?: (post: TrendingPost) => void

  /** Click a hashtag (either from the cloud or the ranked list) — routes to Posts filtered by tag. */
  onHashtagClick?: (tag: string) => void

  /** Click on a heatmap cell — could deep-link to a posting-time recommendation panel. */
  onHeatmapCellClick?: (cell: HeatmapCell) => void
}
