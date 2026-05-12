import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Hash } from 'lucide-react'
import type { TrendingHashtag } from '../types'

export interface HashtagBlockProps {
  hashtags: TrendingHashtag[]
  onHashtagClick?: (tag: string) => void
}

export function HashtagBlock({ hashtags, onHashtagClick }: HashtagBlockProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const maxUsage = Math.max(...hashtags.map((h) => h.usageCount))

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-[#1A1A24] px-4 py-3">
        <Hash className="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
        <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
          Trending hashtags
        </h2>
        <span className="ml-auto font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
          Last 24h
        </span>
      </div>

      <div className="grid gap-px bg-[#1A1A24] md:grid-cols-[1.2fr_1fr]">
        {/* Tag cloud */}
        <div className="bg-[#0F0F18] p-4">
          <p className="font-mono mb-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Cloud
          </p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            {hashtags.map((h) => {
              const fontSize = 11 + h.weight * 18 // 11px – 29px
              const isHovered = hovered === h.tag
              const rising = h.growthPercent >= 0
              const intensity = Math.min(Math.abs(h.growthPercent), 300) / 300
              const color = rising
                ? `rgba(${168 - intensity * 60}, ${158 + intensity * 40}, ${237}, ${0.6 + intensity * 0.4})`
                : `rgba(${248}, ${113 - intensity * 30}, ${133 - intensity * 30}, ${0.55 + intensity * 0.35})`
              return (
                <button
                  key={h.tag}
                  type="button"
                  onClick={() => onHashtagClick?.(h.tag)}
                  onMouseEnter={() => setHovered(h.tag)}
                  onMouseLeave={() => setHovered(null)}
                  className={
                    'inline-flex items-baseline rounded transition-all duration-150 ' +
                    (isHovered ? 'scale-105' : '')
                  }
                  style={{
                    fontSize: `${fontSize}px`,
                    color,
                    fontWeight: 500 + Math.round(h.weight * 200),
                    lineHeight: 1.05,
                    letterSpacing: '-0.01em',
                    textShadow: isHovered ? `0 0 12px ${color}` : 'none',
                  }}
                >
                  {h.tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ranked list */}
        <div className="bg-[#0F0F18]">
          <p className="font-mono px-4 pt-4 text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Top 20 · sorted by usage
          </p>
          <ol className="mt-2 max-h-[420px] overflow-y-auto px-2 pb-3">
            {hashtags.map((h, i) => {
              const pct = h.usageCount / maxUsage
              const rising = h.growthPercent >= 0
              const isHovered = hovered === h.tag
              return (
                <li key={h.tag}>
                  <button
                    type="button"
                    onClick={() => onHashtagClick?.(h.tag)}
                    onMouseEnter={() => setHovered(h.tag)}
                    onMouseLeave={() => setHovered(null)}
                    className={
                      'group/row relative flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors duration-100 ' +
                      (isHovered
                        ? 'bg-white/[0.04]'
                        : 'hover:bg-white/[0.03]')
                    }
                  >
                    <span className="font-mono w-6 shrink-0 text-[10px] text-slate-600 tabular-nums">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span
                      className={
                        'flex-1 truncate text-[13px] ' +
                        (isHovered ? 'text-slate-100' : 'text-slate-300')
                      }
                    >
                      {h.tag}
                    </span>
                    {/* Usage bar */}
                    <span className="relative hidden h-1 w-16 overflow-hidden rounded-full bg-[#1A1A24] sm:inline-block">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500/70 to-cyan-400/60"
                        style={{ width: `${pct * 100}%` }}
                      />
                    </span>
                    <span className="font-mono shrink-0 text-[11px] text-slate-500 tabular-nums">
                      {formatCount(h.usageCount)}
                    </span>
                    <span
                      className={
                        'inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-[1px] text-[10px] font-medium ring-1 ring-inset tabular-nums ' +
                        (rising
                          ? 'bg-emerald-500/10 ring-emerald-500/25 text-emerald-300'
                          : 'bg-rose-500/10 ring-rose-500/25 text-rose-300')
                      }
                    >
                      {rising ? (
                        <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.2} />
                      ) : (
                        <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={2.2} />
                      )}
                      {Math.abs(h.growthPercent)}%
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K'
  return String(n)
}
