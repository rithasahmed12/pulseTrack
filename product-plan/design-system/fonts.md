# Typography Configuration

PulseTrack uses **two Google Fonts**: Inter for headings and body, JetBrains Mono for tabular eyebrows and code.

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

Or via CSS `@import` (slower — only do this if you can't edit the document `<head>`):

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

## Font Roles

| Role | Font | Notes |
|------|------|-------|
| Headings | **Inter** | 600 / 700 weight, `tracking-tight` |
| Body | **Inter** | 400 / 500 weight |
| Mono (eyebrows, kbd, code) | **JetBrains Mono** | Used for `font-mono` utility |

## Tailwind v4 Configuration

In your global CSS:

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

(The exported `AppShell.tsx` already sets these via inline style on its root element, so the components work even without global config. If you want the rest of your app to pick up the same fonts, configure them globally.)

## Inter Feature Settings

PulseTrack enables two Inter OpenType features for cleaner numerals on stat cards:

```css
body {
  font-feature-settings: "ss01", "cv11";
}
```

- `ss01` — Stylistic Set 01 (alternate `g`, `a`, etc.)
- `cv11` — Character Variant 11 (single-story `a`)

This is **optional** — the components don't require it. They use the `tabular-nums` utility (`font-variant-numeric: tabular-nums`) on every numeric value so digits align in columns regardless of the feature set.
