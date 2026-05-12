/**
 * Type contracts for the Tracked Profiles section.
 *
 * The screen design consumes these via TrackedProfilesProps. Data fields are
 * required; callbacks are optional so the component can render in a preview
 * with no handlers wired.
 */

export type Platform = 'instagram' | 'tiktok'

export type PlatformFilter = 'all' | 'instagram' | 'tiktok'

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
  /** ISO timestamp of the last successful scrape. Null if the profile has never been scraped. */
  lastScrapedAt: string | null
  scrapeStatus: ScrapeStatus
  /** Populated only when scrapeStatus is 'failed'. */
  scrapeError: string | null
  /** False when the analyst has paused monitoring. The profile is excluded from the scheduled scrape queue. */
  isActive: boolean
  /** True for profiles added within the last 24h — drives the "New" badge. */
  isNew: boolean
  /** ISO timestamp the analyst added this profile to their workspace. */
  createdAt: string
}

export interface FilterControls {
  platform: PlatformFilter
  sort: SortOption
  search: string
}

export interface AddProfileModalState {
  isOpen: boolean
  inputValue: string
  /** Set when the input value matches an instagram.com or tiktok.com URL pattern. */
  detectedPlatform: Platform | null
  /** Used when inputValue is a plain username and detectedPlatform is null. */
  manualPlatform: Platform
  isSubmitting: boolean
}

export interface AddProfileSubmitInput {
  platform: Platform
  username: string
}

export interface TrackedProfilesProps {
  // ---- data ----
  trackedProfiles: TrackedProfile[]
  filterControls: FilterControls
  addProfileModalState: AddProfileModalState
  currentUserId: string

  // ---- callbacks ----

  /** Opens the Add Profile modal. */
  onAddProfileClick?: () => void

  /** Fires on every keystroke in the modal's smart input. Implementer should run URL detection here. */
  onModalInputChange?: (value: string) => void

  /** Fires when the analyst clicks a platform toggle card in the modal (only active for plain-text input). */
  onModalPlatformChange?: (platform: Platform) => void

  /** Submits the Add Profile modal. Receives the resolved platform + username. */
  onAddProfileSubmit?: (input: AddProfileSubmitInput) => void

  /** Closes the modal without adding. */
  onAddProfileCancel?: () => void

  /** Header platform filter pill click. */
  onFilterChange?: (filter: PlatformFilter) => void

  /** Header sort dropdown change. */
  onSortChange?: (sort: SortOption) => void

  /** Header search input change. */
  onSearchChange?: (query: string) => void

  /** Card body click — navigates to /profile/:platform/:username. */
  onProfileClick?: (profile: TrackedProfile) => void

  /** Manual "Scrape now" action on a card. */
  onScrapeNow?: (profileId: string) => void

  /** Pause / resume toggle on a card. nextIsActive is the value the card should flip to. */
  onTogglePaused?: (profileId: string, nextIsActive: boolean) => void

  /** Trash action (after confirm) — soft-removes the profile. */
  onRemoveProfile?: (profileId: string) => void

  /** Retry button shown on a failed card. */
  onRetryScrape?: (profileId: string) => void
}
