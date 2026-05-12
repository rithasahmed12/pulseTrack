import { useEffect, useRef, useState } from 'react'
import {
  RefreshCw,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  Sparkles,
  Loader2,
  Users,
  Image,
  UserPlus,
} from 'lucide-react'
import type { TrackedProfile } from '../types'

export interface ProfileCardProps {
  profile: TrackedProfile
  onCardClick?: () => void
  onScrapeNow?: () => void
  onTogglePaused?: (nextIsActive: boolean) => void
  onRemove?: () => void
  onRetryScrape?: () => void
}

export function ProfileCard({
  profile,
  onCardClick,
  onScrapeNow,
  onTogglePaused,
  onRemove,
  onRetryScrape,
}: ProfileCardProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const confirmRef = useRef<HTMLDivElement | null>(null)
  const paused = !profile.isActive
  const failed = profile.scrapeStatus === 'failed'
  const scraping = profile.scrapeStatus === 'scraping'

  // Dismiss confirm popover on outside click / escape
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

  function stop(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation()
  }

  return (
    <article
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onCardClick?.()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open profile for ${profile.displayName} on ${profile.platform}`}
      className={
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-[#0F0F18] ' +
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ' +
        (failed
          ? 'border-rose-500/30'
          : paused
          ? 'border-amber-500/25'
          : 'border-[#1E1E2E]') +
        (paused ? ' opacity-90' : '')
      }
    >
      {/* Top hairline accent on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(124,58,237,0.55), rgba(6,182,212,0.45), transparent)',
        }}
      />

      {/* Header — avatar + identity + actions */}
      <div className="flex items-start gap-3 p-4">
        <ProfileAvatar profile={profile} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[14.5px] font-semibold tracking-tight text-slate-50">
              {profile.displayName}
            </h3>
            {profile.isNew && <NewBadge />}
          </div>
          <p className="truncate text-[12.5px] text-slate-500">@{profile.username}</p>
        </div>

        <div
          onClick={stop}
          onKeyDown={stop}
          className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-200 sm:opacity-60 sm:group-hover:opacity-100"
        >
          <IconAction
            label={scraping ? 'Scrape in progress' : 'Scrape now'}
            onClick={onScrapeNow}
            disabled={scraping}
          >
            <RefreshCw
              className={'h-3.5 w-3.5 ' + (scraping ? 'animate-spin' : '')}
              strokeWidth={1.8}
            />
          </IconAction>
          <IconAction
            label={paused ? 'Resume monitoring' : 'Pause monitoring'}
            onClick={() => onTogglePaused?.(paused)}
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" strokeWidth={1.8} />
            ) : (
              <Pause className="h-3.5 w-3.5" strokeWidth={1.8} />
            )}
          </IconAction>

          <div ref={confirmRef} className="relative">
            <IconAction
              label="Remove from tracking"
              onClick={() => setConfirmingRemove((v) => !v)}
              destructive
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
            </IconAction>
            {confirmingRemove && (
              <div
                onClick={stop}
                onKeyDown={stop}
                role="dialog"
                aria-label="Confirm remove"
                className="absolute right-0 top-[calc(100%+6px)] z-20 w-56 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
              >
                <p className="mb-2.5 text-[12px] leading-snug text-slate-300">
                  Stop tracking{' '}
                  <span className="font-medium text-slate-100">@{profile.username}</span>?
                  Historical data is kept.
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
                      onRemove?.()
                    }}
                    className="rounded-md bg-rose-500/15 px-2 py-1 text-[12px] font-medium text-rose-200 hover:bg-rose-500/25"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio — single line truncate to keep card heights consistent */}
      <div className="px-4">
        <p className="line-clamp-2 min-h-[34px] text-[12.5px] leading-snug text-slate-400">
          {profile.bio || (
            <span className="italic text-slate-600">No bio</span>
          )}
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden border-y border-[#1A1A24] bg-[#1A1A24]">
        <Stat icon={<Users className="h-3 w-3" />} label="Followers" value={formatCount(profile.followersCount)} />
        <Stat icon={<UserPlus className="h-3 w-3" />} label="Following" value={formatCount(profile.followingCount)} />
        <Stat icon={<Image className="h-3 w-3" />} label="Posts" value={formatCount(profile.postsCount)} />
      </div>

      {/* Footer — engagement + state */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <EngagementChip rate={profile.engagementRate} />
        <StatusLine
          profile={profile}
          onRetryScrape={onRetryScrape}
          stop={stop}
        />
      </div>
    </article>
  )
}

/* ---------------------------------- pieces --------------------------------- */

function ProfileAvatar({ profile }: { profile: TrackedProfile }) {
  return (
    <div className="relative shrink-0">
      <div
        className={
          'flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#16161F] ring-1 ring-inset ring-white/5 ' +
          (profile.scrapeStatus === 'scraping' ? 'animate-pulse-ring' : '')
        }
      >
        <img
          src={profile.avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <PlatformBadge platform={profile.platform} />
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.45); }
          50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
        }
        .animate-pulse-ring { animation: pulse-ring 1.8s ease-out infinite; }
      `}</style>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: TrackedProfile['platform'] }) {
  if (platform === 'instagram') {
    return (
      <span
        aria-label="Instagram"
        className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#E1306C] to-[#F77737] ring-2 ring-[#0F0F18]"
      >
        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22C21.83 8.4 21.85 8.78 21.85 12s-.02 3.6-.09 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.07-1.65.07-4.85.07s-3.6-.02-4.85-.09c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.6 2.15 15.22 2.15 12s.02-3.6.09-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.17 8.78 2.15 12 2.2zm0 1.8c-3.16 0-3.53.01-4.77.07-1.07.05-1.65.22-2.04.37-.51.2-.88.44-1.27.83a3.2 3.2 0 0 0-.83 1.27c-.15.39-.32.97-.37 2.04C2.66 9.47 2.65 9.84 2.65 12s.01 2.53.07 3.77c.05 1.07.22 1.65.37 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.32 2.04.37 1.24.06 1.61.07 4.77.07s3.53-.01 4.77-.07c1.07-.05 1.65-.22 2.04-.37a3.2 3.2 0 0 0 1.27-.83 3.2 3.2 0 0 0 .83-1.27c.15-.39.32-.97.37-2.04.06-1.24.07-1.61.07-4.77s-.01-3.53-.07-4.77c-.05-1.07-.22-1.65-.37-2.04a3.2 3.2 0 0 0-.83-1.27 3.2 3.2 0 0 0-1.27-.83c-.39-.15-.97-.32-2.04-.37C15.53 4.01 15.16 4 12 4zm0 3.06A4.94 4.94 0 1 1 12 17a4.94 4.94 0 0 1 0-9.94zm0 1.8A3.14 3.14 0 1 0 12 15.2a3.14 3.14 0 0 0 0-6.34zm5.1-2.04a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z" />
        </svg>
      </span>
    )
  }
  return (
    <span
      aria-label="TikTok"
      className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black ring-2 ring-[#0F0F18]"
    >
      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.6 7.3a6.4 6.4 0 0 1-4.1-1.5v8.6a5.3 5.3 0 1 1-4.7-5.3v2.2a3.1 3.1 0 1 0 2.5 3v-11h2.3a4.1 4.1 0 0 0 4 3.6v0z" />
      </svg>
    </span>
  )
}

function NewBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-[1px] text-[9.5px] font-medium uppercase tracking-wider text-cyan-200"
      aria-label="Newly added"
    >
      <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
      New
    </span>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
        <span className="text-slate-600">{icon}</span>
        {label}
      </span>
      <span className="mt-0.5 font-medium text-[14px] text-slate-100 tabular-nums">
        {value}
      </span>
    </div>
  )
}

function EngagementChip({ rate }: { rate: number }) {
  const tier = rate >= 7 ? 'hot' : rate >= 4 ? 'mid' : 'low'
  const styles =
    tier === 'hot'
      ? 'bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-500/25'
      : tier === 'mid'
      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-inset ring-cyan-500/25'
      : 'bg-slate-700/30 text-slate-300 ring-1 ring-inset ring-slate-600/30'
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium ' + styles}>
      <span
        aria-hidden
        className={
          'h-1.5 w-1.5 rounded-full ' +
          (tier === 'hot'
            ? 'bg-violet-300'
            : tier === 'mid'
            ? 'bg-cyan-300'
            : 'bg-slate-400')
        }
      />
      <span className="tabular-nums">{rate.toFixed(2)}%</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">eng</span>
    </span>
  )
}

function StatusLine({
  profile,
  onRetryScrape,
  stop,
}: {
  profile: TrackedProfile
  onRetryScrape?: () => void
  stop: (e: React.MouseEvent | React.KeyboardEvent) => void
}) {
  if (!profile.isActive) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-amber-200/90">
        <Pause className="h-3 w-3" strokeWidth={2} />
        Paused
      </span>
    )
  }
  if (profile.scrapeStatus === 'scraping') {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-violet-200">
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
        Scraping…
      </span>
    )
  }
  if (profile.scrapeStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-rose-200">
        <AlertTriangle className="h-3 w-3" strokeWidth={2} />
        Failed
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            onRetryScrape?.()
          }}
          className="ml-0.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-[1px] text-[10.5px] font-medium uppercase tracking-wider text-rose-100 hover:bg-rose-500/20"
        >
          Retry
        </button>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
      {profile.lastScrapedAt ? formatRelative(profile.lastScrapedAt) : 'Awaiting first scrape'}
    </span>
  )
}

function IconAction({
  label,
  onClick,
  disabled = false,
  destructive = false,
  children,
}: {
  label: string
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        'group/btn flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ' +
        (destructive
          ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-200'
          : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-100') +
        ' disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
      }
    >
      {children}
    </button>
  )
}

/* ---------------------------------- helpers -------------------------------- */

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K'
  return String(n)
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  return `${mo}mo ago`
}
