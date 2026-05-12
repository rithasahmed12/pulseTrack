# Milestone 8: App Profile

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell), Milestone 2 (Authentication)

---

## About This Handoff

Ready-to-integrate components for the analyst's own profile page. Wire identity editing, avatar upload, and platform OAuth connections.

---

## Goal

Let analysts edit their own identity (name, bio, avatar), see workspace stats, and connect their own creator accounts on IG and TikTok.

## Overview

A focused profile page with three sections:
1. **Identity card** — Avatar (with hover Change), Display name (40 chars), Email (read-only), Bio (280 chars). Save / Discard appears only when the form is dirty.
2. **Workspace stat tiles** — Member since, Tracked profiles, Posts scraped.
3. **Connections** — IG and TikTok cards. Linked cards show handle + last-sync; unlinked show "why connect" hint + Connect CTA.

## Components Provided

Copy from `product-plan/sections/app-profile/components/`:

- `AppProfileView` — orchestrator
- `IdentityCard` — editable form with conditional Save/Discard
- `WorkspaceStatTile` — same visual language as Dashboard stats
- `ConnectionCard` — large platform cards with status chips

## Backend Wiring

| Action | API |
|--------|-----|
| Avatar upload | POST to Supabase Storage (or your CDN), get URL, PATCH `profiles.avatar_url` |
| Save name/bio | PATCH `profiles` `{ display_name, bio }` |
| Connect platform | Start OAuth flow for that platform; on callback, store the linked handle + tokens |
| Disconnect | Revoke tokens server-side, set the connection record's `isConnected: false` |
| Workspace stats | Read-only aggregations same as the Dashboard |

## Callback Wiring

| Callback | Wires To |
|----------|---------|
| `onDisplayNameChange(value)` / `onBioChange(value)` | Update local `draft` state |
| `onAvatarChange(file)` | Upload file → set `draft.avatarUrl` to the uploaded URL (or a data-URL while uploading) |
| `onSave()` | Submit the draft to your API; on success, update `user` to match |
| `onDiscard()` | Revert `draft` back to `user` values |
| `onConnectClick(platform)` | Start OAuth — redirect to provider, then back to `/profile` |
| `onDisconnectClick(platform)` | Revoke + update connection state |

The component computes `isDirty` based on draft vs user. **You** maintain both pieces of state in the host.

## Expected User Flows

### Flow 1: Edit profile
1. User changes display name
2. `onDisplayNameChange` fires → host updates `draft`
3. Host sees `draft.displayName !== user.displayName` → sets `isDirty: true`
4. User clicks Save → host calls API → on success, sets `user = { ...user, ...draft }` and `isDirty: false`

### Flow 2: Upload avatar
1. User hovers avatar → "Change" pill visible
2. Click → file picker
3. User picks an image → `onAvatarChange(file)` fires with the `File`
4. **You:** read the file (FileReader for instant preview) + upload in the background

### Flow 3: Connect TikTok
1. User clicks "Connect TikTok" → `onConnectClick('tiktok')`
2. **You:** redirect to TikTok OAuth consent
3. On callback, set the connection record to `isConnected: true` with `connectedHandle` and `lastSyncedAt`
4. Card re-renders with emerald border + status chip + Disconnect button

## Testing

See `product-plan/sections/app-profile/tests.md`.

## Done When

- [ ] Name and bio edits work with debounced or on-blur saves
- [ ] Avatar upload uses Supabase Storage (or your equivalent) and the URL is persisted
- [ ] Email field is read-only (managed by auth)
- [ ] Connect / Disconnect flows work with OAuth or display "Coming soon" if not wired
- [ ] Workspace stat tiles reflect real aggregations
