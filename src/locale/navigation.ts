import { useCallback } from "react"
import { useLocation, useNavigate, type NavigateOptions } from "react-router"
import { localeFromPath, pathForLocale } from "./routing"

/**
 * Every page is mounted twice — unprefixed and under /ua — and the locale is read back off
 * the URL. A plain `to="/goal"` therefore does not just change page, it changes language:
 * from /ua it lands on the English branch and the UI flips to English mid-wizard. These
 * helpers keep navigation inside the locale the visitor is already in, so use them (or
 * ButtonLink, which applies them for you) for every in-app destination.
 */
export function useLocalePath() {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)
  return useCallback((to: string) => pathForLocale(to, locale), [locale])
}

export function useLocaleNavigate() {
  const localePath = useLocalePath()
  const navigate = useNavigate()
  return useCallback(
    (to: string, options?: NavigateOptions) => navigate(localePath(to), options),
    [localePath, navigate],
  )
}
