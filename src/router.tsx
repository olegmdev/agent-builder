import type { ComponentType } from "react"
import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router"
import { RootLayout } from "@/components/layout/RootLayout"
import { UA_SEGMENT } from "@/locale/routing"
import Landing from "@/routes/Landing"
import Success from "@/routes/Success"
import { RequireSubmitted } from "@/routes/guards"
import { RequireGoal, RequireSkills } from "@/routes/wizard/guards"

/** Route-level code splitting: the page chunk is fetched before the navigation commits. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

/**
 * Built fresh per locale: the same pages are mounted twice, unprefixed for English and
 * under /ua for Ukrainian, so every page has a real URL in both languages for hreflang.
 */
const appRoutes = (): RouteObject[] => [
  { index: true, element: <Landing /> },
  { path: "goal", lazy: page(() => import("@/routes/wizard/goal/GoalStep")) },
  {
    element: (
      <RequireGoal>
        <Outlet />
      </RequireGoal>
    ),
    children: [
      { path: "skills", lazy: page(() => import("@/routes/wizard/skills/SkillsStep")) },
      {
        element: (
          <RequireSkills>
            <Outlet />
          </RequireSkills>
        ),
        children: [
          { path: "contact", lazy: page(() => import("@/routes/wizard/contact/ContactStep")) },
        ],
      },
    ],
  },
  { path: "quick", lazy: page(() => import("@/routes/QuickRequest")) },
  // Stays eager: submit relies on a synchronous navigate(..., { flushSync: true }) to
  // /success, and a lazy route would make that navigation async (guard race).
  {
    path: "success",
    element: (
      <RequireSubmitted>
        <Success />
      </RequireSubmitted>
    ),
  },
]

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        ...appRoutes(),
        {
          path: UA_SEGMENT,
          // The catch-all is per-branch so an unknown /ua/* URL stays Ukrainian.
          children: [
            ...appRoutes(),
            { path: "*", element: <Navigate to={`/${UA_SEGMENT}`} replace /> },
          ],
        },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
