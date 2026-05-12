import { Trophy, Heart, MessageCircle, Eye, Bookmark } from 'lucide-react'
import type { ProfilePost } from '../types'

export interface TopPostHighlightProps {
  post: ProfilePost
  onClick?: () => void
}

export function TopPostHighlight({ post, onClick }: TopPostHighlightProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0F0F18]/85 backdrop-blur-xl">
      {/* Trophy ribbon */}
      <div className="flex items-center justify-between border-b border-[#1A1A24] bg-amber-500/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-amber-200">
            Top post
          </h2>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-amber-300/80">
          {post.engagementRate.toFixed(2)}% eng
        </span>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 80% at 30% 20%, hsla(${post.thumbnailHue}, 80%, 55%, 0.55), transparent 60%), radial-gradient(100% 100% at 80% 80%, hsla(${(post.thumbnailHue + 40) % 360}, 75%, 50%, 0.45), transparent 60%), #0F0F18`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.7'/></svg>\")",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3">
            <p className="line-clamp-2 text-[12.5px] leading-snug text-slate-100">
              {post.caption}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-px overflow-hidden border-t border-[#1A1A24] bg-[#1A1A24]">
          <Metric icon={<Heart className="h-3 w-3 text-rose-400" />} value={formatCount(post.likes)} label="Likes" />
          <Metric icon={<MessageCircle className="h-3 w-3 text-cyan-300" />} value={formatCount(post.comments)} label="Comments" />
          {post.views > 0 ? (
            <Metric icon={<Eye className="h-3 w-3 text-violet-300" />} value={formatCount(post.views)} label="Views" />
          ) : (
            <Metric icon={<Bookmark className="h-3 w-3 text-amber-300" />} value={formatCount(post.saves)} label="Saves" />
          )}
          <Metric value={formatRelative(post.postedAt)} label="Posted" plain />
        </div>
      </button>
    </section>
  )
}

function Metric({
  icon,
  value,
  label,
  plain = false,
}: {
  icon?: React.ReactNode
  value: string
  label: string
  plain?: boolean
}) {
  return (
    <div className="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5 text-center">
      <span className={'flex items-center gap-1 text-[13px] font-medium tabular-nums ' + (plain ? 'text-slate-300' : 'text-slate-100')}>
        {icon}
        {value}
      </span>
      <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  )
}

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
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}
