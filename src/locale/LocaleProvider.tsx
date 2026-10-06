import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router"
import type { Locale } from "@/api/schemas"
import i18n from "@/i18n"
import { LocaleContext } from "./context"
import { localeFromPath, pathForLocale } from "./routing"
import { getInitialLocale, writeStoredLocale } from "./storage"

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  // The URL is the single source of truth, so a shared or crawled link always renders the
  // language it names.
  const locale = localeFromPath(pathname)

  const setLocale = useCallback(
    (next: Locale) => {
      writeStoredLocale(next)
      // Replace, so switching language mid-wizard does not leave a back-button toggle. The
      // navigation stays client-side, so the wizard store survives it.
      void navigate({ pathname: pathForLocale(pathname, next), search, hash }, { replace: true })
    },
    [navigate, pathname, search, hash],
  )

  // Before paint, so UI strings and <html lang> never lag behind the URL.
  useLayoutEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale)
    document.documentElement.lang = locale
  }, [locale])

  // Bare "/" only, once: send a Ukrainian visitor to /ua the way the old localStorage lookup
  // used to pick their language. Every other URL is taken literally.
  const settled = useRef(false)
  useEffect(() => {
    if (settled.current) return
    settled.current = true
    if (pathname !== "/" || getInitialLocale() === "en") return
    void navigate({ pathname: pathForLocale("/", "uk"), search, hash }, { replace: true })
  }, [navigate, pathname, search, hash])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])
  return <LocaleContext value={value}>{children}</LocaleContext>
}
