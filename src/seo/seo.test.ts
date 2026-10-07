import { describe, expect, it } from "vitest"
import { resources } from "@/i18n"
import { pathForLocale } from "@/locale/routing"
import { absoluteUrl, assetUrl, pageFor, SEO_PAGES, SITE } from "./pages"

describe("pageFor", () => {
  it.each([
    ["/", "landing"],
    ["/ua", "landing"],
    ["/goal", "goal"],
    ["/ua/goal", "goal"],
    ["/goal/", "goal"],
    ["/ua/contact", "contact"],
  ])("resolves %j to the %s entry", (pathname, key) => {
    expect(pageFor(pathname).key).toBe(key)
  })

  it("falls back to the landing entry, the way the router redirects unknown paths", () => {
    expect(pageFor("/nope").key).toBe("landing")
  })
})

describe("SEO copy", () => {
  const locales = Object.keys(resources) as (keyof typeof resources)[]

  it.each(locales)("%s has a title and description for every page", (locale) => {
    const seo = resources[locale].translation.seo
    for (const page of SEO_PAGES) {
      expect(seo[page.key].title, `${locale}.seo.${page.key}.title`).toBeTruthy()
      expect(seo[page.key].description, `${locale}.seo.${page.key}.description`).toBeTruthy()
    }
  })

  it.each(locales)("%s keeps titles and descriptions inside what search results show", (locale) => {
    const seo = resources[locale].translation.seo
    for (const page of SEO_PAGES) {
      expect(seo[page.key].title.length, `${locale}.${page.key} title`).toBeLessThanOrEqual(60)
      expect(
        seo[page.key].description.length,
        `${locale}.${page.key} description`,
      ).toBeLessThanOrEqual(155)
    }
  })
})

describe("canonical URLs", () => {
  // GitHub Pages 301s /goal to /goal/, so advertised URLs name the trailing-slash form.
  it.each([
    ["/", "en", "https://ai-agent-builder.incode-group.com/"],
    ["/", "uk", "https://ai-agent-builder.incode-group.com/ua/"],
    ["/goal", "en", "https://ai-agent-builder.incode-group.com/goal/"],
    ["/goal", "uk", "https://ai-agent-builder.incode-group.com/ua/goal/"],
  ] as const)("maps %j in %s to %s", (path, locale, expected) => {
    expect(absoluteUrl(pathForLocale(path, locale))).toBe(expected)
  })

  it("never emits a doubled slash", () => {
    for (const page of SEO_PAGES) {
      for (const locale of ["en", "uk"] as const) {
        expect(absoluteUrl(pathForLocale(page.path, locale))).not.toMatch(/[^:]\/\//)
      }
    }
  })
})

describe("asset URLs", () => {
  // /og.jpg/ answers 404, which costs every link preview and the JSON-LD logo.
  it("never gives a static file the directory trailing slash", () => {
    for (const file of [SITE.ogImage, SITE.organization.logo]) {
      expect(assetUrl(file), file).toBe(`https://ai-agent-builder.incode-group.com${file}`)
      expect(assetUrl(file).endsWith("/"), file).toBe(false)
    }
  })
})
