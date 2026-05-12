# One-Shot Implementation Prompt

I need you to implement a complete web application based on detailed UI designs and product specifications I'm providing.

## Instructions

Please carefully read and analyze the following files:

1. **@product-plan/product-overview.md** — Product summary with sections and entity overview
2. **@product-plan/instructions/one-shot-instructions.md** — Complete implementation instructions for all 9 milestones

After reading these, also review:

- **@product-plan/design-system/** — Color tokens (violet / cyan / slate), CSS variables, Tailwind notes, Google Fonts setup (Inter + JetBrains Mono)
- **@product-plan/data-shapes/** — UI data contracts: per-section `types.ts` files plus the combined `overview.ts`
- **@product-plan/shell/** — Application shell components (`AppShell`, `MainNav`, `UserMenu`) and the design intent
- **@product-plan/sections/** — Eight sections, each with `README.md`, `tests.md`, components, types, and sample data

## Before You Begin

Review all the provided files, then ask me clarifying questions about:

1. **My tech stack** — What framework, language, and tools I'm using, and any existing codebase conventions
2. **Authentication & users** — How users should sign up, log in, and what permissions exist (and how Google / Apple OAuth should be wired)
3. **Backend choices** — Whether to use Supabase + NestJS + Bull + Apify (the implied stack) or my own setup; database schema preferences
4. **Scraping** — Whether to wire Apify scraping now or stub with mock data for v0.1
5. **Real-time** — Whether to use Supabase Realtime for the activity feed or my own websocket layer
6. **Product requirements** — Anything in the specs or user flows that needs clarification

Lastly, ask me if I have any additional notes for this implementation.

Once I answer your questions, **create a comprehensive implementation plan before coding** — break it down by milestone with estimated complexity and any blockers you anticipate.

---

**Implementation order:** follow the milestone numbers (1–9) strictly. Each section's instruction file lists its prerequisites.

**Testing:** for each section, read its `tests.md` first, write tests for key user flows, then implement the feature to make them pass.
