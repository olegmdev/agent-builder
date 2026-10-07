import { useLayoutEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router"
import { LOCALES } from "@/api/schemas"
import { HREFLANG, pathForLocale } from "@/locale/routing"
import { useLocale } from "@/locale/useLocale"
import { absoluteUrl, assetUrl, OG_LOCALE, pageFor, SITE } from "./pages"

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${CSS.escape(key)}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.append(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${CSS.escape(hreflang)}"]`
    : `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement("link")
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.append(el)
  }
  el.href = href
}

/**
 * Keeps the document head in step with the current route and locale.
 *
 * Every page is also prerendered with this head baked in (scripts/prerender-seo.mjs), which
 * is what link scrapers read — they do not run JavaScript. This updates the same tags in
 * place during client-side navigation rather than adding a second copy of each.
 */
export function Seo() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { pathname } = useLocation()
  const page = pageFor(pathname)

  useLayoutEffect(() => {
    const title = t(`seo.${page.key}.title`)
    const description = t(`seo.${page.key}.description`)
    const canonical = absoluteUrl(pathForLocale(page.path, locale))
    const image = assetUrl(SITE.ogImage)

    document.title = title
    upsertMeta("name", "description", description)
    upsertMeta("name", "robots", page.indexable ? "index, follow" : "noindex, follow")
    upsertLink("canonical", canonical)

    for (const code of LOCALES) {
      upsertLink("alternate", absoluteUrl(pathForLocale(page.path, code)), HREFLANG[code])
    }
    upsertLink("alternate", absoluteUrl(page.path), "x-default")

    upsertMeta("property", "og:type", "website")
    upsertMeta("property", "og:site_name", t("seo.siteName"))
    upsertMeta("property", "og:title", title)
    upsertMeta("property", "og:description", description)
    upsertMeta("property", "og:url", canonical)
    upsertMeta("property", "og:image", image)
    upsertMeta("property", "og:locale", OG_LOCALE[locale])

    upsertMeta("name", "twitter:card", "summary_large_image")
    upsertMeta("name", "twitter:title", title)
    upsertMeta("name", "twitter:description", description)
    upsertMeta("name", "twitter:image", image)
  }, [t, locale, page])

  return null
}
