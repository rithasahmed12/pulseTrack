import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, ExternalLink, Trash2, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type {
  DetailedProfile,
} from '../types'

export interface ProfileHeroProps {
  profile: DetailedProfile
  isTracked: boolean
  onTrackProfile?: () => void
  onRemoveTracking?: () => void
}

export function ProfileHero({
  profile,
  isTracked,
  onTrackProfile,
  onRemoveTracking,
}: ProfileHeroProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const confirmRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!confirmingRemove) return
    function onDocClick(e: MouseEvent) {
      if (!confirmRef.current?.contains(e.target as Node)) setConfirmingRemove(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setConfirmingRemove(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [confirmingRemove])

  const accentTop =
    profile.platform === 'instagram'
      ? 'linear-gradient(90deg, transparent, rgba(225,48,108,0.55), rgba(247,119,55,0.55), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), rgba(124,58,237,0.45), transparent)'

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
      aria-labelledby="profile-name"
    >
      {/* Platform accent strip */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: accentTop }}
      />

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:gap-8">
        {/* Identity */}
        <div className="flex gap-4 sm:gap-5">
          <Avatar profile={profile} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1
                id="profile-name"
                className="truncate text-[20px] font-semibold leading-tight tracking-tight text-slate-50 sm:text-[22px]"
              >
                {profile.displayName}
              </h1>
              {profile.isVerified && (
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-violet-300"
                  strokeWidth={2}
                  aria-label="Verified-style indicator"
                />
              )}
              <PlatformPill platform={profile.platform} />
            </div>

            <p className="mt-0.5 text-[13px] text-slate-500">
              @{profile.username}
              <span className="mx-2 text-slate-700">·</span>
              <span className="text-slate-500">Tracking since {formatJoined(profile.joinedAt)}</span>
            </p>

            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-slate-300">
              {profile.bio || (
                <span className="italic text-slate-600">No bio set on this profile.</span>
              )}
            </p>

            {/* Primary stats row */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
              <StatPill label="Followers" value={formatCount(profile.followersCount)} />
              <StatPill label="Following" value={formatCount(profile.followingCount)} />
              <StatPill label="Posts" value={formatCount(profile.postsCount)} />
              <StatPill
                label="Engagement"
                value={`${profile.engagementRate.toFixed(2)}%`}
                accent
              />
            </div>

            {/* Platform-specific metrics — quieter */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-[#1A1A24] pt-3 text-[12px]">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {profile.platformMetrics.label}
              </span>
              {profile.platformMetrics.rows.map((row) => (
                <span key={row.label} className="inline-flex items-center gap-1.5 text-slate-400">
                  <span>{row.label}</span>
                  <span className="font-medium text-slate-200 tabular-nums">
                    {row.formattedValue}
                  </span>
                  <DeltaChip percent={row.deltaPercent} />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-start gap-2 lg:flex-col lg:items-end">
          <a
            href={profile.platform === 'instagram'
              ? `https://instagram.com/${profile.username}`
              : `https://tiktok.com/@${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-2.5 py-1.5 text-[12px] text-slate-300 hover:border-violet-500/30 hover:text-slate-100"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
            Open on {profile.platform === 'instagram' ? 'Instagram' : 'TikTok'}
          </a>

          {isTracked ? (
            <div ref={confirmRef} className="relative">
              <button
                type="button"
                onClick={() => setConfirmingRemove((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-[12px] font-medium text-rose-200 hover:bg-rose-500/15"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                Remove from tracking
              </button>
              {confirmingRemove && (
                <div
                  role="dialog"
                  aria-label="Confirm remove"
                  className="absolute right-0 top-[calc(100%+6px)] z-20 w-64 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
                >
                  <p className="mb-2.5 text-[12px] leading-snug text-slate-300">
                    Stop tracking{' '}
                    <span className="font-medium text-slate-100">@{profile.username}</span>?
                    The historical data is kept and you can re-track later.
                  </p>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmingRemove(false)}
                      className="rounded-md px-2 py-1 text-[12px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingRemove(false)
                        onRemoveTracking?.()
                      }}
                      className="rounded-md bg-rose-500/15 px-2 py-1 text-[12px] font-medium text-rose-200 hover:bg-rose-500/25"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onTrackProfile}
              className={
                'inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-2.5 py-1.5 text-[12px] font-medium text-white ' +
                'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] ' +
                'transition-colors duration-150 hover:bg-violet-500'
              }
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
              Track this profile
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------- pieces --------------------------------- */

function Avatar({ profile }: { profile: DetailedProfile }) {
  return (
    <div className="relative shrink-0">
      <div className="flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-2xl bg-[#16161F] ring-1 ring-inset ring-white/5 sm:h-[88px] sm:w-[88px]">
        <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <PlatformBadgeDot platform={profile.platform} />
    </div>
  )
}

function PlatformBadgeDot({ platform }: { platform: DetailedProfile['platform'] }) {
  if (platform === 'instagram') {
    return (
      <span
        aria-label="Instagram"
        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#E1306C] to-[#F77737] ring-2 ring-[#0F0F18]"
      >
        <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.25.07 1.63.07 4.85s-.02 3.6-.09 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.07-1.65.07-4.85.07s-3.6-.02-4.85-.09c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.6 2.15 15.22 2.15 12s.02-3.6.09-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.17 8.78 2.15 12 2.2zm0 4.85a4.95 4.95 0 1 0 0 9.9 4.95 4.95 0 0 0 0-9.9zm0 1.8a3.15 3.15 0 1 1 0 6.3 3.15 3.15 0 0 1 0-6.3zm5.1-2.04a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z" />
        </svg>
      </span>
    )
  }
  return (
    <span
      aria-label="TikTok"
      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black ring-2 ring-[#0F0F18]"
    >
      <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.6 7.3a6.4 6.4 0 0 1-4.1-1.5v8.6a5.3 5.3 0 1 1-4.7-5.3v2.2a3.1 3.1 0 1 0 2.5 3v-11h2.3a4.1 4.1 0 0 0 4 3.6v0z" />
      </svg>
    </span>
  )
}

function PlatformPill({ platform }: { platform: DetailedProfile['platform'] }) {
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-1.5 py-[1px] text-[9.5px] font-semibold uppercase tracking-wider text-white ' +
        (platform === 'instagram'
          ? 'bg-gradient-to-br from-[#E1306C] to-[#F77737]'
          : 'bg-black ring-1 ring-inset ring-white/15')
      }
    >
      {platform === 'instagram' ? 'Instagram' : 'TikTok'}
    </span>
  )
}

function StatPill({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span
        className={
          'text-[18px] font-semibold leading-none tracking-tight tabular-nums ' +
          (accent ? 'text-violet-200' : 'text-slate-50')
        }
      >
        {value}
      </span>
      <span className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
    </div>
  )
}

function DeltaChip({ percent }: { percent: number }) {
  if (percent === 0) return null
  const up = percent > 0
  return (
    <span
      className={
        'inline-flex items-center gap-0.5 rounded-full px-1 py-[1px] text-[9.5px] font-medium ring-1 ring-inset ' +
        (up
          ? 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20'
          : 'text-rose-300 bg-rose-500/10 ring-rose-500/20')
      }
    >
      {up ? <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.2} /> : <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={2.2} />}
      <span className="tabular-nums">{Math.abs(percent).toFixed(1)}%</span>
    </span>
  )
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K'
  return String(n)
}

function formatJoined(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}
