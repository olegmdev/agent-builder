# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**AI Agent Scope Builder**: a standalone demo app for Incode Group. It is a 3-step wizard (goal → skills + connectors → contact details → thank-you screen) that collects requirements so the team can prepare a cost estimate by hand. It is deployed to GitHub Pages as a static site. Desktop follows the mockups in `docs/design/`; tablet and mobile layouts are improvised (single column below `lg`).

**[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) is the source of truth** for screens, routes, data model, store shape, and phases. Read the relevant section before building a feature. Anything listed under "Open questions" (§12) must be confirmed with the user before you build the affected part. Do not guess.

Phases 1–4 are implemented and follow the layout in plan §9. There is an extra `/quick` route (the short form, plan §4.7).

## Commands

Package manager is **pnpm**.

```bash
pnpm dev        # Vite dev server
pnpm build      # tsc -b (type-check all project refs) && vite build
pnpm lint       # eslint .
pnpm preview    # serve the production build
```

```bash
pnpm test       # Vitest (store logic + SkillsStep component test)
pnpm test:e2e   # Playwright: builds with base /agent-builder/ and runs against vite preview
pnpm format     # Prettier (no semicolons, double quotes, width 100)
```

Mock fixtures in `src/api/mocks/` are JSON. Keep IDs identical across `en/` and `uk/`.

## Stack notes that differ from common defaults

- **React 19, Vite 8, TypeScript 6, Tailwind v4** (via `@tailwindcss/vite`; there is no `tailwind.config`, and theme tokens live in `src/index.css` under `@theme`).
- **React Router v8**: import from `react-router`, not `react-router-dom`. Use `createBrowserRouter` with `basename: import.meta.env.BASE_URL`.
- **shadcn/ui on Base UI** (`@base-ui/react`, style `base-nova`), not Radix. Compose with the **`render` prop**, never `asChild`. Do not add components that depend on Radix. Add primitives with `pnpm dlx shadcn@latest add <name>`.
  - Exception: for **navigation links styled as buttons** use `components/common/ButtonLink`. `<Button render={<Link />}>` gives the link `role="button"`.
- `RouterProvider` is imported from **`react-router/dom`**. Without it, `navigate(..., { flushSync: true })` is ignored, and the submit flow relies on that flag to avoid a guard race.
- **Zod v4**, **Zustand v5**, **TanStack Query v5**, **i18next 26 / react-i18next 17**. Check current docs; APIs differ from older majors.
- Path alias `@/*` → `src/*`.
- `cn` is imported from the npm package `cn` (see `src/lib/utils.ts` and `components/ui/button.tsx`), not the usual local `clsx` + `tailwind-merge` helper. `cn` is shadcn's drop-in replacement for that helper.
- TS is strict, with `verbatimModuleSyntax` (use `import type` for types) and `erasableSyntaxOnly` (no `enum`s, namespaces or parameter properties).

## Architecture (planned, see the plan for details)

- **Two kinds of text:**
  - UI strings come from react-i18next (`src/i18n/locales/{uk,en}.json`).
  - Content (goals, categories, skills, connectors) comes **already localized from the API**, one locale per request.
  - The locale is never in the URL. It lives in `LocaleProvider` (`src/locale/`, read it with `useLocale()`), persisted under `scope-builder-locale`, separate from the wizard store.
- **API layer** (`src/api/`): `client.ts` switches between mocks and real fetch via `VITE_API_MODE=mock|live`. Every response is parsed with Zod and throws on a mismatch.
  - Mocks live in `src/api/mocks/{uk,en}/`. **IDs must be identical across locales.**
  - `submitEstimate` is demo-only: it logs the payload and resolves after about 800 ms.
- **Server state:** TanStack Query keys always include the locale (`['goals', locale]`, `['categories', goalId, locale]`). Use `keepPreviousData` so a language switch keeps the old content visible.
- **Wizard state:** Zustand with `persist` (key `scope-builder-wizard`, versioned with `migrate`).
  - Selections store **IDs only**. Labels always come from the current-locale catalog.
  - The summary panel is derived, never stored.
- **Default seeding (plan §6.1):** Step 2 seeds `selections` from the goal's `defaultSelectedSkills` only when `selectionsGoalId !== goalId`.
  - Seeding happens in a single store update, after filtering out unknown skill and connector IDs.
  - A language change or a reload must never re-seed. This logic is the main thing the unit tests cover.
- **Route guards:**
  - `/skills` needs a `goalId`.
  - `/contact` needs at least one selected skill.
  - `/success` needs `location.state.submitted`.
  - A successful submit calls `resetWizard()`, then navigates to `/success` with `replace`.
- **GitHub Pages:** set `base: '/<repo-name>/'` in `vite.config.ts`. The deploy workflow copies `dist/index.html` → `dist/404.html` so deep links survive a refresh. Build with `VITE_API_MODE=mock`.

## Design

Take colors, typography, spacing and icons from the PNG mockups in `docs/design/` (there is no Figma file) and define them as Tailwind theme tokens in `src/index.css`. The visual language is flat, with square corners, 1–2 px borders, a single green accent and light grey panels. Restyle the shadcn defaults (which are rounded and neutral) to match.

Robot animations follow [docs/ANIMATIONS_PLAN.md](docs/ANIMATIONS_PLAN.md). Video masters live in the gitignored `assets-src/animations/`; after the designer sends new ones, run `scripts/encode-videos.sh [name]` (needs `brew install ffmpeg webp`) to regenerate the AV1, H.264 and WebP files in `public/animation_assets/`. Never put masters in `public/`.
