import { Sparkles, TrendingUp, Hash, Mail, type LucideIcon } from 'lucide-react'
import { Switch } from './Switch'
import type {
  NotificationPreference,
  NotificationPrefIcon,
} from '../types'

export interface NotificationsPaneProps {
  preferences: NotificationPreference[]
  onToggle?: (id: string, enabled: boolean) => void
}

const ICON_MAP: Record<NotificationPrefIcon, LucideIcon> = {
  sparkles: Sparkles,
  'trending-up': TrendingUp,
  hash: Hash,
  mail: Mail,
}

const TONE_MAP: Record<string, string> = {
  new_post: 'text-cyan-300',
  follower_spike: 'text-violet-300',
  trending_hashtag: 'text-amber-300',
  weekly_report: 'text-emerald-300',
}

export function NotificationsPane({ preferences, onToggle }: NotificationsPaneProps) {
  return (
    <div className="space-y-3">
      {preferences.map((pref) => {
        const Icon = ICON_MAP[pref.icon]
        const tone = TONE_MAP[pref.id] ?? 'text-violet-300'
        return (
          <article
            key={pref.id}
            className="group relative flex items-start gap-3 rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-4 backdrop-blur-xl transition-colors duration-150 hover:border-violet-500/25"
          >
            <span
              className={
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1E1E2E] bg-[#16161F] ' +
                tone
              }
              aria-hidden
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium tracking-tight text-slate-100">
                {pref.label}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-slate-400">
                {pref.description}
              </p>
            </div>
            <div className="pt-0.5">
              <Switch
                checked={pref.enabled}
                onChange={(next) => onToggle?.(pref.id, next)}
                label={pref.label}
              />
            </div>
          </article>
        )
      })}
      <p className="pt-2 text-center text-[11.5px] text-slate-500">
        Email alerts go to the address on file.
      </p>
    </div>
  )
}
