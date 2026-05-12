import { useEffect, useMemo, useState } from 'react'
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Activity,
  ExternalLink,
  Camera,
  Layers,
  Video,
} from 'lucide-react'
import type { Post } from '../types'

export interface PostDetailModalProps {
  post: Post | null
  onClose?: () => void
  onHashtagClick?: (tag: string) => void
}

export function PostDetailModal({ post, onClose, onHashtagClick }: PostDetailModalProps) {
  // Body scroll lock + escape
  useEffect(() => {
    if (!post) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [post, onClose])

  if (!post) return null

  const TypeIcon =
    post.postType === 'photo'
      ? Camera
      : post.postType === 'carousel'
      ? Layers
      : Video

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-detail-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[100vh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-2xl border border-[#1E1E2E] bg-[#0F0F18]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* Top hairline */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#1A1A24] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <PlatformBadge platform={post.platform} />
              <span className="inline-flex items-center gap-1 rounded-md bg-[#16161F] px-1.5 py-[2px] text-[10px] font-medium uppercase tracking-wider text-slate-300 ring-1 ring-inset ring-[#1E1E2E]">
                <TypeIcon className="h-2.5 w-2.5" strokeWidth={2} />
                {post.postType}
              </span>
            </div>
            <div className="min-w-0">
              <p
                id="post-detail-title"
                className="truncate text-[13.5px] font-medium text-slate-100"
              >
                @{post.profileUsername}
                <span className="ml-1 text-slate-500"> · {post.profileDisplayName}</span>
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
                {formatLong(post.postedAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body — two columns on lg+ */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1.1fr_1fr]">
          {/* Left — hero + caption */}
          <div className="flex flex-col">
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-auto lg:flex-1">
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
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.7'/></svg>\")",
                }}
              />
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-black/55 px-2 py-[3px] text-[11px] font-medium text-violet-100 backdrop-blur">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                <span className="tabular-nums">{post.engagementRate.toFixed(2)}%</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-violet-200/80">eng</span>
              </div>
            </div>

            <div className="border-t border-[#1A1A24] p-4 sm:p-5">
              <p className="text-[13.5px] leading-relaxed text-slate-200">
                {post.caption}
              </p>
              {post.hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.hashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onHashtagClick?.(tag)}
                      className="rounded-full bg-violet-500/10 px-2 py-[2px] text-[11.5px] font-medium text-violet-200 ring-1 ring-inset ring-violet-500/20 transition-colors duration-150 hover:bg-violet-500/20 hover:text-violet-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — metrics + chart + meta */}
          <div className="flex flex-col border-t border-[#1A1A24] lg:border-l lg:border-t-0">
            {/* Metrics grid — always 6 tiles, dashes for N/A */}
            <div className="grid grid-cols-3 gap-px overflow-hidden border-b border-[#1A1A24] bg-[#1A1A24]">
              <MetricTile
                icon={<Heart className="h-3.5 w-3.5 text-rose-400" />}
                value={formatCount(post.likes)}
                label="Likes"
              />
              <MetricTile
                icon={<MessageCircle className="h-3.5 w-3.5 text-cyan-300" />}
                value={formatCount(post.comments)}
                label="Comments"
              />
              <MetricTile
                icon={<Eye className="h-3.5 w-3.5 text-violet-300" />}
                value={post.views > 0 ? formatCount(post.views) : '—'}
                label="Views"
                dim={post.views === 0}
              />
              <MetricTile
                icon={<Share2 className="h-3.5 w-3.5 text-slate-300" />}
                value={post.shares > 0 ? formatCount(post.shares) : '—'}
                label="Shares"
                dim={post.shares === 0}
              />
              <MetricTile
                icon={<Bookmark className="h-3.5 w-3.5 text-amber-300" />}
                value={post.saves > 0 ? formatCount(post.saves) : '—'}
                label="Saves"
                dim={post.saves === 0}
              />
              <MetricTile
                icon={<Activity className="h-3.5 w-3.5 text-violet-200" />}
                value={`${post.engagementRate.toFixed(2)}%`}
                label="Engagement"
                accent
              />
            </div>

            {/* Engagement chart */}
            <div className="border-b border-[#1A1A24] p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[12.5px] font-semibold tracking-tight text-slate-100">
                  Engagement · first 7 days
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  peak {peakDay(post.engagementOverTime)}d
                </span>
              </div>
              <MiniLineChart series={post.engagementOverTime} />
            </div>

            {/* Meta + open link */}
            <div className="flex-1 p-4 sm:p-5">
              <a
                href={
                  post.platform === 'instagram'
                    ? `https://instagram.com/${post.profileUsername}`
                    : `https://tiktok.com/@${post.profileUsername}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-2.5 py-1.5 text-[12px] text-slate-300 hover:border-violet-500/30 hover:text-slate-100"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
                Open on {post.platform === 'instagram' ? 'Instagram' : 'TikTok'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- pieces -------------------------------- */

function PlatformBadge({ platform }: { platform: Post['platform'] }) {
  if (platform === 'instagram') {
    return (
      <span className="rounded-md bg-gradient-to-br from-[#E1306C] to-[#F77737] px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wider text-white">
        IG
      </span>
    )
  }
  return (
    <span className="rounded-md bg-black px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/15">
      TT
    </span>
  )
}

function MetricTile({
  icon,
  value,
  label,
  accent = false,
  dim = false,
}: {
  icon: React.ReactNode
  value: string
  label: string
  accent?: boolean
  dim?: boolean
}) {
  return (
    <div className="flex flex-col items-start bg-[#0F0F18] px-3 py-3">
      <span className={'flex items-center gap-1.5 ' + (dim ? 'opacity-40' : '')}>
        {icon}
        <span
          className={
            'font-semibold text-[14px] leading-none tabular-nums ' +
            (accent ? 'text-violet-200' : 'text-slate-50')
          }
        >
          {value}
        </span>
      </span>
      <span
        className={
          'mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] ' +
          (dim ? 'text-slate-600' : 'text-slate-500')
        }
      >
        {label}
      </span>
    </div>
  )
}

function MiniLineChart({ series }: { series: Post['engagementOverTime'] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const { width, height, padding } = useMemo(
    () => ({ width: 360, height: 100, padding: { l: 4, r: 4, t: 8, b: 14 } }),
    [],
  )

  const { points, xStep } = useMemo(() => {
    const ys = series.map((p) => p.value)
    let yMin = Math.min(...ys)
    let yMax = Math.max(...ys)
    const range = yMax - yMin || 1
    yMin = yMin - range * 0.15
    yMax = yMax + range * 0.2
    const plotW = width - padding.l - padding.r
    const plotH = height - padding.t - padding.b
    const xStep = series.length > 1 ? plotW / (series.length - 1) : 0
    const points = series.map((p, i) => ({
      x: padding.l + i * xStep,
      y: padding.t + plotH - ((p.value - yMin) / (yMax - yMin)) * plotH,
      raw: p,
    }))
    return { points, xStep }
  }, [series, width, height, padding])

  const linePath = points
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ')
  const fillPath = `${linePath} L${points[points.length - 1].x},${height - padding.b} L${padding.l},${height - padding.b} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block h-[100px] w-full"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * width - padding.l
        const idx = Math.round(x / Math.max(1, xStep))
        setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)))
      }}
      onMouseLeave={() => setHoverIdx(null)}
      role="img"
      aria-label="Engagement over the first 7 days"
    >
      <defs>
        <linearGradient id="mini-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
        </linearGradient>
      </defs>

      <path d={fillPath} fill="url(#mini-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="#7C3AED"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.5))' }}
      />

      {/* Day ticks at bottom */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={height - 3}
          textAnchor="middle"
          fontSize={8}
          fill="rgba(148,163,184,0.55)"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
        >
          d{i + 1}
        </text>
      ))}

      {hoverIdx != null && points[hoverIdx] && (
        <g>
          <line
            x1={points[hoverIdx].x}
            x2={points[hoverIdx].x}
            y1={padding.t}
            y2={height - padding.b}
            stroke="rgba(241,245,249,0.18)"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <circle
            cx={points[hoverIdx].x}
            cy={points[hoverIdx].y}
            r={3.5}
            fill="#7C3AED"
            stroke="#0F0F18"
            strokeWidth={1.5}
          />
          <text
            x={points[hoverIdx].x}
            y={points[hoverIdx].y - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#F1F5F9"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            fontWeight={600}
          >
            {points[hoverIdx].raw.value.toFixed(2)}%
          </text>
        </g>
      )}
    </svg>
  )
}

function peakDay(series: Post['engagementOverTime']): number {
  let bestIdx = 0
  for (let i = 1; i < series.length; i++) {
    if (series[i].value > series[bestIdx].value) bestIdx = i
  }
  return series[bestIdx].day
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K'
  return String(n)
}

function formatLong(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
