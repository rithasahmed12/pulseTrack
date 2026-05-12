# Tailwind Color Configuration

PulseTrack uses **Tailwind CSS v4** with the built-in palette. The exported components use Tailwind classes directly with hard-coded hex codes for surface colors (so they remain portable across Tailwind v3 and v4). No `tailwind.config.js` extensions are required.

## Color Choices

- **Primary:** `violet` — `violet-600` (#7C3AED) for buttons, active nav, accents
- **Secondary:** `cyan` — `cyan-500` (#06B6D4) for complementary highlights, chart secondaries
- **Neutral:** `slate` — text and borders (`slate-100`, `slate-400`, `slate-500`, etc.)

## Functional Accents (used sparingly)

- **Rose** — destructive actions, scrape failures, danger zone
- **Amber** — paused state, "top post" highlight, best-time peak
- **Emerald** — positive delta chips, "Connected" status

## Usage Patterns

```tsx
// Primary CTA
<button className="bg-violet-600 hover:bg-violet-500 text-white">…</button>

// Active nav state
<a className="bg-violet-500/10 text-violet-100">…</a>

// Surface card
<div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-2xl">…</div>

// Secondary chip
<span className="bg-cyan-500/10 text-cyan-200 ring-1 ring-inset ring-cyan-500/25">…</span>

// Destructive button
<button className="bg-rose-500 text-white">…</button>

// Engagement tier chip — uses tabular-nums for digits
<span className="font-medium text-violet-200 tabular-nums">6.82%</span>
```

## Surface Hex Codes

PulseTrack is dark-only. Surface colors are referenced as arbitrary values (`bg-[#0F0F18]`) so they don't require Tailwind config changes:

| Token | Hex | Use |
|-------|-----|-----|
| Page background | `#0A0A0F` | App body |
| Card surface | `#0F0F18` | Section cards |
| Elevated | `#16161F` | Inputs, badges, icon tiles |
| Overlay | `#13131E` | Dropdowns, popovers, modals |
| Border subtle | `#1A1A24` | Dividers inside cards |
| Border default | `#1E1E2E` | Card outer borders |
| Border strong | `#252535` | Overlay borders |

## Glass-morphism Pattern

Cards lean into a subtle glass effect with `backdrop-blur-xl` over a translucent surface:

```tsx
<div className="bg-[#0F0F18]/85 backdrop-blur-xl border border-[#1E1E2E] rounded-2xl">…</div>
```

## Switching Theme

If you ever introduce a light mode, the components rely on the `dark` class on a parent for any `dark:` variants. The current designs are intentionally dark-only — switching to light is out of scope for v0.1.
