import { Crown, ArrowUpRight, Activity, Flame } from 'lucide-react'
import type { TrendingPost } from '../types'

export interface TrendingPostRowProps {
  post: TrendingPost
  rank: number
  onClick?: () => void
}

export function TrendingPostRow({ post, rank, onClick }: TrendingPostRowProps) {
  const isTop = rank === 1
  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open trending post by ${post.profileDisplayName}`}
      className={
        'group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border bg-[#0F0F18] px-3 py-2.5 ' +
        'transition-all duration-200 hover:-translate-y-px ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ' +
        (isTop
          ? 'border-amber-500/30 hover:border-amber-400/50 shadow-[0_0_28px_-14px_rgba(245,158,11,0.55)]'
          : 'border-[#1E1E2E] hover:border-violet-500/30')
      }
    >
      {isTop && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), rgba(124,58,237,0.4), transparent)',
          }}
        />
      )}

      {/* Rank */}
      <div className="flex w-9 shrink-0 flex-col items-center sm:w-12">
        {isTop ? (
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-inset ring-amber-500/40">
            <Crown className="h-3.5 w-3.5 text-amber-300" strokeWidth={2} />
          </span>
        ) : (
          <span className="font-mono text-[16px] font-semibold text-slate-600 tabular-nums">
            {rank.toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background: `radial-gradient(120% 80% at 30% 20%, hsla(${post.thumbnailHue}, 80%, 55%, 0.55), transparent 60%), radial-gradient(100% 100% at 80% 80%, hsla(${(post.thumbnailHue + 40) % 360}, 75%, 50%, 0.45), transparent 60%), #0F0F18`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.7'/></svg>\")",
          }}
        />
        <div className="absolute left-1 top-1">
          <PlatformBadge platform={post.platform} />
        </div>
      </div>

      {/* Identity + caption */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          {isTop && (
            <span className="font-mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.18em] text-amber-300">
              <Flame className="h-2.5 w-2.5" strokeWidth={2.2} />
              Top mover
            </span>
          )}
          <p className="truncate text-[13.5px] font-medium text-slate-100">
            {post.profileDisplayName}
          </p>
          <p className="truncate font-mono text-[11px] text-slate-500">
            @{post.profileUsername}
          </p>
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-slate-400">
          {post.caption}
        </p>
      </div>

      {/* Metrics cluster (hidden on very narrow) */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <VelocityChip percent={post.velocityPercent} />
        <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/25 bg-violet-500/[0.07] px-1.5 py-[2px] text-[11px] font-medium text-violet-200">
          <Activity className="h-3 w-3" strokeWidth={2} />
          <span className="tabular-nums">{post.engagementRate.toFixed(2)}%</span>
        </span>
      </div>

      {/* Open affordance */}
      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-violet-300"
        strokeWidth={2}
      />
    </article>
  )
}

function VelocityChip({ percent }: { percent: number }) {
  const up = percent >= 0
  const intensity = Math.min(Math.abs(percent), 300) / 300 // 0–1
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-md px-1.5 py-[2px] text-[11px] font-medium ring-1 ring-inset ' +
        (up
          ? 'bg-emerald-500/10 ring-emerald-500/25 text-emerald-300'
          : 'bg-rose-500/10 ring-rose-500/25 text-rose-300')
      }
      style={{
        boxShadow: up
          ? `0 0 ${Math.round(intensity * 16)}px -4px rgba(52,211,153,${0.25 + intensity * 0.35})`
          : `0 0 ${Math.round(intensity * 16)}px -4px rgba(244,63,94,${0.25 + intensity * 0.35})`,
      }}
    >
      {up ? '↑' : '↓'}
      <span className="tabular-nums">
        {up ? '+' : '−'}
        {Math.abs(percent)}%
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">/24h</span>
    </span>
  )
}

function PlatformBadge({ platform }: { platform: TrendingPost['platform'] }) {
  if (platform === 'instagram') {
    return (
      <span className="rounded-sm bg-gradient-to-br from-[#E1306C] to-[#F77737] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-white">
        IG
      </span>
    )
  }
  return (
    <span className="rounded-sm bg-black px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/15">
      TT
    </span>
  )
}
