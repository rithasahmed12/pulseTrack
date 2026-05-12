/**
 * Type contracts for the App Profile section.
 *
 * The screen consumes these via AppProfileProps. Data is required; callbacks
 * are optional so the preview renders without handlers wired.
 */

export type Platform = 'instagram' | 'tiktok'

export type StatTone = 'violet' | 'cyan' | 'amber' | 'rose'

export type StatIconName = 'calendar' | 'users' | 'image'

export interface AppUser {
  id: string
  displayName: string
  email: string
  bio: string
  avatarUrl: string
  /** ISO timestamp the user joined PulseTrack. */
  joinedAt: string
}

export interface WorkspaceStat {
  id: string
  label: string
  /** Pre-formatted display value. */
  value: string
  /** A short secondary line under the value. */
  footnote: string
  icon: StatIconName
  tone: StatTone
}

export interface Connection {
  platform: Platform
  label: string
  isConnected: boolean
  /** The connected platform handle (without @). Null when not connected. */
  connectedHandle: string | null
  /** ISO timestamp of the last sync. Null when not connected. */
  lastSyncedAt: string | null
  /** Short copy explaining the value of connecting (shown when not connected). */
  hint: string
}

/** Editable subset of AppUser that the identity form mutates. */
export interface AppUserDraft {
  displayName: string
  bio: string
  avatarUrl: string
}

export interface AppProfileProps {
  // ---- data ----
  user: AppUser
  draft: AppUserDraft
  /** True when draft differs from saved user values. Drives Save/Discard visibility. */
  isDirty: boolean
  /** True while a save is in flight. */
  isSaving: boolean
  stats: WorkspaceStat[]
  connections: Connection[]

  // ---- callbacks ----

  /** Inline edit of the display name. */
  onDisplayNameChange?: (value: string) => void

  /** Inline edit of the bio. */
  onBioChange?: (value: string) => void

  /** Avatar change — receives a File picked from the file input. */
  onAvatarChange?: (file: File) => void

  /** Save the dirty draft. */
  onSave?: () => void

  /** Discard the dirty draft and revert to saved values. */
  onDiscard?: () => void

  /** Begin connecting a platform. UI-only in v0.1. */
  onConnectClick?: (platform: Platform) => void

  /** Disconnect a linked platform (after confirm). */
  onDisconnectClick?: (platform: Platform) => void
}
