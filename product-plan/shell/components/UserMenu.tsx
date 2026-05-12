import { useEffect, useRef, useState } from 'react'
import { UserCircle2, Settings, LogOut, ChevronDown } from 'lucide-react'

export interface UserMenuUser {
  name: string
  handle?: string
  avatarUrl?: string
}

export interface UserMenuProps {
  user: UserMenuUser
  variant?: 'header' | 'sidebar'
  collapsed?: boolean
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function UserMenu({
  user,
  variant = 'header',
  collapsed = false,
  onNavigate,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (variant === 'sidebar') {
    return (
      <div
        ref={rootRef}
        className={
          'relative mx-2 mb-3 mt-1 ' +
          (collapsed ? 'flex justify-center' : '')
        }
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={
            'group flex w-full items-center gap-3 rounded-xl border border-[#1E1E2E] bg-[#0F0F18] p-2 text-left ' +
            'transition-all duration-200 hover:border-violet-500/30 hover:bg-[#13131E] ' +
            (collapsed ? 'w-auto justify-center p-1.5' : '')
          }
        >
          <Avatar name={user.name} initials={initials} src={user.avatarUrl} />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-slate-100">
                  {user.name}
                </p>
                {user.handle && (
                  <p className="font-mono truncate text-[11px] text-slate-500">
                    {user.handle}
                  </p>
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-hover:text-slate-300" />
            </>
          )}
        </button>
        {open && (
          <Dropdown
            position={collapsed ? 'right' : 'top'}
            onNavigate={(href) => {
              setOpen(false)
              onNavigate?.(href)
            }}
            onLogout={() => {
              setOpen(false)
              onLogout?.()
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group flex items-center gap-2 rounded-full border border-transparent p-1 pr-2 transition-all duration-200 hover:border-[#1E1E2E] hover:bg-white/[0.03]"
      >
        <Avatar name={user.name} initials={initials} src={user.avatarUrl} size="sm" />
        <span className="hidden text-[13px] font-medium text-slate-200 sm:inline">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200 group-hover:text-slate-300" />
      </button>
      {open && (
        <Dropdown
          position="bottom-right"
          onNavigate={(href) => {
            setOpen(false)
            onNavigate?.(href)
          }}
          onLogout={() => {
            setOpen(false)
            onLogout?.()
          }}
        />
      )}
    </div>
  )
}

function Avatar({
  name,
  initials,
  src,
  size = 'md',
}: {
  name: string
  initials: string
  src?: string
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-[12px]'
  return (
    <span
      className={
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ' +
        'bg-gradient-to-br from-violet-500/80 to-cyan-400/80 font-semibold text-white ' +
        'shadow-[0_0_18px_-4px_rgba(124,58,237,0.6)] ' +
        dim
      }
      aria-label={name}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="font-mono tracking-tight">{initials || '·'}</span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10"
      />
    </span>
  )
}

function Dropdown({
  position,
  onNavigate,
  onLogout,
}: {
  position: 'top' | 'right' | 'bottom-right'
  onNavigate?: (href: string) => void
  onLogout?: () => void
}) {
  const positionClass =
    position === 'top'
      ? 'bottom-[calc(100%+8px)] left-0 right-0'
      : position === 'right'
      ? 'left-[calc(100%+8px)] bottom-0 w-56'
      : 'right-0 top-[calc(100%+8px)] w-56'

  return (
    <div
      role="menu"
      className={
        'absolute z-50 overflow-hidden rounded-xl border border-[#252535] bg-[#13131E]/95 ' +
        'p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl ' +
        'animate-in fade-in slide-in-from-top-1 duration-150 ' +
        positionClass
      }
    >
      <MenuItem
        icon={<UserCircle2 className="h-4 w-4" />}
        label="App profile"
        onClick={() => onNavigate?.('/profile')}
      />
      <MenuItem
        icon={<Settings className="h-4 w-4" />}
        label="Settings"
        onClick={() => onNavigate?.('/settings')}
      />
      <div className="my-1 h-px bg-[#252535]" />
      <MenuItem
        icon={<LogOut className="h-4 w-4" />}
        label="Log out"
        destructive
        onClick={onLogout}
      />
    </div>
  )
}

function MenuItem({
  icon,
  label,
  destructive = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  destructive?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] ' +
        'transition-colors duration-150 ' +
        (destructive
          ? 'text-rose-300 hover:bg-rose-500/10 hover:text-rose-200'
          : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100')
      }
    >
      <span className={destructive ? 'text-rose-400' : 'text-slate-500'}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
