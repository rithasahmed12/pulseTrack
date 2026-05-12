# Milestone 1: Shell

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Set up the design tokens and application shell — the persistent chrome that wraps every section.

## What to Implement

### 1. Design Tokens

Configure your styling system with the PulseTrack tokens:

- **CSS variables:** see `product-plan/design-system/tokens.css`. Drop it into your global stylesheet and reference variables from your CSS or Tailwind config.
- **Tailwind:** see `product-plan/design-system/tailwind-colors.md`. Primary `violet`, secondary `cyan`, neutral `slate`. Surface colors are arbitrary values (`bg-[#0F0F18]`) so no config extension is required.
- **Fonts:** see `product-plan/design-system/fonts.md`. Inter (heading + body) + JetBrains Mono (mono eyebrows). Drop the `<link>` into your `<head>` or import via CSS.

### 2. Application Shell

Copy the components from `product-plan/shell/components/` into your project:

- `AppShell.tsx` — the main wrapper. Accepts `children`, `navigationItems`, `user`, `pageTitle`, `notificationCount`, and callbacks.
- `MainNav.tsx` — sidebar body (brand, search affordance, primary + secondary nav).
- `UserMenu.tsx` — avatar + dropdown (used in both sidebar footer and header).
- `index.ts` — barrel exports.

**Wire up navigation** to your router. The PulseTrack default nav structure:

| Label | Route | Notes |
|-------|-------|-------|
| Dashboard | `/dashboard` | Primary |
| Posts | `/posts` | Primary |
| Trending | `/trending` | Primary |
| Tracked | `/tracked` | Primary |
| (divider) | — | — |
| App Profile | `/profile` | Account |
| Settings | `/settings` | Account |

The shell uses `onNavigate(href)` callbacks for all nav links; wire those to `router.push(href)` (or your equivalent).

**User menu** expects:
- `user.name` (required), `user.handle` (optional), `user.avatarUrl` (optional — falls back to initials)
- `onLogout()` callback

### 3. Auth Layout (Outside Shell)

The Authentication section (next milestone) sits **outside** this shell. Set up routing so:
- `/login` and `/signup` render the auth screens at full viewport (no `AppShell` wrapper).
- All other routes render inside `AppShell` with the matching nav item marked active.

## Files to Reference

- `product-plan/design-system/` — All design tokens
- `product-plan/shell/README.md` — Shell intent and responsive behavior
- `product-plan/shell/components/` — React components

## Done When

- [ ] Inter + JetBrains Mono are loaded
- [ ] `tokens.css` variables are accessible globally
- [ ] `AppShell` renders with nav, header, and content area
- [ ] Nav links route to the correct paths
- [ ] Active nav item is highlighted based on the current route
- [ ] User menu shows the signed-in user and triggers logout on click
- [ ] Sidebar collapses to icon-only on tablets and to a drawer on mobile
- [ ] `/login` and `/signup` routes render WITHOUT the shell
