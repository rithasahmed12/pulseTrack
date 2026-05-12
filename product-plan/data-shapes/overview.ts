// =============================================================================
// PulseTrack — UI Data Shapes (Combined Reference)
//
// These types define the data that UI components expect to receive as props.
// They are a frontend contract, not a database schema. How you model, store,
// and fetch this data is up to your implementation.
//
// Component `Props` interfaces (e.g., DashboardProps, PostsProps) are NOT
// included here — those stay scoped to each section's own types.ts.
// =============================================================================

/* -----------------------------------------------------------------------------
 * Cross-cutting primitives — these unions appear across multiple sections
 * --------------------------------------------------------------------------- */

export type Platform = 'instagram' | 'tiktok'
export type PostType = 'photo' | 'video' | 'carousel' | 'reel'

/* -----------------------------------------------------------------------------
 * From: sections/authentication
 * --------------------------------------------------------------------------- */

export type SocialProviderId = 'google' | 'apple'

export interface SocialProvider {
  id: SocialProviderId
  label: string
}

export interface BrandCopy {
  name: string
  tagline: string
  supporting: string
}

export interface BrandStat {
  label: string
  value: string
}

export interface Quote {
  text: string
  attribution: string
  role: string
}

export interface AuthFormCopy {
  title: string
  subtitle: string
  submitLabel: string
  loadingLabel: string
  footerPrompt: string
  footerLink: string
}

export interface LegalLinks {
  termsUrl: string
  privacyUrl: string
}

export interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export interface SignupFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

/* -----------------------------------------------------------------------------
 * From: sections/tracked-profiles
 * --------------------------------------------------------------------------- */

export type PlatformFilter = 'all' | Platform
export type SortOption =
  | 'recently-added'
  | 'most-followers'
  | 'highest-engagement'
  | 'last-scraped'
export type ScrapeStatus = 'idle' | 'scraping' | 'failed'

export interface TrackedProfile {
  id: string
  platform: Platform
  username: string
  displayName: string
  avatarUrl: string
  bio: string
  followersCount: number
  followingCount: number
  postsCount: number
  engagementRate: number
  /** ISO timestamp of the last successful scrape. Null if never scraped. */
  lastScrapedAt: string | null
  scrapeStatus: ScrapeStatus
  scrapeError: string | null
  /** False when the analyst has paused monitoring. */
  isActive: boolean
  /** True for profiles added within the last 24h. */
  isNew: boolean
  createdAt: string
}

export interface AddProfileModalState {
  isOpen: boolean
  inputValue: string
  detectedPlatform: Platform | null
  manualPlatform: Platform
  isSubmitting: boolean
}

/* -----------------------------------------------------------------------------
 * From: sections/dashboard
 * --------------------------------------------------------------------------- */

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
  value: number
  direction: DeltaDirection
  /** Pre-formatted label, e.g., "+184 vs prev 7d". */
  label: string
}

export interface DashboardStat {
  id: string
  label: string
  value: number
  formattedValue: string
  icon: StatIcon
  tone: StatTone
  delta: StatDelta
}

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
  /** Hue (0–359) for synthetic thumbnail gradient. */
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
  platform: Platform | null
  profileUsername: string | null
  message: string
  createdAt: string
}

export interface DashboardUser {
  displayName: string
  firstName: string
}

/* -----------------------------------------------------------------------------
 * From: sections/profile-detail
 * --------------------------------------------------------------------------- */

export interface PlatformMetricRow {
  label: string
  value: number
  formattedValue: string
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
  date: string
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
  thumbnailHue: number
}

export interface QuickStat {
  label: string
  value: number
  formattedValue: string
}

/* -----------------------------------------------------------------------------
 * From: sections/posts
 * --------------------------------------------------------------------------- */

export type PostTypeFilter = 'all' | PostType
export type PostsPlatformFilter = 'both' | Platform
export type DateRange = '24h' | '7d' | '30d' | '90d'

export interface DateRangeOption {
  id: DateRange
  label: string
}

export interface EngagementPoint {
  /** Day index 1–7 within the post's first-week window. */
  day: number
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
  thumbnailHue: number
  /** 7-day engagement-over-time series for the detail modal chart. */
  engagementOverTime: EngagementPoint[]
}

export interface Pagination {
  page: number
  pageSize: number
  hasMore: boolean
}

/* -----------------------------------------------------------------------------
 * From: sections/trending
 * --------------------------------------------------------------------------- */

export interface TrendingPost {
  id: string
  platform: Platform
  profileUsername: string
  profileDisplayName: string
  caption: string
  engagementRate: number
  /** Percent change vs the prior 24h window. */
  velocityPercent: number
  thumbnailHue: number
  postedAt: string
}

export interface TrendingHashtag {
  tag: string
  usageCount: number
  growthPercent: number
  /** 0–1 normalized score used to scale the tag-cloud font size. */
  weight: number
}

export interface PlatformSeriesPoint {
  day: string
  value: number
}

export interface PlatformSeries {
  platform: Platform
  label: string
  currentAvgEngagement: number
  previousAvgEngagement: number
  deltaPercent: number
  series: PlatformSeriesPoint[]
}

export interface HeatmapCell {
  /** 0 = Monday, 6 = Sunday. */
  day: number
  hour: number
  value: number
}

export interface Heatmap {
  weekdays: string[]
  cells: HeatmapCell[]
}

/* -----------------------------------------------------------------------------
 * From: sections/app-profile
 * --------------------------------------------------------------------------- */

export interface AppUser {
  id: string
  displayName: string
  email: string
  bio: string
  avatarUrl: string
  joinedAt: string
}

export interface AppUserDraft {
  displayName: string
  bio: string
  avatarUrl: string
}

export interface WorkspaceStat {
  id: string
  label: string
  value: string
  footnote: string
  icon: 'calendar' | 'users' | 'image'
  tone: StatTone
}

export interface Connection {
  platform: Platform
  label: string
  isConnected: boolean
  connectedHandle: string | null
  lastSyncedAt: string | null
  hint: string
}

/* -----------------------------------------------------------------------------
 * From: sections/settings
 * --------------------------------------------------------------------------- */

export type SettingsTabId = 'security' | 'notifications' | 'appearance' | 'data'

export interface SettingsTab {
  id: SettingsTabId
  label: string
  description: string
  icon: 'lock' | 'bell' | 'palette' | 'shield'
}

export interface SecurityState {
  twoFactorEnabled: boolean
  lastPasswordChangeAt: string
}

export interface NotificationPreference {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: 'sparkles' | 'trending-up' | 'hash' | 'mail'
}

export type AccentColorId = 'violet' | 'cyan' | 'rose' | 'amber'

export interface AccentOption {
  id: AccentColorId
  label: string
  hex: string
}

export interface AppearanceState {
  accentColor: AccentColorId
  sidebarStartsCollapsed: boolean
}

export interface PasswordFormValues {
  current: string
  next: string
  confirm: string
}
