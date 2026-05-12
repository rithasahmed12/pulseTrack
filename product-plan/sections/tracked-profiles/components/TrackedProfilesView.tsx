import { useMemo } from 'react'
import { HeaderControls } from './HeaderControls'
import { ProfileCard } from './ProfileCard'
import { AddProfileModal } from './AddProfileModal'
import { EmptyState } from './EmptyState'
import type {
  TrackedProfile,
  TrackedProfilesProps,
} from '../types'

export function TrackedProfilesView({
  trackedProfiles,
  filterControls,
  addProfileModalState,
  onAddProfileClick,
  onModalInputChange,
  onModalPlatformChange,
  onAddProfileSubmit,
  onAddProfileCancel,
  onFilterChange,
  onSortChange,
  onSearchChange,
  onProfileClick,
  onScrapeNow,
  onTogglePaused,
  onRemoveProfile,
  onRetryScrape,
}: TrackedProfilesProps) {
  const visible = useMemo(
    () => applyControls(trackedProfiles, filterControls),
    [trackedProfiles, filterControls],
  )

  const hasAny = trackedProfiles.length > 0
  const hasResults = visible.length > 0
  const filtersActive =
    filterControls.platform !== 'all' || filterControls.search.length > 0

  return (
    <div className="min-h-full">
      <HeaderControls
        totalCount={trackedProfiles.length}
        visibleCount={visible.length}
        controls={filterControls}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        onSearchChange={onSearchChange}
        onAddProfileClick={onAddProfileClick}
      />

      {!hasAny ? (
        <EmptyState
          variant="no-profiles"
          onAddProfileClick={onAddProfileClick}
        />
      ) : !hasResults ? (
        <EmptyState
          variant="no-results"
          searchQuery={filterControls.search || undefined}
          onClearFilters={() => {
            onFilterChange?.('all')
            onSearchChange?.('')
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((profile, idx) => (
              <div
                key={profile.id}
                style={{
                  animation: `card-rise 0.4s ease-out ${Math.min(idx, 12) * 0.04}s both`,
                }}
              >
                <ProfileCard
                  profile={profile}
                  onCardClick={() => onProfileClick?.(profile)}
                  onScrapeNow={() => onScrapeNow?.(profile.id)}
                  onTogglePaused={(nextActive) => onTogglePaused?.(profile.id, nextActive)}
                  onRemove={() => onRemoveProfile?.(profile.id)}
                  onRetryScrape={() => onRetryScrape?.(profile.id)}
                />
              </div>
            ))}
          </div>

          {/* Footer footnote — quiet metadata strip */}
          {filtersActive && (
            <p className="mt-6 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-600">
              showing {visible.length} of {trackedProfiles.length} · sort:{' '}
              {sortLabel(filterControls.sort)}
            </p>
          )}
        </>
      )}

      <AddProfileModal
        state={addProfileModalState}
        onInputChange={onModalInputChange}
        onPlatformChange={onModalPlatformChange}
        onSubmit={onAddProfileSubmit}
        onCancel={onAddProfileCancel}
      />

      <style>{`
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function sortLabel(s: TrackedProfilesProps['filterControls']['sort']) {
  switch (s) {
    case 'recently-added': return 'recently added'
    case 'most-followers': return 'most followers'
    case 'highest-engagement': return 'highest engagement'
    case 'last-scraped': return 'last scraped'
  }
}

function applyControls(
  profiles: TrackedProfile[],
  controls: TrackedProfilesProps['filterControls'],
): TrackedProfile[] {
  let out = profiles

  if (controls.platform !== 'all') {
    out = out.filter((p) => p.platform === controls.platform)
  }

  const q = controls.search.trim().toLowerCase()
  if (q.length > 0) {
    out = out.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q),
    )
  }

  const sorted = [...out]
  switch (controls.sort) {
    case 'most-followers':
      sorted.sort((a, b) => b.followersCount - a.followersCount)
      break
    case 'highest-engagement':
      sorted.sort((a, b) => b.engagementRate - a.engagementRate)
      break
    case 'last-scraped':
      sorted.sort((a, b) => {
        const av = a.lastScrapedAt ? new Date(a.lastScrapedAt).getTime() : 0
        const bv = b.lastScrapedAt ? new Date(b.lastScrapedAt).getTime() : 0
        return bv - av
      })
      break
    case 'recently-added':
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      break
  }
  return sorted
}
