import { useMemo } from 'react'
import {
  LayoutDashboard,
  Images,
  Flame,
  Users,
  UserCircle2,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  isActive?: boolean
  badge?: string | number
}

export interface MainNavProps {
  items: NavItem[]
  collapsed?: boolean
  onToggleCollapsed?: () => void
  onNavigate?: (href: string) => void
}

const ICONS: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/posts': Images,
  '/trending': Flame,
  '/tracked': Users,
  '/profile': UserCircle2,
  '/settings': Settings,
}

const PRIMARY_HREFS = new Set(['/dashboard', '/posts', '/trending', '/tracked'])

export function MainNav({ items, collapsed = false, onToggleCollapsed, onNavigate }: MainNavProps) {
  const { primary, secondary } = useMemo(() => {
    const primary: NavItem[] = []
    const secondary: NavItem[] = []
    for (const item of items) {
      if (PRIMARY_HREFS.has(item.href)) primary.push(item)
      else secondary.push(item)
    }
    return { primary, secondary }
  }, [items])

  return (
    <nav
      aria-label="Primary"
      className="flex h-full flex-col"
    >
      {/* Brand row */}
      <div className="flex items-center justify-between px-3 pt-4 pb-3">
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault()
            onNavigate?.('/dashboard')
          }}
          className="group flex items-center gap-2.5 overflow-hidden"
        >
          <span
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_24px_rgba(124,58,237,0.45)]"
            aria-hidden
          >
            <span className="absolute inset-[2px] rounded-[8px] bg-[#0A0A0F]" />
            <span className="relative h-2 w-2 rounded-full bg-gradient-to-br from-violet-300 to-cyan-300 shadow-[0_0_8px_rgba(124,58,237,0.9)]" />
          </span>
          <span
            className={
              'flex flex-col leading-tight transition-all duration-200 ' +
              (collapsed ? 'pointer-events-none w-0 -translate-x-2 opacity-0' : 'w-auto opacity-100')
            }
          >
            <span className="text-[15px] font-semibold tracking-tight text-slate-100">
              PulseTrack
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              v0.1 · beta
            </span>
          </span>
        </a>

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 ' +
            'transition-all duration-200 hover:bg-white/5 hover:text-slate-100 ' +
            (collapsed ? 'absolute right-2 top-4' : '')
          }
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Search affordance (icon-only when collapsed) */}
      <div className="px-3 pb-3">
        <button
          type="button"
          className={
            'group flex w-full items-center gap-2.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] ' +
            'px-2.5 py-2 text-left transition-all duration-200 hover:border-violet-500/40 hover:bg-[#13131E] ' +
            (collapsed ? 'justify-center' : '')
          }
        >
          <svg
            className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          {!collapsed && (
            <>
              <span className="flex-1 text-[13px] text-slate-500">Search profiles, posts…</span>
              <kbd className="font-mono rounded border border-[#252535] bg-[#16161F] px-1.5 py-0.5 text-[10px] text-slate-500">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Primary nav */}
      <div className="px-3">
        {!collapsed && (
          <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {primary.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>

      {/* Spacer pushes secondary + footer down */}
      <div className="flex-1" />

      {/* Secondary nav */}
      <div className="px-3 pb-2">
        <div className={'mx-2 mb-2 h-px bg-[#1E1E2E] ' + (collapsed ? 'mx-3' : '')} />
        {!collapsed && (
          <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            Account
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {secondary.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </nav>
  )
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: (href: string) => void
}) {
  const Icon = ICONS[item.href] ?? LayoutDashboard
  const active = !!item.isActive

  return (
    <li className="relative">
      <a
        href={item.href}
        onClick={(e) => {
          e.preventDefault()
          onNavigate?.(item.href)
        }}
        aria-current={active ? 'page' : undefined}
        className={
          'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 ' +
          'transition-all duration-200 ' +
          (active
            ? 'bg-violet-500/10 text-violet-100 shadow-[0_0_24px_-8px_rgba(124,58,237,0.55)]'
            : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-100') +
          (collapsed ? ' justify-center' : '')
        }
      >
        {/* Active indicator bar */}
        <span
          aria-hidden
          className={
            'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 transition-opacity duration-200 ' +
            (active ? 'opacity-100' : 'opacity-0')
          }
        />
        <Icon
          className={
            'h-[18px] w-[18px] shrink-0 transition-colors duration-200 ' +
            (active ? 'text-violet-300' : 'text-slate-500 group-hover:text-slate-200')
          }
          strokeWidth={active ? 2.2 : 1.75}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-[13.5px] font-medium tracking-tight">
              {item.label}
            </span>
            {item.badge != null && (
              <span
                className={
                  'font-mono rounded-md px-1.5 py-[1px] text-[10px] ' +
                  (active
                    ? 'bg-violet-500/25 text-violet-100'
                    : 'bg-white/[0.04] text-slate-400')
                }
              >
                {item.badge}
              </span>
            )}
          </>
        )}

        {/* Collapsed-state tooltip */}
        {collapsed && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-[calc(100%+12px)] z-50 whitespace-nowrap rounded-md border border-[#252535] bg-[#16161F] px-2 py-1 text-[12px] text-slate-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
          >
            {item.label}
          </span>
        )}
      </a>
    </li>
  )
}
