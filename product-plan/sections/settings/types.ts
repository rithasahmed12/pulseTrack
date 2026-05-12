/**
 * Type contracts for the Settings section.
 *
 * The screen consumes these via SettingsProps. Data is required; callbacks
 * are optional so the preview renders without handlers wired.
 */

export type SettingsTabId = 'security' | 'notifications' | 'appearance' | 'data'

export type TabIconName = 'lock' | 'bell' | 'palette' | 'shield'

export interface SettingsTab {
  id: SettingsTabId
  label: string
  description: string
  icon: TabIconName
}

export interface SecurityState {
  twoFactorEnabled: boolean
  /** ISO timestamp of the last password change — surfaces as a caption. */
  lastPasswordChangeAt: string
}

export type NotificationPrefIcon =
  | 'sparkles'
  | 'trending-up'
  | 'hash'
  | 'mail'

export interface NotificationPreference {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: NotificationPrefIcon
}

export type AccentColorId = 'violet' | 'cyan' | 'rose' | 'amber'

export interface AccentOption {
  id: AccentColorId
  label: string
  /** Hex value used for the live preview chip + dot. */
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

export interface SettingsProps {
  // ---- data ----
  tabs: SettingsTab[]
  activeTab: SettingsTabId
  security: SecurityState
  notificationPreferences: NotificationPreference[]
  accentOptions: AccentOption[]
  appearance: AppearanceState

  // ---- callbacks ----

  /** Left-rail tab change. */
  onTabChange?: (tab: SettingsTabId) => void

  /** Security pane — password form submit. */
  onPasswordSubmit?: (values: PasswordFormValues) => void

  /** Security pane — 2FA toggle change. */
  onTwoFactorToggle?: (enabled: boolean) => void

  /** Security pane — "Set up authenticator" CTA on the 2FA card. */
  onSetUp2FAClick?: () => void

  /** Notifications pane — toggle a preference. */
  onNotificationToggle?: (id: string, enabled: boolean) => void

  /** Appearance pane — accent swatch click. */
  onAccentChange?: (accent: AccentColorId) => void

  /** Appearance pane — sidebar default toggle. */
  onSidebarDefaultToggle?: (collapsed: boolean) => void

  /** Data pane — clear scrape cache (with confirm). */
  onClearCache?: () => void

  /** Data pane — start the CSV export. */
  onExportCsv?: () => void

  /** Data pane — delete the account (only fires after the typed DELETE confirmation). */
  onDeleteAccount?: () => void
}
