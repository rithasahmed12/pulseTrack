# UI Data Shapes

These types define the shape of data that the PulseTrack UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture (Supabase tables, Prisma models, REST DTOs, GraphQL types, etc.).

## Core Entities

The product is built around seven entities (per the original data shape):

- **Profile** — The PulseTrack analyst account (display name, avatar, theme prefs, notification settings). Used by: `app-profile`, `settings`, `dashboard` (for the greeting).
- **TrackedAccount** — A public IG or TikTok profile the analyst monitors. Used by: `tracked-profiles`, `profile-detail`, `dashboard`, and indirectly by `posts` and `trending`.
- **Post** — A scraped post tied to a TrackedAccount. Used by: `posts`, `profile-detail`, `dashboard`, `trending`.
- **Hashtag** — Tags observed across scraped posts, with usage and growth tracking. Used by: `trending` (and the post detail modal's tag chips).
- **ActivityEvent** — Timeline events for the live feed (new post, follower spike, trending hashtag, scrape complete / failed). Used by: `dashboard`.
- **FollowerSnapshot** — Point-in-time follower counts. Drives the `profile-detail` follower-growth chart.
- **ScrapeJob** — Queued or completed scrape runs. Surfaces only as state changes inside `tracked-profiles` cards.

## Per-Section Types

Each section bundles its own `types.ts` with the full interface definitions used by that section's components. The `Props` interface (e.g., `DashboardProps`, `PostsProps`) lists every prop the top-level view component accepts.

| Section | Types file |
|---------|-----------|
| Authentication | `sections/authentication/types.ts` |
| Tracked Profiles | `sections/tracked-profiles/types.ts` |
| Dashboard | `sections/dashboard/types.ts` |
| Profile Detail | `sections/profile-detail/types.ts` |
| Posts | `sections/posts/types.ts` |
| Trending | `sections/trending/types.ts` |
| App Profile | `sections/app-profile/types.ts` |
| Settings | `sections/settings/types.ts` |

## Combined Reference

See [`overview.ts`](./overview.ts) for **all data-shape interfaces aggregated in one file** — useful when designing your backend schema or generating database migrations. The combined file omits component `Props` interfaces (those stay scoped to each section).

## Naming Conventions

- **PascalCase** for interface and type names: `TrackedAccount`, `ProfilePost`
- **camelCase** for fields: `displayName`, `createdAt`, `engagementRate`
- **String unions** for enums: `Platform = 'instagram' | 'tiktok'`
- **ISO 8601 strings** for timestamps (the components handle date parsing internally)
- **`null` for "absent"** when the field is part of the contract but optional (e.g., `lastScrapedAt: string | null`)
- **`?` for "may not be present"** on object fields that the component should treat as absent

## Implementer Notes

- The components never import data files directly. Every component is **props-based** and receives data via its `Props` interface.
- All callbacks (`onClick`, `onChange`, etc.) are **optional** — components render correctly without handlers wired.
- Numbers in JSON are plain JS numbers; components apply formatting (`formatCount`, `toFixed`) at render time.
- Synthetic thumbnail support: posts carry a `thumbnailHue: number` (0–359) that the components convert to a gradient. Replace with a real `thumbnailUrl` once your scraper persists CDN URLs.
