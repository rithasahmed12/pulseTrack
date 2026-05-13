// =============================================================================
// PulseTrack — Shared types
//
// Authoritative TypeScript contract between apps/web (SvelteKit) and apps/api
// (NestJS). Derived from product-plan/data-shapes/overview.ts with three
// real-world adjustments after Phase 0 Apify discovery (see discovery/FIELD_MAP.md):
//
//   1. Post.shares / saves / views and the parallel fields on TopPost and
//      ProfilePost are nullable — Instagram does not expose shares/saves at
//      all, and IG photos have no views. Backend returns null; UI guards.
//   2. DetailedProfile.joinedAt is nullable — Instagram does not expose
//      account creation date. TikTok does (authorMeta.createTime).
//   3. Post/TopPost/ProfilePost/TrendingPost gain thumbnailUrl: string | null
//      — real CDN thumbnails from the scraper. thumbnailHue stays as the
//      gradient fallback when thumbnailUrl is null.
//
// Backend-only DTOs (request bodies, query params, etc.) live at the bottom.
// =============================================================================

/* -----------------------------------------------------------------------------
 * Cross-cutting primitives
 * --------------------------------------------------------------------------- */

export type Platform = 'instagram' | 'tiktok';
export type PostType = 'photo' | 'video' | 'carousel' | 'reel';

/* -----------------------------------------------------------------------------
 * authentication
 * --------------------------------------------------------------------------- */

export type SocialProviderId = 'google' | 'apple';

export interface SocialProvider {
  id: SocialProviderId;
  label: string;
}

export interface BrandCopy {
  name: string;
  tagline: string;
  supporting: string;
}

export interface BrandStat {
  label: string;
  value: string;
}

export interface Quote {
  text: string;
  attribution: string;
  role: string;
}

export interface AuthFormCopy {
  title: string;
  subtitle: string;
  submitLabel: string;
  loadingLabel: string;
  footerPrompt: string;
  footerLink: string;
}

export interface LegalLinks {
  termsUrl: string;
  privacyUrl: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/* -----------------------------------------------------------------------------
 * tracked-profiles
 * --------------------------------------------------------------------------- */

export type PlatformFilter = 'all' | Platform;
export type SortOption =
  | 'recently-added'
  | 'most-followers'
  | 'highest-engagement'
  | 'last-scraped';
export type ScrapeStatus = 'idle' | 'scraping' | 'failed';

export interface TrackedProfile {
  id: string;
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
  /** ISO timestamp of the last successful scrape. Null if never scraped. */
  lastScrapedAt: string | null;
  scrapeStatus: ScrapeStatus;
  scrapeError: string | null;
  /** False when the analyst has paused monitoring. */
  isActive: boolean;
  /** True for profiles added within the last 24h. */
  isNew: boolean;
  createdAt: string;
}

export interface AddProfileModalState {
  isOpen: boolean;
  inputValue: string;
  detectedPlatform: Platform | null;
  manualPlatform: Platform;
  isSubmitting: boolean;
}

/* -----------------------------------------------------------------------------
 * dashboard
 * --------------------------------------------------------------------------- */

export type TimeRange = '24h' | '7d' | '30d';

export interface TimeRangeOption {
  id: TimeRange;
  label: string;
  longLabel: string;
}

export type StatTone = 'violet' | 'cyan' | 'amber' | 'rose';
export type StatIcon = 'users' | 'image' | 'trending-up' | 'hash';
export type DeltaDirection = 'up' | 'down' | 'flat';

export interface StatDelta {
  value: number;
  direction: DeltaDirection;
  /** Pre-formatted label, e.g., "+184 vs prev 7d". */
  label: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  icon: StatIcon;
  tone: StatTone;
  delta: StatDelta;
}

export interface TopPost {
  id: string;
  platform: Platform;
  profileUsername: string;
  profileDisplayName: string;
  postType: PostType;
  caption: string;
  likes: number;
  comments: number;
  /** Null on IG (not exposed). TikTok always returns a number. */
  shares: number | null;
  /** Null on IG (not exposed). TikTok always returns a number. */
  saves: number | null;
  /** Null on IG photos. IG videos/reels and TikTok always return a number. */
  views: number | null;
  engagementRate: number;
  postedAt: string;
  /** Real CDN thumbnail; null falls back to the hue gradient. */
  thumbnailUrl: string | null;
  /** Hue (0–359) for synthetic thumbnail gradient. */
  thumbnailHue: number;
}

export type ActivityEventType =
  | 'new_post'
  | 'follower_spike'
  | 'trending_hashtag'
  | 'scrape_complete'
  | 'scrape_failed';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  platform: Platform | null;
  profileUsername: string | null;
  message: string;
  createdAt: string;
}

export interface DashboardUser {
  displayName: string;
  firstName: string;
}

/* -----------------------------------------------------------------------------
 * profile-detail
 * --------------------------------------------------------------------------- */

export interface PlatformMetricRow {
  label: string;
  value: number;
  formattedValue: string;
  deltaPercent: number;
}

export interface PlatformMetrics {
  label: string;
  rows: PlatformMetricRow[];
}

export interface DetailedProfile {
  id: string;
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  /** Null on IG (not exposed). TikTok exposes authorMeta.createTime. */
  joinedAt: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
  platformMetrics: PlatformMetrics;
}

export interface TimePoint {
  date: string;
  value: number;
}

export interface PostTypeSlice {
  type: PostType;
  count: number;
}

export interface ProfilePost {
  id: string;
  platform: Platform;
  profileUsername: string;
  profileDisplayName: string;
  postType: PostType;
  caption: string;
  likes: number;
  comments: number;
  shares: number | null;
  saves: number | null;
  views: number | null;
  engagementRate: number;
  postedAt: string;
  thumbnailUrl: string | null;
  thumbnailHue: number;
}

export interface QuickStat {
  label: string;
  value: number;
  formattedValue: string;
}

/* -----------------------------------------------------------------------------
 * posts
 * --------------------------------------------------------------------------- */

export type PostTypeFilter = 'all' | PostType;
export type PostsPlatformFilter = 'both' | Platform;
export type DateRange = '24h' | '7d' | '30d' | '90d';

export interface DateRangeOption {
  id: DateRange;
  label: string;
}

export interface EngagementPoint {
  /** Day index 1–7 within the post's first-week window. */
  day: number;
  value: number;
}

export interface Post {
  id: string;
  platform: Platform;
  profileUsername: string;
  profileDisplayName: string;
  postType: PostType;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number | null;
  saves: number | null;
  views: number | null;
  engagementRate: number;
  postedAt: string;
  thumbnailUrl: string | null;
  thumbnailHue: number;
  /** Supabase Storage URL of the rehosted reel/video. Null for photos and carousels. */
  videoUrl: string | null;
  /** Carousel slide URLs (Supabase Storage). Empty array for non-carousel posts. */
  mediaUrls: string[];
  /** 7-day engagement-over-time series for the detail modal chart. */
  engagementOverTime: EngagementPoint[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/* -----------------------------------------------------------------------------
 * trending
 * --------------------------------------------------------------------------- */

export interface TrendingPost {
  id: string;
  platform: Platform;
  profileUsername: string;
  profileDisplayName: string;
  caption: string;
  engagementRate: number;
  /** Percent change vs the prior 24h window. */
  velocityPercent: number;
  thumbnailUrl: string | null;
  thumbnailHue: number;
  postedAt: string;
}

export interface TrendingHashtag {
  tag: string;
  usageCount: number;
  growthPercent: number;
  /** 0–1 normalized score used to scale the tag-cloud font size. */
  weight: number;
}

export interface PlatformSeriesPoint {
  day: string;
  value: number;
}

export interface PlatformSeries {
  platform: Platform;
  label: string;
  currentAvgEngagement: number;
  previousAvgEngagement: number;
  deltaPercent: number;
  series: PlatformSeriesPoint[];
}

export interface HeatmapCell {
  /** 0 = Monday, 6 = Sunday. */
  day: number;
  hour: number;
  value: number;
}

export interface Heatmap {
  weekdays: string[];
  cells: HeatmapCell[];
}

/* -----------------------------------------------------------------------------
 * app-profile
 * --------------------------------------------------------------------------- */

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface AppUserDraft {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

export interface WorkspaceStat {
  id: string;
  label: string;
  value: string;
  footnote: string;
  icon: 'calendar' | 'users' | 'image';
  tone: StatTone;
}

export interface Connection {
  platform: Platform;
  label: string;
  isConnected: boolean;
  connectedHandle: string | null;
  lastSyncedAt: string | null;
  hint: string;
}

/* -----------------------------------------------------------------------------
 * settings
 * --------------------------------------------------------------------------- */

export type SettingsTabId = 'security' | 'notifications' | 'appearance' | 'data';

export interface SettingsTab {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: 'lock' | 'bell' | 'palette' | 'shield';
}

export interface SecurityState {
  twoFactorEnabled: boolean;
  lastPasswordChangeAt: string;
}

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: 'sparkles' | 'trending-up' | 'hash' | 'mail';
}

export type AccentColorId = 'violet' | 'cyan' | 'rose' | 'amber';

export interface AccentOption {
  id: AccentColorId;
  label: string;
  hex: string;
}

export interface AppearanceState {
  accentColor: AccentColorId;
  sidebarStartsCollapsed: boolean;
}

export interface PasswordFormValues {
  current: string;
  next: string;
  confirm: string;
}

/* -----------------------------------------------------------------------------
 * Backend-only DTOs (request bodies, query params, internal contracts)
 * --------------------------------------------------------------------------- */

export interface AddTrackedAccountRequest {
  /** Either a full URL or a `@username` style handle. The API parses platform. */
  input: string;
  /** Optional override if URL parsing is ambiguous. */
  platform?: Platform;
}

export interface PostsListQuery {
  type?: PostTypeFilter;
  platform?: PostsPlatformFilter;
  accountId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'engagement' | 'posted-at' | 'likes';
  minEngagement?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PostsListResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface DashboardActivityResponse {
  events: ActivityEvent[];
}

export interface DashboardStatsResponse {
  stats: DashboardStat[];
  user: DashboardUser;
}

export interface TrendingResponse {
  posts: TrendingPost[];
  hashtags: TrendingHashtag[];
  platformComparison: PlatformSeries[];
  heatmap: Heatmap;
}

/** Normalized post emitted by ScraperService before DB insert. */
export interface NormalizedPost {
  platform: Platform;
  platformPostId: string;
  postType: PostType;
  caption: string | null;
  thumbnailUrl: string | null;
  mediaUrls: string[];
  videoUrl: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number | null;
  savesCount: number | null;
  viewsCount: number | null;
  hashtags: string[];
  postedAt: string;
  videoDurationSeconds: number | null;
  rawData: unknown;
}

/** Normalized profile metadata emitted by ScraperService. */
export interface NormalizedProfile {
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  joinedAt: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}
