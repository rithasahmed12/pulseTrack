# Application Shell

The persistent chrome that wraps every in-app section: left sidebar + top header + scrollable content area.

## Overview

A collapsible left sidebar carries primary navigation, a slim top header carries page title, global search, notifications, and the user menu, and a violet-accented active state indicates the current section. The shell sits on a near-black canvas (#0A0A0F) with glass-morphism surfaces, accent glow on focused elements, and Inter typography.

## Layout

- **Sidebar (left):** 240px expanded / 68px collapsed, with a toggle button. Logo + brand at top, nav items, user menu at the bottom. On mobile (< lg), the sidebar hides and slides in as an overlay drawer from a hamburger button in the header.
- **Top header (right):** 64px tall, contains the page title eyebrow + title, a global search input (⌘K affordance), a notification bell with unread badge, and the user menu dropdown.
- **Content area:** scrollable, with a `max-w-[1320px]` inner container and consistent padding. Section content renders into this area.

## Navigation

The default nav order is **Dashboard → Posts → Trending → Tracked**, followed by a divider and **App Profile → Settings**. The Profile Detail section is a deep route reached from Tracked or anywhere a profile is referenced — it is intentionally not a top-level nav item.

Auth screens (login/signup) render **outside** the shell — the auth section has `shell: false` in its spec.

## Components Provided

| File | Role |
|------|------|
| `AppShell.tsx` | Main wrapper. Accepts `children`, `navigationItems`, `user`, `pageTitle`, `notificationCount`, and callbacks. Manages sidebar collapse state internally. |
| `MainNav.tsx` | The sidebar nav body — brand, search affordance, primary nav, secondary nav, with optional badge counts. |
| `UserMenu.tsx` | Avatar + dropdown. Works in both `sidebar` (bottom of rail) and `header` (top-right) variants. |
| `index.ts` | Barrel exports for `AppShell`, `MainNav`, `UserMenu` and their prop types. |

## Props (high level)

```ts
interface AppShellProps {
  children: ReactNode
  navigationItems?: Array<{
    label: string
    href: string
    isActive?: boolean
    badge?: string | number
  }>
  user?: { name: string; handle?: string; avatarUrl?: string }
  pageTitle?: string
  pageEyebrow?: string
  notificationCount?: number
  onNavigate?: (href: string) => void
  onLogout?: () => void
}
```

All props are **optional** so the shell renders with sensible defaults in a preview environment. In a real app, pass:
- `navigationItems` derived from your route table (with the active item flagged)
- `user` from your auth context
- `onNavigate` wired to your router (e.g., `router.push(href)`)
- `onLogout` wired to your auth sign-out

## Visual Notes

- **Active nav state:** gradient violet→cyan left bar, violet/10 background tint, violet-300 icon + label, soft violet glow.
- **Ambient background:** three low-opacity radial blobs (violet, cyan, fuchsia) plus a noise overlay — provides depth without animation. If you need a calmer look, remove the blobs in `AppShell.tsx`.
- **Notification bell:** animated soft pulse on the unread dot. Set `notificationCount={0}` to suppress.

## Responsive Behavior

- `≥ lg (1024px)`: sidebar expanded, all header elements visible.
- `md` to `lg`: sidebar collapses to icon-only by default.
- `< md`: sidebar becomes a slide-in drawer; hamburger button appears in the header.
