import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"
import i18n from "@/i18n"
import { LocaleProvider } from "./LocaleProvider"
import { localeFromPath, pathForLocale, stripLocale } from "./routing"
import { detectLocale, getInitialLocale, LOCALE_STORAGE_KEY } from "./storage"
import { useLocale } from "./useLocale"

beforeEach(() => localStorage.clear())

describe("detectLocale", () => {
  it.each([
    ["en-US", "en"],
    ["EN", "en"],
    ["uk-UA", "uk"],
    ["de-DE", "uk"],
    ["", "uk"],
  ])("maps %j to %s", (language, expected) => {
    expect(detectLocale(language)).toBe(expected)
  })
})

describe("getInitialLocale", () => {
  it("prefers the stored locale", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "uk")
    expect(getInitialLocale()).toBe("uk")
  })

  it("falls back to the browser language when nothing valid is stored", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "fr")
    expect(getInitialLocale()).toBe(detectLocale())
  })
})

describe("routing", () => {
  it.each([
    ["/", "en"],
    ["/goal", "en"],
    ["/uawesome", "en"],
    ["/ua", "uk"],
    ["/ua/", "uk"],
    ["/ua/goal", "uk"],
  ])("reads %j as %s", (pathname, expected) => {
    expect(localeFromPath(pathname)).toBe(expected)
  })

  it.each([
    ["/ua/goal", "/goal"],
    ["/ua", "/"],
    ["/goal", "/goal"],
    ["/uawesome", "/uawesome"],
  ])("strips the locale from %j", (pathname, expected) => {
    expect(stripLocale(pathname)).toBe(expected)
  })

  it.each([
    ["/", "uk", "/ua"],
    ["/goal", "uk", "/ua/goal"],
    ["/ua/goal", "en", "/goal"],
    ["/ua", "en", "/"],
    ["/goal", "en", "/goal"],
  ] as const)("maps %j to %s as %s", (pathname, locale, expected) => {
    expect(pathForLocale(pathname, locale)).toBe(expected)
  })
})

describe("LocaleProvider", () => {
  function Probe() {
    const { locale, setLocale } = useLocale()
    return <button onClick={() => setLocale(locale === "en" ? "uk" : "en")}>{locale}</button>
  }

  const renderAt = (initialEntry: string) => {
    const router = createMemoryRouter(
      [
        {
          element: (
            <LocaleProvider>
              <Probe />
              <Outlet />
            </LocaleProvider>
          ),
          children: [
            { path: "/", element: null },
            { path: "/goal", element: null },
            { path: "/ua", element: null },
            { path: "/ua/goal", element: null },
          ],
        },
      ],
      { initialEntries: [initialEntry] },
    )
    render(<RouterProvider router={router} />)
    return router
  }

  it("takes the locale from the URL and syncs i18n and <html lang>", async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "en")
    renderAt("/ua/goal")

    expect(screen.getByRole("button", { name: "uk" })).toBeInTheDocument()
    expect(i18n.language).toBe("uk")
    expect(document.documentElement.lang).toBe("uk")

    await act(() => i18n.changeLanguage("en"))
  })

  it("switching language navigates to the same page in the other locale", async () => {
    const user = userEvent.setup()
    localStorage.setItem(LOCALE_STORAGE_KEY, "en")
    const router = renderAt("/goal")

    await user.click(screen.getByRole("button", { name: "en" }))

    expect(router.state.location.pathname).toBe("/ua/goal")
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("uk")
    expect(screen.getByRole("button", { name: "uk" })).toBeInTheDocument()

    await act(() => i18n.changeLanguage("en"))
  })

  it("sends a Ukrainian visitor from / to /ua", async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "uk")
    const router = renderAt("/")

    expect(router.state.location.pathname).toBe("/ua")

    await act(() => i18n.changeLanguage("en"))
  })

  it("leaves an explicit English URL alone", () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "uk")
    const router = renderAt("/goal")

    expect(router.state.location.pathname).toBe("/goal")
  })

  it("useLocale throws outside the provider", () => {
    expect(() => renderHook(() => useLocale())).toThrow(/LocaleProvider/)
  })
})
