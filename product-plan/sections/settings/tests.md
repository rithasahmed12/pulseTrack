# Test Specs: Settings

These specs are **framework-agnostic**. Adapt to your testing setup.

## Overview

Left-rail nav switches between four panes (Security, Notifications, Appearance, Data & Privacy). Each pane has its own behavior and validation rules.

---

## User Flow Tests

### Flow 1: Switch tabs

1. Render `SettingsView` with `activeTab: 'security'`.
2. User clicks "Notifications" in the left rail.
3. `onTabChange('notifications')` fires.

**Expected:**
- [ ] After host re-renders with `activeTab: 'notifications'`, the right pane swaps.
- [ ] The active tab gets a violet/10 background + gradient left bar.
- [ ] The pane root has `key={activeTab}` so a `pane-rise` animation plays on swap.

### Flow 2: Change password — success path

In the Security pane:

1. User fills Current password (any non-empty), New password ("Pa$$word1!"), Confirm password ("Pa$$word1!").
2. The strength meter shows "Excellent" (4 bars).
3. User clicks "Update password".

**Expected:**
- [ ] `onPasswordSubmit({ current, next, confirm })` fires with the three values.
- [ ] The Password fields reset to empty strings.
- [ ] "Password updated." status text fades in (emerald) for 2.2 seconds, then back to opacity 0.

### Flow 3: Change password — mismatched confirm

1. User fills Current ("abc"), New ("Pa$$word1!"), Confirm ("Pa$$word2!").

**Expected:**
- [ ] Confirm field shows error: "Passwords don't match." with rose ring.
- [ ] Update Password button has `disabled` attribute.
- [ ] `onPasswordSubmit` is not called on submit attempt.

### Flow 4: Toggle 2FA + setup CTA

1. Render with `security.twoFactorEnabled: false`.

**Expected:**
- [ ] Switch is off (slate background).
- [ ] "Enable 2FA first" button is disabled, slate icon.

2. User toggles the Switch.
3. `onTwoFactorToggle(true)` fires.

**Expected (after host re-renders with `true`):**
- [ ] Switch is on (violet background with glow).
- [ ] Icon tile flips to emerald.
- [ ] Button label changes to "Set up authenticator" and becomes enabled.
4. Click → `onSetUp2FAClick()` fires.

### Flow 5: Toggle a notification preference

For the first preference (e.g., "New post alerts"):

1. Initial state: `enabled: true`.
2. User clicks the Switch.
3. `onNotificationToggle('new_post', false)` fires.

**Expected:**
- [ ] Host flips the preference; Switch animates to off state.

### Flow 6: Pick a new accent

1. Initial: `appearance.accentColor: 'violet'`.
2. User clicks the Rose swatch.
3. `onAccentChange('rose')` fires.

**Expected (after host re-renders):**
- [ ] The Rose swatch gets the outer-ring glow effect (2px dark inner + 2px rose outer ring + 24px rose glow).
- [ ] The live preview chip + button + engagement pill repaint with rose hex (#F43F5E).
- [ ] The preview eyebrow updates to "Preview · Rose".

### Flow 7: Toggle sidebar default

- [ ] Clicking the "Start sidebar collapsed" Switch fires `onSidebarDefaultToggle(true)` (or `false`).
- [ ] The Switch reflects the new state.

### Flow 8: Export CSV

1. User clicks "Export CSV" in the Data & Privacy pane.
2. `onExportCsv()` fires.

**Expected:**
- [ ] Button shows Loader2 spinner + "Preparing…" for ~1400ms in the preview.
- [ ] After timeout, button reverts to "Export CSV".

### Flow 9: Clear cache

1. User clicks "Clear cache".
2. Confirm popover appears.
3. User clicks "Clear" inside the popover.
4. `onClearCache()` fires.

**Cancel path:**
- [ ] Pressing Escape or clicking outside the popover closes it without firing.

### Flow 10: Delete account (typed DELETE)

1. User types "delete" (lowercase) into the confirmation input.
2. The destructive button stays in its disabled ghost state.

3. User types "DELETE" (uppercase, exact match).

**Expected:**
- [ ] Confirmation input border switches to `rose-500/60` + rose ring shadow.
- [ ] Destructive button activates: saturated rose background, white text, Trash2 icon.
4. User clicks the button → `onDeleteAccount()` fires.

**Verify the exact-match rule:**
- [ ] "Delete" (only first letter cap) does NOT activate the button.
- [ ] "DELETE " (trailing space) does NOT activate.
- [ ] "DELETE" (exact) DOES activate.

---

## Component Interaction Tests

### SettingsNav

- [ ] All 4 tabs render with their icons (lock, bell, palette, shield).
- [ ] On `< lg` viewports, the nav becomes a horizontal scroll strip (`flex` not `flex-col`).
- [ ] Each tab description renders below the label on desktop only.

### Switch

- [ ] `aria-checked` mirrors the `checked` prop.
- [ ] Thumb translates from `translate-x-[3px]` (off) to `translate-x-[18px]` (on).
- [ ] Disabled Switch shows reduced opacity and cursor: not-allowed.

### Password Strength Meter

- [ ] Empty password → 0 bars filled.
- [ ] 8+ chars only → 1 bar (Weak).
- [ ] 8+ chars + uppercase → 2 bars (Fair).
- [ ] 8+ chars + uppercase + digit → 3 bars (Strong).
- [ ] 8+ chars + uppercase + digit + symbol → 4 bars (Excellent).

---

## Empty / Default States

- [ ] On first render, the password form is empty and "Update password" is disabled.
- [ ] All notification toggles render with their `enabled` defaults from sample data.

---

## Edge Cases

- [ ] Tab switch preserves the host-managed state of *other* tabs (e.g., navigating away from Security with form data, the values are lost — that's expected; the pane component clears state on unmount).
- [ ] Accent color picker doesn't re-render the entire SettingsView — only the AppearancePane changes.
- [ ] DELETE input is `font-mono` with `tracking-[0.18em]` for visual gravity. Placeholder is `slate-700` (very muted).

---

## Accessibility

- [ ] All tab buttons have `aria-pressed` reflecting active state.
- [ ] Strength meter has a text label that's read together with the bars.
- [ ] Disabled buttons have `aria-disabled` (via the native `disabled` attribute).
- [ ] Confirm popovers have `role="dialog"` with `aria-label`.

---

## Sample Test Data

Reference `sample-data.json` — 4 tabs, 4 notification preferences (3 on, 1 off), 4 accent options, security state with last password change in March.
