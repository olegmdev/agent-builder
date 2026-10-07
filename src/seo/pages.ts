import { z } from "zod"
import type { Locale } from "@/api/schemas"
import { stripLocale } from "@/locale/routing"
import routes from "./routes.json"
import site from "./site.json"

/** Keys of the `seo` block in the locale files; each page reads its copy from there. */
const seoKeySchema = z.enum(["landing", "goal", "skills", "contact", "quick", "success"])
export type SeoKey = z.infer<typeof seoKeySchema>

const seoPageSchema = z.object({
  key: seoKeySchema,
  path: z.string().startsWith("/"),
  indexable: z.boolean(),
})
export type SeoPage = z.infer<typeof seoPageSchema>

/** Throws at startup if routes.json drifts from the copy keys, rather than shipping a blank title. */
export const SEO_PAGES = z.array(seoPageSchema).nonempty().parse(routes)

/** Open Graph wants a full locale tag; our locale codes are the language half of it. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", uk: "uk_UA" }

export const SITE = site

/**
 * GitHub Pages serves these routes as directories and 301s /goal to /goal/, so the
 * canonical and hreflang URLs have to name the trailing-slash form that answers 200.
 */
export function canonicalPath(path: string): string {
  return path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`
}

export function absoluteUrl(path: string): string {
  return new URL(canonicalPath(path), site.url).href
}

/**
 * Absolute URL for a static file. Files are not directories, so they must NOT take the
 * trailing slash `absoluteUrl` adds: /og.jpg/ is a 404, which silently kills every link
 * preview and the Organization logo in the JSON-LD.
 */
export function assetUrl(path: string): string {
  return new URL(path, site.url).href
}

/**
 * The SEO entry for a URL. Trailing slashes are stripped because GitHub Pages redirects
 * /goal to /goal/, and unknown paths fall back to the landing entry the way the router
 * redirects them to "/".
 */
export function pageFor(pathname: string): SeoPage {
  const bare = stripLocale(pathname).replace(/\/+$/, "") || "/"
  return SEO_PAGES.find((page) => page.path === bare) ?? SEO_PAGES[0]
}
