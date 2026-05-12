import { Link2 } from 'lucide-react'
import { IdentityCard } from './IdentityCard'
import { WorkspaceStatTile } from './WorkspaceStatTile'
import { ConnectionCard } from './ConnectionCard'
import type { AppProfileProps } from '../types'

export function AppProfileView({
  user,
  draft,
  isDirty,
  isSaving,
  stats,
  connections,
  onDisplayNameChange,
  onBioChange,
  onAvatarChange,
  onSave,
  onDiscard,
  onConnectClick,
  onDisconnectClick,
}: AppProfileProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
          Workspace · Profile
        </p>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
          Your profile
        </h1>
        <p className="mt-0.5 text-[13px] text-slate-400">
          How you appear inside PulseTrack — plus the creator accounts linked to this workspace.
        </p>
      </header>

      {/* Identity card */}
      <IdentityCard
        user={user}
        draft={draft}
        isDirty={isDirty}
        isSaving={isSaving}
        onDisplayNameChange={onDisplayNameChange}
        onBioChange={onBioChange}
        onAvatarChange={onAvatarChange}
        onSave={onSave}
        onDiscard={onDiscard}
      />

      {/* Stat tiles */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <WorkspaceStatTile key={stat.id} stat={stat} />
        ))}
      </section>

      {/* Connections */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <Link2 className="h-3.5 w-3.5 self-center text-cyan-300" strokeWidth={1.8} />
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
              Connected accounts
            </h2>
          </div>
          <p className="text-[12px] text-slate-500">
            Link your own creator accounts to unlock first-party analytics.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {connections.map((c) => (
            <ConnectionCard
              key={c.platform}
              connection={c}
              onConnectClick={() => onConnectClick?.(c.platform)}
              onDisconnectClick={() => onDisconnectClick?.(c.platform)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
