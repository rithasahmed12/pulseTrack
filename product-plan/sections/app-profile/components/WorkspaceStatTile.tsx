import { CalendarDays, Users, Image, type LucideIcon } from 'lucide-react'
import type {
  StatIconName,
  StatTone,
  WorkspaceStat,
} from '../types'

export interface WorkspaceStatTileProps {
  stat: WorkspaceStat
}

const ICON_MAP: Record<StatIconName, LucideIcon> = {
  calendar: CalendarDays,
  users: Users,
  image: Image,
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

export function WorkspaceStatTile({ stat }: WorkspaceStatTileProps) {
  const Icon = ICON_MAP[stat.icon]
  const tone = TONE_MAP[stat.tone]
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
      <div className="relative flex items-center justify-between">
        <span
          className={
            'flex h-7 w-7 items-center justify-center rounded-md border border-[#1E1E2E] bg-[#16161F] ' +
            tone.text
          }
          aria-hidden
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        </span>
      </div>
      <p className="relative mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {stat.label}
      </p>
      <p className="relative mt-1 text-[26px] font-semibold leading-none tracking-tight text-slate-50 tabular-nums">
        {stat.value}
      </p>
      <p className="relative mt-1.5 text-[11.5px] text-slate-500">{stat.footnote}</p>
    </div>
  )
}
