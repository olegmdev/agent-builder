import type { Locale } from "@/api/schemas"

/**
 * Ukrainian pages live under /ua/, English stays unprefixed. "ua" is a URL choice; the
 * language tag stays "uk" (ISO 639-1), which is what <html lang> and hreflang require —
 * crawlers ignore "ua" there, since it is a country code.
 */
export const UA_SEGMENT = "ua"

/** Matches the segment only as a whole path step, so "/uaxyz" is not Ukrainian. */
const UA_PREFIX = new RegExp(`^/${UA_SEGMENT}(?=/|$)`)

export const HREFLANG: Record<Locale, string> = { en: "en", uk: "uk" }

/**
 * What the language switcher shows. "UK" is the correct ISO 639-1 code but reads as United
 * Kingdom, so Ukrainian is labelled UA — the same reason the URL segment is /ua/.
 */
export const LOCALE_LABEL: Record<Locale, string> = { en: "EN", uk: "UA" }

export function localeFromPath(pathname: string): Locale {
  return UA_PREFIX.test(pathname) ? "uk" : "en"
}

/** Drops the locale segment: "/ua/goal" and "/goal" both become "/goal". */
export function stripLocale(pathname: string): string {
  return pathname.replace(UA_PREFIX, "") || "/"
}

/** The same page in another locale. */
export function pathForLocale(pathname: string, locale: Locale): string {
  const bare = stripLocale(pathname)
  if (locale === "en") return bare
  return bare === "/" ? `/${UA_SEGMENT}` : `/${UA_SEGMENT}${bare}`
}
