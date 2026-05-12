# Settings

## Overview

The analyst's preferences and workspace administration page. A left-rail tab nav switches between four panes — **Security, Notifications, Appearance, Data & Privacy** — each rendering a focused, single-column form on the right. Identity editing intentionally lives in App Profile, not here, to avoid duplication.

## User Flows

- Land on `/settings` → Security tab active by default; left rail shows all four tabs with descriptions.
- Click a tab → right pane swaps. The URL fragment can update so sections are shareable (out of scope for the component — wire to your router).
- **Security:** fill current + new + confirm password → strength meter live-updates → submit → "Password updated" toast (2.2s). Toggle 2FA on → "Set up authenticator" CTA enables.
- **Notifications:** toggle per-event preferences (4 cards). Footer note clarifies email destination.
- **Appearance:** pick one of four accent swatches → live preview chip + button + sample chip update immediately. Toggle "Start sidebar collapsed".
- **Data & Privacy:** Clear scrape cache (confirm popover), Export workspace as CSV (with spinner), or Delete account permanently (typed DELETE confirmation in a Danger Zone box).

## Design Decisions

- **Left-rail tabs match the app shell's active-state treatment** — violet/10 tint + gradient left bar — so the navigation language is consistent.
- **Pane transitions use a single `key={activeTab}` + `animation: pane-rise`** — subtle 4px slide-in on tab change without React Transition Group.
- **All toggles use one shared `Switch` component** — three places use it (2FA card, notification cards, sidebar default). No rogue checkbox styles.
- **Danger Zone is visually separated** — rose-tinted background `rgba(244,63,94, 0.03)` so it departs from the rest of the page without being shouty.
- **Typed-DELETE pattern** — destructive button is hard-disabled until the input value strictly equals `"DELETE"`. The text input uses font-mono with letter-spacing for visual gravity.
- **Accent picker live-preview** — the chip + button + engagement-pill examples in the preview row use the picked hex directly via inline `style` so the preview always matches your accent.

## Data Shapes

**Entities:** `SettingsTab`, `SecurityState`, `NotificationPreference`, `AccentOption`, `AppearanceState`, `PasswordFormValues`.

**From global entities:** `Profile` (the analyst's account — these preferences live on the profile per the Supabase schema).

## Components Provided

- **`SettingsView`** — Orchestrator: header → 2-column grid with `SettingsNav` + active pane.
- **`SettingsNav`** — Left-rail tabs with icon + label + section description; collapses to horizontal scroll strip on mobile.
- **`SecurityPane`** — Password change form (current/new/confirm + strength meter + saved toast) + 2FA card (toggle + conditional setup CTA).
- **`NotificationsPane`** — 4 toggle cards with per-event icons and tone hints.
- **`AppearancePane`** — Accent swatch picker with outer-ring glow on active, **live preview row**, sidebar default toggle.
- **`DataPane`** — Two action cards (Export CSV, Clear cache) + a separated Danger Zone with typed-DELETE confirmation.
- **`Switch`** — Shared toggle component used in 2FA, notifications, and sidebar default.

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onTabChange(tabId)` | Left-rail tab clicked |
| `onPasswordSubmit({ current, next, confirm })` | Password form submitted (after client-side validation passes) |
| `onTwoFactorToggle(enabled)` | 2FA Switch changed |
| `onSetUp2FAClick()` | "Set up authenticator" CTA (only active when 2FA toggle is on) |
| `onNotificationToggle(id, enabled)` | Notification preference toggled |
| `onAccentChange(accentId)` | Accent swatch picked |
| `onSidebarDefaultToggle(collapsed)` | Sidebar default toggle changed |
| `onClearCache()` | Clear cache action confirmed |
| `onExportCsv()` | Export CSV button clicked |
| `onDeleteAccount()` | Delete account button clicked (only fires when the typed DELETE confirmation matches) |

## Visual Reference

The active accent swatch gets a 2-layer outer ring (dark inner + colored outer) so it feels like a physical button being pressed. The Danger Zone destructive button toggles from a quiet "ghost" state to a saturated rose button only when the typed-DELETE matches.
