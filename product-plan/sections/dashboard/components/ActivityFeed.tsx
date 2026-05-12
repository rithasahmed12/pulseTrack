import { Sparkles, Hash, RefreshCw, AlertTriangle, ArrowUpRight } from 'lucide-react'
import type {
  ActivityEvent,
  ActivityEventType,
  Platform,
} from '../types'

export interface ActivityFeedProps {
  events: ActivityEvent[]
  onProfileClick?: (event: ActivityEvent) => void
  onViewAllClick?: () => void
}

const TYPE_META: Record<
  ActivityEventType,
  { dot: string; ring: string; label: string; icon: React.ReactNode }
> = {
  new_post: {
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]',
    ring: 'ring-cyan-500/25',
    label: 'New post',
    icon: <Sparkles className="h-3 w-3" strokeWidth={2} />,
  },
  follower_spike: {
    dot: 'bg-violet-400 shadow-[0_0_8px_rgba(124,58,237,0.7)]',
    ring: 'ring-violet-500/25',
    label: 'Follower spike',
    icon: <ArrowUpRight className="h-3 w-3" strokeWidth={2} />,
  },
  trending_hashtag: {
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    ring: 'ring-amber-500/25',
    label: 'Trending tag',
    icon: <Hash className="h-3 w-3" strokeWidth={2} />,
  },
  scrape_complete: {
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    ring: 'ring-emerald-500/25',
    label: 'Scrape complete',
    icon: <RefreshCw className="h-3 w-3" strokeWidth={2} />,
  },
  scrape_failed: {
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    ring: 'ring-rose-500/25',
    label: 'Scrape failed',
    icon: <AlertTriangle className="h-3 w-3" strokeWidth={2} />,
  },
}

export function ActivityFeed({ events, onProfileClick, onViewAllClick }: ActivityFeedProps) {
  return (
    <section
      aria-label="Recent activity"
      className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.35), transparent)',
        }}
      />

      <div className="flex items-center justify-between border-b border-[#1A1A24] px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
            Recent activity
          </h2>
          <LivePulse />
        </div>
        {events.length > 0 && (
          <button
            type="button"
            onClick={onViewAllClick}
            className="text-[11.5px] text-slate-400 hover:text-violet-300"
          >
            View all
          </button>
        )}
      </div>

      <div className="relative">
        <ol className="max-h-[640px] overflow-y-auto px-4 py-3">
          {events.map((event, idx) => (
            <ActivityItem
              key={event.id}
              event={event}
              index={idx}
              isLast={idx === events.length - 1}
              onProfileClick={onProfileClick}
            />
          ))}
          {events.length === 0 && (
            <li className="px-2 py-8 text-center text-[12.5px] text-slate-500">
              No activity yet. New events stream in here as PulseTrack scrapes profiles.
            </li>
          )}
        </ol>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0F0F18] to-transparent"
        />
      </div>
    </section>
  )
}

function ActivityItem({
  event,
  index,
  isLast,
  onProfileClick,
}: {
  event: ActivityEvent
  index: number
  isLast: boolean
  onProfileClick?: (event: ActivityEvent) => void
}) {
  const meta = TYPE_META[event.type]
  const clickable = !!event.profileUsername

  return (
    <li
      className="relative flex gap-3 pb-3 last:pb-0"
      style={{ animation: `act-rise 0.4s ease-out ${Math.min(index, 12) * 0.04}s both` }}
    >
      {/* Timeline rail */}
      <div className="relative flex w-4 shrink-0 flex-col items-center">
        <span
          aria-hidden
          className={'mt-1.5 h-1.5 w-1.5 rounded-full ' + meta.dot}
        />
        {!isLast && (
          <span
            aria-hidden
            className="mt-1 w-px flex-1 bg-[#1E1E2E]"
          />
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={
              'inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[9.5px] font-medium uppercase tracking-wider text-slate-300 ring-1 ring-inset ' +
              meta.ring +
              ' bg-white/[0.03]'
            }
          >
            <span className="opacity-80">{meta.icon}</span>
            {meta.label}
          </span>
          {event.platform && <PlatformDot platform={event.platform} />}
          <span className="ml-auto shrink-0 font-mono text-[10px] text-slate-500 tabular-nums">
            {formatRelative(event.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-[12.5px] leading-snug text-slate-300">
          {renderMessage(event)}
        </p>
        {clickable && (
          <button
            type="button"
            onClick={() => onProfileClick?.(event)}
            className="mt-1 inline-flex items-center gap-0.5 text-[11px] text-violet-300/90 hover:text-violet-200"
          >
            Open profile
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
          </button>
        )}
      </div>
    </li>
  )
}

function renderMessage(event: ActivityEvent) {
  if (!event.profileUsername) return event.message
  const handle = `@${event.profileUsername}`
  const idx = event.message.indexOf(handle)
  if (idx === -1) return event.message
  return (
    <>
      {event.message.slice(0, idx)}
      <span className="font-medium text-slate-100">{handle}</span>
      {event.message.slice(idx + handle.length)}
    </>
  )
}

function PlatformDot({ platform }: { platform: Platform }) {
  if (platform === 'instagram') {
    return (
      <span className="rounded-sm bg-gradient-to-br from-[#E1306C] to-[#F77737] px-1 py-px text-[8.5px] font-semibold uppercase tracking-wider text-white">
        IG
      </span>
    )
  }
  return (
    <span className="rounded-sm bg-black px-1 py-px text-[8.5px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/15">
      TT
    </span>
  )
}

function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-wider text-emerald-200">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      Live
      <style>{`
        @keyframes act-rise {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </span>
  )
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d`
  const mo = Math.floor(d / 30)
  return `${mo}mo`
}
