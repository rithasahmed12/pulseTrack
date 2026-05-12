import { Users, Image, TrendingUp, Hash, ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react'
import type {
  DashboardStat,
  StatIcon,
  StatTone,
} from '../types'

export interface StatCardProps {
  stat: DashboardStat
}

const ICON_MAP: Record<StatIcon, LucideIcon> = {
  users: Users,
  image: Image,
  'trending-up': TrendingUp,
  hash: Hash,
}

const TONE_MAP: Record<StatTone, { text: string; ring: string; glow: string }> = {
  violet: {
    text: 'text-violet-200',
    ring: 'from-violet-500/30 to-violet-500/0',
    glow: 'shadow-[0_0_30px_-14px_rgba(124,58,237,0.55)]',
  },
  cyan: {
    text: 'text-cyan-200',
    ring: 'from-cyan-500/30 to-cyan-500/0',
    glow: 'shadow-[0_0_30px_-14px_rgba(6,182,212,0.55)]',
  },
  amber: {
    text: 'text-amber-200',
    ring: 'from-amber-500/30 to-amber-500/0',
    glow: 'shadow-[0_0_30px_-14px_rgba(245,158,11,0.5)]',
  },
  rose: {
    text: 'text-rose-200',
    ring: 'from-rose-500/30 to-rose-500/0',
    glow: 'shadow-[0_0_30px_-14px_rgba(244,63,94,0.5)]',
  },
}

export function StatCard({ stat }: StatCardProps) {
  const Icon = ICON_MAP[stat.icon]
  const tone = TONE_MAP[stat.tone]
  const dir = stat.delta.direction

  const deltaIcon =
    dir === 'up' ? (
      <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />
    ) : dir === 'down' ? (
      <ArrowDownRight className="h-3 w-3" strokeWidth={2.2} />
    ) : (
      <Minus className="h-3 w-3" strokeWidth={2.2} />
    )

  const deltaClass =
    dir === 'up'
      ? 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20'
      : dir === 'down'
      ? 'text-rose-300 bg-rose-500/10 ring-rose-500/20'
      : 'text-slate-400 bg-white/[0.04] ring-white/10'

  return (
    <div
      className={
        'group relative overflow-hidden rounded-xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-4 backdrop-blur-xl ' +
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/25 ' +
        tone.glow
      }
    >
      <div
        aria-hidden
        className={'pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ' + tone.ring + ' blur-2xl'}
      />

      <div className="relative flex items-start justify-between">
        <span
          className={
            'flex h-7 w-7 items-center justify-center rounded-md border border-[#1E1E2E] bg-[#16161F] ' +
            tone.text
          }
          aria-hidden
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        </span>

        <span
          className={
            'inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[10.5px] font-medium ring-1 ring-inset ' +
            deltaClass
          }
          title={stat.delta.label}
        >
          {deltaIcon}
          <span className="tabular-nums">
            {dir === 'flat' ? '0' : Math.abs(stat.delta.value).toLocaleString()}
          </span>
        </span>
      </div>

      <p className="relative mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {stat.label}
      </p>
      <p className="relative mt-1 text-[26px] font-semibold leading-none tracking-tight text-slate-50 tabular-nums">
        {stat.formattedValue}
      </p>
      <p className="relative mt-1.5 text-[11.5px] text-slate-500">
        {stat.delta.label}
      </p>
    </div>
  )
}
