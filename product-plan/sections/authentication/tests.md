# Test Specs: Authentication

These specs are **framework-agnostic** — adapt to your testing setup (Vitest + RTL, Playwright, Cypress, etc.).

## Overview

Authentication is the entry point: split-layout `LoginScreen` and `SignupScreen` outside the app shell. Email + password + social providers. Forms validate inline, the strength meter scores on length/case/digits/symbols, and the submit button disables during in-flight requests.

---

## User Flow Tests

### Flow 1: Sign In with email

**Setup:** Render `LoginForm` with a stub `onSubmit` handler and the sample copy from `sample-data.json` (`login`).

#### Success Path

1. User sees heading "Welcome back" and the subtitle.
2. User types `alex@meridian.studio` into the Email field.
3. User types `correct-horse-battery` into the Password field.
4. User clicks "Sign in".

**Expected results:**
- [ ] `onSubmit` is called once with `{ email: 'alex@meridian.studio', password: 'correct-horse-battery', remember: true }`.
- [ ] During the submit (while `onSubmit` is pending), the button shows "Signing in…" with a spinner and inputs are disabled.

#### Failure Path: invalid email

1. User types `not-an-email` into the Email field.
2. User tabs out (blur).
3. User clicks Sign in.

**Expected results:**
- [ ] Error message appears: "Enter a valid email address." with rose-tinted ring on the Email field.
- [ ] `onSubmit` is **not** called.

#### Failure Path: password too short

1. User types valid email + a 5-character password.
2. User submits.

**Expected results:**
- [ ] Error message under Password: "At least 8 characters."
- [ ] `onSubmit` not called.

### Flow 2: Create account with strength meter

**Setup:** Render `SignupForm` with the sample copy from `sample-data.json` (`signup`).

**Steps:**
1. User types `Alex Morgan` in Display name.
2. User types `alex@meridian.studio` in Email.
3. User types `weak` in Password.
4. User types `weak` in Confirm password.
5. User toggles the Terms checkbox.
6. User submits.

**Expected results:**
- [ ] Strength meter shows "Too short" or "Weak" tier with appropriate color.
- [ ] Password error appears: "At least 8 characters."
- [ ] `onSubmit` is not called.

**Then:**
1. User changes password to `Pa$$word1!`.
2. User changes confirm to `Pa$$word1!`.

**Expected results:**
- [ ] Strength meter shows "Excellent" (score 4).
- [ ] No errors visible.
- [ ] On submit, `onSubmit` is called with the full SignupFormValues object.

### Flow 3: Switch between Login and Signup

1. User is on `LoginScreen` (preview) with `mode = 'login'`.
2. User clicks the footer link "Create one".

**Expected results:**
- [ ] `onSwitchToSignup` is called.
- [ ] The form swaps to the signup variant with heading "Create your workspace".

---

## Component Interaction Tests

### Show/Hide password toggle

- [ ] Clicking the eye icon switches the `type` attribute of the password input between `password` and `text`.
- [ ] The icon swaps between `Eye` and `EyeOff` (lucide-react).
- [ ] The toggle does not submit the form (`type="button"`, `tabIndex={-1}`).

### Social provider buttons

- [ ] Both Google and Apple buttons render with their icons.
- [ ] Clicking Google fires `onProviderClick('google')`.
- [ ] Clicking Apple fires `onProviderClick('apple')`.
- [ ] Buttons are disabled while `submitting` is true.

### Forgot password

- [ ] Clicking "Forgot password?" fires `onForgotPassword()`.

---

## Edge Cases

- [ ] Form validation runs on blur after the first interaction, not on initial mount (no error on first paint).
- [ ] Pressing Enter inside any field submits the form.
- [ ] Multiline bio-style content is rejected by the email input (handled by `<input type="email">`).
- [ ] On `< lg` viewports, the brand panel collapses to a banner above the form (no horizontal scroll).

---

## Accessibility Checks

- [ ] All form fields have a visible `<label>` associated via `htmlFor`.
- [ ] The password toggle button has `aria-label="Show password"` / `aria-label="Hide password"`.
- [ ] Error messages are associated to fields (rendered next to the input and reachable by screen readers).
- [ ] Tab order: Email → Password → Show toggle (with tabIndex={-1} so skipped) → Remember me → Sign in → Switch link.

---

## Sample Test Data

```typescript
const validLogin = {
  email: 'alex@meridian.studio',
  password: 'correct-horse-battery',
  remember: true,
}

const validSignup = {
  name: 'Alex Morgan',
  email: 'alex@meridian.studio',
  password: 'Pa$$word1!',
  confirmPassword: 'Pa$$word1!',
  acceptTerms: true,
}
```
