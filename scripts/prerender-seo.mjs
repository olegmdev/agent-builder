/**
 * Writes a real HTML file per route and locale, each with its own head.
 *
 * The app is client-rendered, so without this every URL would serve the same markup. Link
 * scrapers (LinkedIn, Facebook, Slack, X) never run JavaScript, so the runtime head in
 * src/seo/Seo.tsx is invisible to them — the tags have to be in the served HTML. As a bonus,
 * GitHub Pages now answers these paths with 200 instead of falling through to 404.html.
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const DIST = "dist"
const UA_SEGMENT = "ua"
const LOCALES = ["en", "uk"]
const HREFLANG = { en: "en", uk: "uk" }
const OG_LOCALE = { en: "en_US", uk: "uk_UA" }

const readJson = async (p) => JSON.parse(await readFile(p, "utf8"))

const routes = await readJson("src/seo/routes.json")
const site = await readJson("src/seo/site.json")
const copy = Object.fromEntries(
  await Promise.all(
    LOCALES.map(async (l) => [l, (await readJson(`src/i18n/locales/${l}.json`)).seo]),
  ),
)

const pathForLocale = (p, locale) =>
  locale === "en" ? p : p === "/" ? `/${UA_SEGMENT}` : `/${UA_SEGMENT}${p}`
// GitHub Pages 301s /goal to /goal/, so every advertised URL names the 200 form.
const canonicalPath = (p) => (p === "/" ? "/" : `${p.replace(/\/+$/, "")}/`)
const abs = (p) => new URL(canonicalPath(p), site.url).href
// Files are not directories: /og.jpg/ is a 404, so assets skip the trailing slash.
const absFile = (p) => new URL(p, site.url).href
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** "Choose Your AI Agent's Goal | AI Agent Scope Builder" -> "Choose Your AI Agent's Goal". */
const shortTitle = (title) => title.split("|")[0].trim()

function jsonLd(route, locale) {
  // The site node is per-locale: /#website and /ua/#website are different pages, so they
  // must not share an @id. The organization is one real entity, so it keeps a single id.
  const home = abs(pathForLocale("/", locale))
  const org = {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.organization.name,
    url: site.organization.url,
    logo: absFile(site.organization.logo),
    sameAs: site.organization.sameAs,
  }
  const website = {
    "@type": "WebSite",
    "@id": `${home}#website`,
    url: home,
    name: copy[locale].siteName,
    inLanguage: HREFLANG[locale],
    publisher: { "@id": `${site.url}/#organization` },
  }

  if (route.path === "/") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        org,
        website,
        {
          "@type": "WebApplication",
          "@id": `${home}#webapp`,
          name: copy[locale].siteName,
          url: home,
          description: copy[locale].landing.description,
          applicationCategory: "BusinessApplication",
          browserRequirements: "Requires JavaScript",
          operatingSystem: "Web",
          inLanguage: HREFLANG[locale],
          image: absFile(site.ogImage),
          publisher: { "@id": `${site.url}/#organization` },
        },
      ],
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: copy[locale].siteName,
        item: home,
      },
      { "@type": "ListItem", position: 2, name: shortTitle(copy[locale][route.key].title) },
    ],
  }
}

function head(route, locale) {
  const page = copy[locale][route.key]
  const canonical = abs(pathForLocale(route.path, locale))
  const image = absFile(site.ogImage)
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<meta name="robots" content="${route.indexable ? "index, follow" : "noindex, follow"}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    ...LOCALES.map(
      (l) =>
        `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${abs(pathForLocale(route.path, l))}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${abs(route.path)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(copy[locale].siteName)}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${site.ogImageWidth}" />`,
    `<meta property="og:image:height" content="${site.ogImageHeight}" />`,
    `<meta property="og:image:type" content="${site.ogImageType}" />`,
    `<meta property="og:image:alt" content="${esc(page.title)}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[locale]}" />`,
    ...LOCALES.filter((l) => l !== locale).map(
      (l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`,
    ),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
  if (route.indexable) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(jsonLd(route, locale)).replace(/</g, "\\u003c")}</script>`,
    )
  }
  return tags.map((tag) => `    ${tag}`).join("\n")
}

const MARKERS = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/

const template = await readFile(path.join(DIST, "index.html"), "utf8")
if (!MARKERS.test(template)) {
  throw new Error("dist/index.html has no <!-- seo:start --> block — index.html lost its markers")
}

const AUTHORING_NOTE = /\n\s*<!--\s*\n\s*Everything between the markers[\s\S]*?-->/

function render(route, locale) {
  return template
    .replace(AUTHORING_NOTE, "")
    .replace(MARKERS, `<!-- seo:start -->\n${head(route, locale)}\n    <!-- seo:end -->`)
    .replace(/<html lang="[^"]*"/, `<html lang="${HREFLANG[locale]}"`)
}

const written = []
for (const locale of LOCALES) {
  for (const route of routes) {
    const urlPath = pathForLocale(route.path, locale)
    const file =
      urlPath === "/" ? path.join(DIST, "index.html") : path.join(DIST, urlPath, "index.html")
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, render(route, locale))
    written.push(urlPath)
  }
}

// GitHub Pages serves 404.html for anything unmatched; the app routes it back to "/".
const notFound = routes[0]
await writeFile(
  path.join(DIST, "404.html"),
  render({ ...notFound, indexable: false }, "en").replace(
    `<meta name="robots" content="noindex, follow" />`,
    `<meta name="robots" content="noindex, nofollow" />`,
  ),
)

const sitemap = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
  ...LOCALES.flatMap((locale) =>
    routes
      .filter((route) => route.indexable)
      .map((route) =>
        [
          `  <url>`,
          `    <loc>${abs(pathForLocale(route.path, locale))}</loc>`,
          ...LOCALES.map(
            (l) =>
              `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${abs(pathForLocale(route.path, l))}" />`,
          ),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(route.path)}" />`,
          `  </url>`,
        ].join("\n"),
      ),
  ),
  `</urlset>`,
].join("\n")
await writeFile(path.join(DIST, "sitemap.xml"), `${sitemap}\n`)

// The og:image is only ever exercised by scrapers, so a missing file fails silently in
// every browser and shows up as a blank preview on LinkedIn days later. Fail the build.
await access(path.join(DIST, site.ogImage)).catch(() => {
  throw new Error(
    `prerender-seo: site.json names ogImage "${site.ogImage}" but ${path.join(DIST, site.ogImage)} does not exist. ` +
      `Add the file to public/ or correct site.json.`,
  )
})

console.log(`prerender-seo: ${written.length} pages, 404.html, sitemap.xml`)
console.log(written.map((p) => `  ${p}`).join("\n"))
