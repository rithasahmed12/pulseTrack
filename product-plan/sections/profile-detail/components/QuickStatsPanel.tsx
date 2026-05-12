import { Heart, MessageCircle, Eye, CalendarDays, Clock } from 'lucide-react'
import type { QuickStat } from '../types'

export interface QuickStatsPanelProps {
  stats: QuickStat[]
}

const ICONS: Record<string, React.ReactNode> = {
  'avg likes': <Heart className="h-3.5 w-3.5 text-rose-400" strokeWidth={1.8} />,
  'avg comments': <MessageCircle className="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />,
  'avg reel plays': <Eye className="h-3.5 w-3.5 text-violet-300" strokeWidth={1.8} />,
  'avg views': <Eye className="h-3.5 w-3.5 text-violet-300" strokeWidth={1.8} />,
  'best posting day': <CalendarDays className="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />,
  'best posting hour': <Clock className="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />,
}

export function QuickStatsPanel({ stats }: QuickStatsPanelProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
      <div className="border-b border-[#1A1A24] px-4 py-3">
        <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
          Quick stats
        </h2>
        <p className="text-[11.5px] text-slate-500">Per-post averages and best posting cadence.</p>
      </div>
      <ul>
        {stats.map((s, idx) => {
          const icon = ICONS[s.label.toLowerCase()] ?? (
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          )
          return (
            <li
              key={s.label}
              className={
                'flex items-center justify-between px-4 py-2.5 ' +
                (idx > 0 ? 'border-t border-[#1A1A24]' : '')
              }
            >
              <span className="flex items-center gap-2 text-[12.5px] text-slate-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#1E1E2E] bg-[#16161F]">
                  {icon}
                </span>
                {s.label}
              </span>
              <span className="font-medium text-[13px] text-slate-100 tabular-nums">
                {s.formattedValue}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
