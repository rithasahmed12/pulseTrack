import { useEffect, useState, type ReactNode } from 'react'
import { Bell, Menu, Search } from 'lucide-react'
import { MainNav, type NavItem } from './MainNav'
import { UserMenu, type UserMenuUser } from './UserMenu'

export interface AppShellProps {
  children: ReactNode
  navigationItems?: NavItem[]
  user?: UserMenuUser
  pageTitle?: string
  pageEyebrow?: string
  notificationCount?: number
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

const DEFAULT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', isActive: true },
  { label: 'Posts', href: '/posts', badge: 1284 },
  { label: 'Trending', href: '/trending' },
  { label: 'Tracked', href: '/tracked', badge: 9 },
  { label: 'App Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
]

const DEFAULT_USER: UserMenuUser = {
  name: 'Alex Morgan',
  handle: '@alex.morgan',
}

export function AppShell({
  children,
  navigationItems = DEFAULT_NAV,
  user = DEFAULT_USER,
  pageTitle,
  pageEyebrow = 'Workspace',
  notificationCount = 3,
  onNavigate,
  onLogout,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeItem = navigationItems.find((i) => i.isActive)
  const computedTitle = pageTitle ?? activeItem?.label ?? 'Dashboard'

  // Close mobile drawer when navigating
  function handleNavigate(href: string) {
    setMobileOpen(false)
    onNavigate?.(href)
  }

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mobileOpen])

  return (
    <div
      className="dark relative min-h-screen overflow-hidden bg-[#0A0A0F] text-slate-200"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontFeatureSettings: '"ss01", "cv11"',
        // Override --font-mono locally so `font-mono` utility uses JetBrains Mono
        // when consumed inside Design OS (which sets IBM Plex Mono globally).
        ['--font-mono' as string]:
          '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      {/* Ambient background — subtle aurora wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[35%] h-[420px] w-[420px] rounded-full bg-fuchsia-600/8 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar (desktop) */}
        <aside
          aria-label="Sidebar"
          className={
            'hidden shrink-0 border-r border-[#1E1E2E] bg-[#0B0B12]/85 backdrop-blur-xl ' +
            'transition-[width] duration-300 ease-out lg:flex lg:flex-col ' +
            (collapsed ? 'lg:w-[68px]' : 'lg:w-[240px]')
          }
        >
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
              <MainNav
                items={navigationItems}
                collapsed={collapsed}
                onToggleCollapsed={() => setCollapsed((v) => !v)}
                onNavigate={handleNavigate}
              />
            </div>
            <div className="border-t border-[#1E1E2E]/70">
              <UserMenu
                user={user}
                variant="sidebar"
                collapsed={collapsed}
                onNavigate={handleNavigate}
                onLogout={onLogout}
              />
            </div>
          </div>
        </aside>

        {/* Sidebar (mobile drawer) */}
        {mobileOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <aside
              aria-label="Sidebar"
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#1E1E2E] bg-[#0B0B12] backdrop-blur-xl lg:hidden"
            >
              <div className="flex-1 overflow-y-auto">
                <MainNav
                  items={navigationItems}
                  collapsed={false}
                  onNavigate={handleNavigate}
                />
              </div>
              <div className="border-t border-[#1E1E2E]/70">
                <UserMenu
                  user={user}
                  variant="sidebar"
                  collapsed={false}
                  onNavigate={handleNavigate}
                  onLogout={onLogout}
                />
              </div>
            </aside>
          </>
        )}

        {/* Main column */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Top header */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[#1E1E2E] bg-[#0A0A0F]/75 px-4 backdrop-blur-xl sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="hidden min-w-0 sm:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  {pageEyebrow}
                </p>
                <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-100">
                  {computedTitle}
                </h1>
              </div>

              {/* Global search */}
              <div className="relative ml-auto hidden w-full max-w-md md:block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search profiles, posts, hashtags…"
                  className="h-9 w-full rounded-lg border border-[#1E1E2E] bg-[#0F0F18] pl-9 pr-14 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-[#13131E] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
                />
                <kbd className="font-mono pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#252535] bg-[#16161F] px-1.5 py-0.5 text-[10px] text-slate-500">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-100 md:hidden"
              >
                <Search className="h-4 w-4" />
              </button>

              <NotificationBell count={notificationCount} />

              <div className="mx-1.5 hidden h-6 w-px bg-[#1E1E2E] sm:block" />

              <UserMenu
                user={user}
                variant="header"
                onNavigate={handleNavigate}
                onLogout={onLogout}
              />
            </div>
          </header>

          {/* Content scroll area */}
          <main className="relative flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Inline keyframes for subtle pulse used by NotificationBell */}
      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}

function NotificationBell({ count }: { count: number }) {
  return (
    <button
      type="button"
      aria-label={`Notifications${count ? ` (${count} unread)` : ''}`}
      className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-slate-100"
    >
      <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {count > 0 && (
        <>
          <span
            className="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-rose-400"
            style={{ animation: 'pulse-soft 2.4s ease-in-out infinite' }}
            aria-hidden
          />
          <span className="font-mono absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/90 px-1 text-[9px] font-semibold text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]">
            {count > 9 ? '9+' : count}
          </span>
        </>
      )}
    </button>
  )
}

export default AppShell
