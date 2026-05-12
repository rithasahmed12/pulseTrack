# Authentication

## Overview

Authentication is PulseTrack's entry point — a full-screen split layout that sits **outside the app shell**. The left panel carries the brand (small wordmark + editorial pull-quote + minimal stat strip). The right panel carries the form — either Sign In or Create Account — with email + password fields, social-provider buttons (Google, Apple), and a smooth toggle between the two flows.

## User Flows

- Returning analyst lands on `/login` → enters email + password → optional "Remember me" → submits → routed to `/dashboard`.
- New analyst clicks "Create account" → `/signup` → enters name + email + password + confirms + accepts T&C → submits → routed to `/dashboard`.
- Either flow can be initiated via "Continue with Google" / "Continue with Apple".
- Analyst clicks "Forgot password?" → recovery flow (stub, UI only in v0.1).
- Authenticated user landing on `/login` → redirect to `/dashboard` (handled outside this section).

## Design Decisions

- **Restrained editorial direction** — no aurora, no orbs, no rainbow gradient. The brand panel reads like a magazine pull-quote spread.
- **Split layout sized to viewport** — `lg:h-screen lg:overflow-hidden` so both panels share the viewport on desktop without overflow. The form panel uses `overflow-y-auto` internally so the signup form can scroll inside its half on short heights.
- **In-place mode toggle** — the same `LoginScreen` and `SignupScreen` wrappers each render `LoginForm` or `SignupForm`; clicking the footer link swaps modes without a route change. In your real app, route to `/login` vs `/signup` and let each route default to its own mode.

## Data Shapes

**Entities:** `BrandCopy`, `Quote`, `BrandStat`, `AuthFormCopy`, `LegalLinks`, `LoginFormValues`, `SignupFormValues`, `SocialProvider`.

This section is **content-only** — none of the global entities (Profile, Post, etc.) are referenced. The shapes describe layout copy and form state.

## Components Provided

- **`AuthLayout`** — Full-viewport split wrapper. Injects Inter + JetBrains Mono Google Fonts. Accepts a `branding` prop and `children`.
- **`AuthBranding`** — Left panel: wordmark, pull-quote with violet rule, attribution, stat strip, copyright.
- **`LoginForm`** — Email + password form with show/hide, "Keep me signed in", social buttons, footer link to switch to signup.
- **`SignupForm`** — Name + email + password + confirm + T&C form with password-strength meter, social buttons, footer link.
- **`SocialAuthButtons`** — Google + Apple buttons (full-color SVGs).

## Callback Props

The main entry components (`LoginScreen`, `SignupScreen` in the preview wrappers — recreate as routes in your app) compose these sub-components. The form-level callbacks are:

| Callback | Triggered When |
|----------|---------------|
| `onSubmit(values)` | User submits the login or signup form (after client-side validation passes) |
| `onForgotPassword()` | User clicks "Forgot password?" on the login form |
| `onSwitchToSignup()` / `onSwitchToLogin()` | User clicks the mode-toggle footer link |
| `onProviderClick(providerId)` | User clicks a social-auth button |

## Visual Reference

The brand panel uses a single subtle dotted gradient confined to the top-right quadrant (no animation). The submit button is a solid `bg-violet-600` (no gradient) with a quiet shadow. Field labels are sentence case (not mono uppercase).
