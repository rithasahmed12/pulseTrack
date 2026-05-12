# Milestone 9: Settings

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 2 (Authentication), Milestone 8 (App Profile)

---

## About This Handoff

Ready-to-integrate components for security, notifications, appearance, and data preferences.

---

## Goal

Workspace administration — change password, manage 2FA, toggle notifications, customize appearance (accent + sidebar default), and handle data export / account deletion.

## Overview

A left-rail tab nav switches between four panes:
1. **Security** — Password change with strength meter, 2FA toggle + setup CTA
2. **Notifications** — 4 toggle cards (new post, follower spike, trending hashtag, weekly report email)
3. **Appearance** — Accent picker (Violet / Cyan / Rose / Amber) with live preview + sidebar default toggle
4. **Data & Privacy** — Clear scrape cache, Export CSV, and a Danger Zone with typed-DELETE account deletion

## Components Provided

Copy from `product-plan/sections/settings/components/`:

- `SettingsView` — orchestrator
- `SettingsNav` — left-rail tabs (collapses to horizontal scroll on mobile)
- `SecurityPane` — password form + 2FA card
- `NotificationsPane` — 4 toggle cards
- `AppearancePane` — accent swatches + live preview + sidebar default
- `DataPane` — action cards + Danger Zone with typed-DELETE
- `Switch` — shared toggle component (used in 3 places)

## Backend Wiring

| Action | API |
|--------|-----|
| Change password | POST `/auth/change-password` `{ current, next }` |
| Toggle 2FA | POST `/auth/2fa` `{ enabled }` |
| Set up authenticator | Generate TOTP secret, show QR (out of scope here) |
| Toggle notification preference | PATCH `profiles.notifications` JSONB column |
| Set accent / sidebar default | PATCH `profiles.accent_color`, `profiles.sidebar_collapsed` |
| Clear scrape cache | POST `/admin/clear-cache` (workspace-scoped) |
| Export CSV | GET `/admin/export.csv`, stream to browser as a download |
| Delete account | DELETE `/auth/account` (requires typed DELETE confirmation client-side) |

## Callback Wiring

| Callback | Notes |
|----------|-------|
| `onTabChange(tabId)` | Update local state; optionally update URL fragment for shareability |
| `onPasswordSubmit({current, next, confirm})` | Submit to API; on success, the form clears and a "Password updated" toast fades |
| `onTwoFactorToggle(enabled)` | Optimistic update + API call |
| `onNotificationToggle(id, enabled)` | Optimistic update + API call |
| `onAccentChange(accentId)` | Update local state immediately; persist on a debounce |
| `onSidebarDefaultToggle(collapsed)` | Same — persist on toggle |
| `onClearCache()` | Confirm popover already in component; just wire to API |
| `onExportCsv()` | Trigger download — `window.location.href = '/admin/export.csv'` or use a hidden anchor |
| `onDeleteAccount()` | Only fires when the typed DELETE matches; do not show a second confirm |

## Expected User Flows

### Flow 1: Change password
- User fills current + new + confirm
- Strength meter live-updates as they type
- Submit → `onPasswordSubmit` → toast "Password updated"

### Flow 2: Toggle 2FA + set up
- Toggle on → `onTwoFactorToggle(true)` → "Set up authenticator" button enables
- Click → `onSetUp2FAClick()` → open the TOTP setup modal/route

### Flow 3: Change accent
- User clicks the Rose swatch
- `onAccentChange('rose')` fires
- Live preview chip + button repaint immediately
- **You:** apply the accent to the rest of the app (update a CSS custom property like `--accent-primary` on `:root`)

### Flow 4: Delete account
- User types DELETE in the danger-zone input
- Button activates only when the input strictly equals "DELETE"
- Click → `onDeleteAccount()` → call API → sign out + route to a goodbye page

## Testing

See `product-plan/sections/settings/tests.md`.

## Done When

- [ ] All four panes render and switch via the left-rail nav
- [ ] Password change works with the strength meter
- [ ] 2FA toggle + setup flow is wired (or "Coming soon" if not implemented)
- [ ] Notification toggles persist to the `profiles.notifications` JSONB column
- [ ] Accent picker updates the global accent (e.g., via a CSS variable)
- [ ] Danger Zone correctly enforces the typed-DELETE rule
- [ ] CSV export downloads a file
- [ ] Active tab survives a page refresh (use URL fragment or local state)
