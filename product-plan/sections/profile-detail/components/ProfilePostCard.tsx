import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Activity,
  Camera,
  Layers,
  Video,
  Trophy,
} from 'lucide-react'
import type { ProfilePost } from '../types'

export interface ProfilePostCardProps {
  post: ProfilePost
  isTopPost?: boolean
  onClick?: () => void
}

export function ProfilePostCard({ post, isTopPost = false, onClick }: ProfilePostCardProps) {
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
      aria-label={`Open post`}
      className={
        'group relative cursor-pointer overflow-hidden rounded-xl border bg-[#0F0F18] ' +
        'transition-all duration-200 hover:-translate-y-0.5 ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ' +
        (isTopPost
          ? 'border-amber-500/30 hover:border-amber-400/50 shadow-[0_0_24px_-12px_rgba(245,158,11,0.45)]'
          : 'border-[#1E1E2E] hover:border-violet-500/30')
      }
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* synthetic thumbnail */}
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
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.7'/></svg>\")",
          }}
        />

        {/* Top chips */}
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <PostTypeBadge type={post.postType} />
          <EngagementChip rate={post.engagementRate} />
        </div>

        {isTopPost && (
          <span className="absolute left-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md bg-amber-500/85 px-1.5 py-[2px] text-[9.5px] font-semibold uppercase tracking-wider text-slate-900 ring-1 ring-inset ring-amber-300/40">
            <Trophy className="h-2.5 w-2.5" strokeWidth={2.4} />
            Top
          </span>
        )}

        {/* Hover overlay */}
        <div
          className={
            'pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent ' +
            'opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100'
          }
        >
          <div
            className="p-3"
            style={{
              transform: 'translateY(8px)',
              animation: 'pp-rise 0.25s ease-out forwards',
            }}
          >
            <p className="mb-2 line-clamp-2 text-[12px] leading-snug text-slate-200">
              {post.caption}
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10.5px] text-slate-300">
              <Metric icon={<Heart className="h-3 w-3" />} value={formatCount(post.likes)} label="Likes" />
              <Metric icon={<MessageCircle className="h-3 w-3" />} value={formatCount(post.comments)} label="Comments" />
              {post.shares > 0 && (
                <Metric icon={<Share2 className="h-3 w-3" />} value={formatCount(post.shares)} label="Shares" />
              )}
              {post.saves > 0 && (
                <Metric icon={<Bookmark className="h-3 w-3" />} value={formatCount(post.saves)} label="Saves" />
              )}
              {post.views > 0 && (
                <Metric icon={<Eye className="h-3 w-3" />} value={formatCount(post.views)} label="Views" />
              )}
              <Metric
                icon={<Activity className="h-3 w-3" />}
                value={`${post.engagementRate.toFixed(2)}%`}
                label="Engagement"
                accent
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pp-rise { to { transform: translateY(0); opacity: 1; } }`}</style>
    </article>
  )
}

function PostTypeBadge({ type }: { type: ProfilePost['postType'] }) {
  const ICONS: Record<ProfilePost['postType'], React.ReactNode> = {
    photo: <Camera className="h-2.5 w-2.5" strokeWidth={2} />,
    carousel: <Layers className="h-2.5 w-2.5" strokeWidth={2} />,
    video: <Video className="h-2.5 w-2.5" strokeWidth={2} />,
    reel: <Video className="h-2.5 w-2.5" strokeWidth={2} />,
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md bg-black/45 px-1.5 py-[2px] text-[9.5px] font-medium uppercase tracking-wider text-slate-100 ring-1 ring-inset ring-white/15 backdrop-blur"
    >
      {ICONS[type]}
      {type}
    </span>
  )
}

function EngagementChip({ rate }: { rate: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-black/55 px-1.5 py-[2px] text-[10px] font-medium text-violet-100 backdrop-blur">
      <span aria-hidden className="h-1 w-1 rounded-full bg-violet-300" />
      <span className="tabular-nums">{rate.toFixed(2)}%</span>
    </span>
  )
}

function Metric({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: React.ReactNode
  value: string
  label: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={'flex items-center gap-1 ' + (accent ? 'text-violet-200' : 'text-slate-400')}>
        {icon}
        <span className="font-medium tabular-nums">{value}</span>
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K'
  return String(n)
}
