import { Lock, Bell, Palette, Shield, type LucideIcon } from 'lucide-react'
import type {
  SettingsTab,
  SettingsTabId,
  TabIconName,
} from '../types'

export interface SettingsNavProps {
  tabs: SettingsTab[]
  activeTab: SettingsTabId
  onTabChange?: (id: SettingsTabId) => void
}

const ICON_MAP: Record<TabIconName, LucideIcon> = {
  lock: Lock,
  bell: Bell,
  palette: Palette,
  shield: Shield,
}

export function SettingsNav({ tabs, activeTab, onTabChange }: SettingsNavProps) {
  return (
    <nav aria-label="Settings sections" className="lg:sticky lg:top-[80px] lg:self-start">
      {/* Horizontal scroll strip on mobile */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {tabs.map((tab) => {
          const Icon = ICON_MAP[tab.icon]
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              aria-pressed={active}
              className={
                'group relative flex shrink-0 items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 ' +
                (active
                  ? 'bg-violet-500/10 text-violet-100 shadow-[0_0_24px_-12px_rgba(124,58,237,0.5)]'
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200')
              }
            >
              <span
                aria-hidden
                className={
                  'absolute left-0 top-1/2 hidden h-5 w-[2px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 transition-opacity duration-150 lg:block ' +
                  (active ? 'opacity-100' : 'opacity-0')
                }
              />
              <span
                className={
                  'mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#1E1E2E] bg-[#16161F] transition-colors duration-150 ' +
                  (active ? 'text-violet-300' : 'text-slate-500 group-hover:text-slate-300')
                }
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
              <span className="hidden min-w-0 flex-1 lg:block">
                <span className="block text-[13px] font-medium tracking-tight">
                  {tab.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                  {tab.description}
                </span>
              </span>
              <span className="text-[13px] font-medium tracking-tight lg:hidden">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
