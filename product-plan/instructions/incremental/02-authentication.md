# Milestone 2: Authentication

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) — for design tokens. Auth screens render OUTSIDE the shell.

---

## About This Handoff

**What you're receiving:** finished React components, sample data, types, and test specs. Your job is to wire callbacks to your auth provider, route `/login` and `/signup` to the matching screens, and gate the rest of the app behind an authenticated session.

---

## Goal

Implement the login + signup flow. Users sign in or create an account from a split-layout screen, then route to `/dashboard`.

## Overview

PulseTrack uses a restrained editorial split layout. The left panel carries the brand (wordmark + pull-quote + minimal stat strip). The right panel carries the form — email + password + social providers (Google, Apple), with inline validation and a password-strength meter on signup.

**Key Functionality:**
- Sign in with email + password (with "Remember me")
- Create an account with name + email + password + Terms acceptance
- Social authentication (Google, Apple) — wire to your OAuth provider
- Inline validation (required, valid email, ≥8 char password, password match)
- Show/hide password toggle
- Password strength meter (length / uppercase / digit / symbol)
- Switch between Login and Signup via a footer link
- Forgot password (route to a recovery flow — not implemented in v0.1)

## Components Provided

Copy from `product-plan/sections/authentication/components/`:

- `AuthLayout.tsx` — Full-viewport split wrapper; injects Inter + JetBrains Mono.
- `AuthBranding.tsx` — Left brand panel.
- `LoginForm.tsx` — Login form with show/hide, remember-me, social, footer link.
- `SignupForm.tsx` — Signup form with strength meter, T&C checkbox.
- `SocialAuthButtons.tsx` — Google + Apple buttons.

## Props Reference

The `LoginForm` props (full def in `types.ts`):

```ts
interface LoginFormProps {
  copy: AuthFormCopy
  providers: SocialProvider[]
  initialValues?: Partial<LoginFormValues>
  onSubmit?: (values: LoginFormValues) => void | Promise<void>
  onForgotPassword?: () => void
  onSwitchToSignup?: () => void
  onProviderClick?: (id: SocialProviderId) => void
}
```

| Callback | Triggered When |
|----------|---------------|
| `onSubmit(values)` | Valid form submitted — call your auth provider |
| `onSwitchToSignup` / `onSwitchToLogin` | Footer mode-toggle link clicked |
| `onForgotPassword()` | Recovery link clicked |
| `onProviderClick(id)` | Google / Apple button clicked — start OAuth handshake |

## Expected User Flows

### Flow 1: Sign in
1. User lands on `/login` → sees split layout with "Welcome back" copy
2. Enters email + password, optionally toggles "Keep me signed in"
3. Clicks "Sign in" → `onSubmit` fires with form values
4. **You:** authenticate via your provider; on success, route to `/dashboard`; on failure, surface an error (use the field error pattern or a toast)

### Flow 2: Create account
1. User clicks "Create one" from login → routes to `/signup` (or in-place mode swap in this preview)
2. Fills name + email + password + confirm + T&C
3. Strength meter live-updates as they type the password
4. Clicks "Create account" → `onSubmit` fires
5. **You:** create the account, sign them in, route to `/dashboard` (or `/tracked` for first-run onboarding)

### Flow 3: Social auth
1. User clicks Google or Apple button → `onProviderClick(id)` fires
2. **You:** redirect to the OAuth consent screen, then resume the session

## Empty / Error States

- Validation errors render inline below the offending field (already styled).
- During submit, the CTA button shows a spinner and form is disabled (already wired via internal `submitting` state).
- If your auth provider returns an error, you can surface it by passing an error message via the parent component (a future iteration) or by adding a toast at the layout level.

## Testing

See `product-plan/sections/authentication/tests.md`.

## Files to Reference

- `product-plan/sections/authentication/README.md`
- `product-plan/sections/authentication/tests.md`
- `product-plan/sections/authentication/components/`
- `product-plan/sections/authentication/types.ts`
- `product-plan/sections/authentication/sample-data.json`

## Done When

- [ ] `/login` and `/signup` routes render at full viewport (no `AppShell`)
- [ ] Email + password sign-in routes authenticated users to `/dashboard`
- [ ] Signup creates an account and routes to `/dashboard`
- [ ] Google + Apple buttons start the OAuth handshake (or display "Coming soon" if not implemented)
- [ ] Inline validation matches the test specs
- [ ] Authenticated user visiting `/login` is redirected to `/dashboard`
