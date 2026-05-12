# Test Specs: App Profile

These specs are **framework-agnostic**. Adapt to your testing setup.

## Overview

The analyst's own profile page — identity editing, workspace stats, and platform connections (UI-only OAuth).

---

## User Flow Tests

### Flow 1: Edit display name and save

**Setup:** Render `AppProfileView` with `isDirty: false`, `isSaving: false`. The user's saved name is "Alex Morgan".

1. User types in the Display name field, changing it to "Alex M.".
2. `onDisplayNameChange('Alex M.')` fires.

**Expected (after host re-renders with the new draft):**
- [ ] `isDirty` becomes `true`.
- [ ] Save Changes + Discard buttons appear in the bottom action row.

**Then:**
3. User clicks Save Changes.
4. `onSave()` fires.
5. Host sets `isSaving: true`.

**Expected:**
- [ ] Save button shows Loader2 spinner + "Saving…" label.
- [ ] All form fields are disabled while saving.

**After save completes:**
6. Host updates `user` to match the new draft and sets `isSaving: false`.

**Expected:**
- [ ] `isDirty` becomes `false` (draft now matches user).
- [ ] Save / Discard row disappears.

### Flow 2: Discard changes

1. User edits Display name to "Alex M.".
2. User clicks Discard.
3. `onDiscard()` fires.

**Expected:**
- [ ] Host reverts `draft.displayName` to match `user.displayName`.
- [ ] Save / Discard row disappears.

### Flow 3: Avatar upload

1. User hovers the avatar.
2. The "Change photo" pill appears with `opacity: 1`.
3. User clicks the pill — hidden file input opens.
4. User picks an image file.
5. `onAvatarChange(file)` fires with the `File` object.

**In the preview wrapper** specifically:
- [ ] FileReader reads the file as a data URL and `draft.avatarUrl` updates immediately.
- [ ] The visible avatar updates without a full save (preview-only behavior — production should defer the visible change until after upload completes).

### Flow 4: Email field is read-only

- [ ] The Email field's `<input>` has `readOnly` attribute.
- [ ] The field shows a Lock icon and the caption "Managed by sign-in".
- [ ] Typing into the field does nothing (`readOnly` prevents value changes).

### Flow 5: Connect a platform

**Setup:** A `Connection` with `isConnected: false` for TikTok.

- [ ] The card shows the "why connect" hint copy from the data.
- [ ] The Connect button is rendered with "Connect TikTok" label and the violet CTA style.
- [ ] Clicking fires `onConnectClick('tiktok')`.

### Flow 6: Disconnect a platform

**Setup:** A `Connection` with `isConnected: true` for Instagram.

1. The card shows "Linked as @alex.morgan" + "Last sync 3h ago".
2. The "Connected" emerald status chip is rendered.
3. User clicks Disconnect.
4. Confirm popover appears.
5. User clicks "Disconnect" inside the popover.
6. `onDisconnectClick('instagram')` fires.

---

## Component Interaction Tests

### IdentityCard

- [ ] Avatar renders inside a 2px gradient ring (violet → cyan).
- [ ] Display name counter shows `{length}/40`.
- [ ] Bio counter shows `{length}/280`.
- [ ] Both inputs respect their `maxLength` attribute.
- [ ] All inputs disable when `isSaving === true`.

### WorkspaceStatTile

- [ ] Renders with the correct tone (violet / cyan / amber).
- [ ] Footnote text appears in slate-500 below the value.

### ConnectionCard

- [ ] When connected, the card border is `emerald-500/20` (not the default slate).
- [ ] Corner radial bloom is colored by platform (IG pink-orange / TikTok cyan).
- [ ] "OAuth · coming soon" footer eyebrow renders in both states.

---

## Empty / Default States

- [ ] On initial render, `isDirty === false` so Save / Discard are not rendered.
- [ ] Connection with `connectedHandle: null` does NOT render the "Linked as @null" line — it falls back to the hint copy.

---

## Edge Cases

- [ ] User pastes their email into Bio: counter updates correctly past 100 characters.
- [ ] Saving with `draft.avatarUrl` being a data URL (from FileReader) does not crash — the URL is just passed through.
- [ ] Disconnecting then immediately reconnecting flips the card back to the connected state with a freshly-generated `connectedHandle` from `displayName.toLowerCase().replace(/\s+/g, '.')`.

---

## Accessibility

- [ ] Avatar Change button has `aria-label="Change avatar"`.
- [ ] Email field has an associated `<label htmlFor="email">`.
- [ ] Bio textarea is keyboard-accessible (Tab order: name → email → bio → save/discard).
- [ ] Switch (toggle) has `role="switch"` and `aria-checked` semantics.

---

## Sample Test Data

Reference `sample-data.json` — Alex Morgan, joined Mar 2026, IG connected, TikTok not connected.
