# Section Implementation Prompt

## Define Section Variables

Set these three variables before sending the prompt to your coding agent. Pick from the table below:

| NN | SECTION_NAME | SECTION_ID |
|----|--------------|------------|
| 01 | Shell | `shell` |
| 02 | Authentication | `authentication` |
| 03 | Tracked Profiles | `tracked-profiles` |
| 04 | Dashboard | `dashboard` |
| 05 | Profile Detail | `profile-detail` |
| 06 | Posts | `posts` |
| 07 | Trending | `trending` |
| 08 | App Profile | `app-profile` |
| 09 | Settings | `settings` |

(For Shell, files live under `product-plan/shell/` instead of `product-plan/sections/SECTION_ID/`. Adjust the prompt paths accordingly.)

- **SECTION_NAME** = [Human-readable name, e.g., "Tracked Profiles"]
- **SECTION_ID** = [Folder slug, e.g., "tracked-profiles"]
- **NN** = [Milestone number, e.g., "03"]

---

## Prompt

I need you to implement the **SECTION_NAME** section of my application.

## Instructions

Please carefully read and analyze the following files:

1. **@product-plan/product-overview.md** — Product summary for overall context
2. **@product-plan/instructions/incremental/NN-SECTION_ID.md** — Specific instructions for this section

Also review the section assets:

- **@product-plan/sections/SECTION_ID/README.md** — Feature overview, design decisions, callback reference
- **@product-plan/sections/SECTION_ID/tests.md** — UI behavior test specs (framework-agnostic)
- **@product-plan/sections/SECTION_ID/components/** — React components to integrate
- **@product-plan/sections/SECTION_ID/types.ts** — TypeScript interfaces for props and data
- **@product-plan/sections/SECTION_ID/sample-data.json** — Test data shaped to the types

## Before You Begin

Review all the provided files, then ask me clarifying questions about:

1. **Integration** — How this section connects to existing features and any APIs already built
2. **Backend wiring** — Database schema and API endpoints this section needs
3. **Product requirements** — Anything in the specs or user flows that needs clarification
4. **Anything else** — Whatever you need to know before implementing

Lastly, ask me if I have any additional notes for this implementation.

Once I answer your questions, proceed with implementation. **Read `tests.md` first** and write tests for the key user flows before / alongside building the feature.
