# App Profile

## Overview

The analyst's own account view inside PulseTrack — **distinct from the per-tracked-profile detail page**. Carries a quiet identity card (avatar, display name, email, bio) with inline editing, a 3-up stat row showing personal workspace metrics, and a Connections section with two large cards for linking IG and TikTok creator accounts (UI-only in v0.1).

## User Flows

- Land on `/profile` (the analyst's own page, NOT `/profile/:platform/:username`).
- Hover the avatar → "Change" pill appears; click → file picker opens. In the preview, the picked image renders immediately via FileReader.
- Edit display name or bio inline → "Save changes" button appears (only visible when dirty).
- Click Save → optimistic update + 700ms loading spinner. Reverts to clean state after save.
- Click Discard → reverts draft to last-saved values.
- Email is intentionally read-only — managed by sign-in, locked with a small caption.
- Click Connect on a platform card → fires `onConnectClick(platform)`. In the preview, flips the card to "connected" with a generated handle.
- Click Disconnect on a connected card → confirm popover → confirms → fires `onDisconnectClick(platform)`.

## Design Decisions

- **No theme/appearance settings here** — those live in the Settings section to avoid duplication.
- **`isDirty` derived in the parent** — the View component receives `draft` + `isDirty` + `isSaving` as props rather than managing form state internally. Makes wiring to react-hook-form / Formik / your own form lib straightforward.
- **Avatar uses a 2px gradient ring** (violet → cyan) — the "premium" identity cue, matching the auth wordmark.
- **Connection cards lean into platform color quietly** — corner radial bloom, not a banner. Cards aren't loud about the brand color.

## Data Shapes

**Entities:** `AppUser`, `AppUserDraft` (editable subset), `WorkspaceStat`, `Connection`.

**From global entities:** `Profile` (your auth account — represented as `AppUser` here).

## Components Provided

- **`AppProfileView`** — Orchestrator: header → identity card → stat tiles → connections grid.
- **`IdentityCard`** — Avatar with gradient ring + hover Change pill, three Fields (display name w/ counter, locked email w/ caption, bio w/ counter), conditional Save/Discard row.
- **`WorkspaceStatTile`** — Same visual language as Dashboard StatCard; footnote line instead of delta chip.
- **`ConnectionCard`** — Large platform tile + status chip + linked handle + last-synced timestamp, or a "why connect" hint + Connect button when not linked.

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onDisplayNameChange(value)` | Display name field changes (live, on every keystroke) |
| `onBioChange(value)` | Bio textarea changes |
| `onAvatarChange(file)` | User picks a new avatar file |
| `onSave()` | Save Changes button clicked (only when `isDirty`) |
| `onDiscard()` | Discard button clicked |
| `onConnectClick(platform)` | Connect CTA on an unlinked card |
| `onDisconnectClick(platform)` | Disconnect confirmed on a linked card |

## Visual Reference

The Save button only appears when the form is dirty — `isDirty` is derived from comparing `draft` against the saved `user` via `useMemo`. The success state is implicit (Save button disappears once `isDirty` flips back to false).
