import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router"
import { beforeEach, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LocaleProvider } from "@/locale/LocaleProvider"
import { LOCALE_STORAGE_KEY } from "@/locale/storage"
import { useLocale } from "@/locale/useLocale"
import { useWizardStore } from "@/store/wizard"
import SkillsStep from "./SkillsStep"

beforeEach(() => {
  localStorage.clear()
  useWizardStore.setState(useWizardStore.getInitialState(), true)
  localStorage.setItem(LOCALE_STORAGE_KEY, "en")
})

function SwitchToUkrainian() {
  const { setLocale } = useLocale()
  return <button onClick={() => setLocale("uk")}>Switch to Ukrainian</button>
}

// LocaleProvider reads the locale off the URL, so it has to sit inside the router. Both
// locales are mounted because switching language navigates to the /ua twin of the page.
const renderSkills = () => {
  const router = createMemoryRouter(
    [
      {
        element: (
          <LocaleProvider>
            <SwitchToUkrainian />
            <Outlet />
          </LocaleProvider>
        ),
        children: [
          { path: "/skills", element: <SkillsStep /> },
          { path: "/ua/skills", element: <SkillsStep /> },
          { path: "/contact", element: <p>contact</p> },
          { path: "/ua/contact", element: <p>contact</p> },
        ],
      },
    ],
    { initialEntries: ["/skills"] },
  )
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>,
  )
}

it("lands with defaults selected and disables the primary button at 0 skills", async () => {
  const user = userEvent.setup()
  renderSkills()

  const next = screen.getByRole("button", { name: /finish/i })
  expect(next).toBeDisabled() // skeleton while loading, never an enabled-then-disabled flash

  const checked = await screen.findAllByRole("checkbox", { checked: true })
  expect(checked).toHaveLength(3)
  expect(next).toBeEnabled()

  const summary = screen.getByLabelText(/what your agent will do/i)
  await user.click(within(summary).getByRole("button", { name: /remove search, documents/i }))

  expect(screen.queryAllByRole("checkbox", { checked: true })).toHaveLength(0)
  expect(next).toBeDisabled()
})

it("keeps the user's selections when the language changes (no re-seed)", async () => {
  const user = userEvent.setup()
  renderSkills()

  const [first] = await screen.findAllByRole("checkbox", { checked: true })
  await user.click(first)
  expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(2)

  await user.click(screen.getByRole("button", { name: "Switch to Ukrainian" }))
  await screen.findAllByText("Пошук, документи та знання")

  expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(2)
  expect(document.documentElement.lang).toBe("uk")
})
