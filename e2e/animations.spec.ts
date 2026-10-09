import { expect, test } from "@playwright/test"

// Playwright's Chromium can't decode H.264, so these check the markup and sources, not playback.

const BADGES = {
  en: ["Tailored to you", "Business", "25+ skills", "Personal", "All-in-One"],
  uk: ["Під ваші потреби", "Бізнес", "25+ навичок", "Особисте", "Все-в-одному"],
}

test("landing loops the robot clip under localized floating badges", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "the hero illustration is hidden on phones")
  await page.goto("./")

  const video = page.locator("main video")
  await expect(video).toHaveAttribute("autoplay", "")
  await expect(video).toHaveAttribute("loop", "")
  await expect(video).toHaveAttribute("playsinline", "")
  await expect(video).toHaveJSProperty("muted", true)
  const sources = video.locator("source")
  await expect(sources.nth(0)).toHaveAttribute("src", /animation_assets\/home\.av1\.mp4$/)
  await expect(sources.nth(1)).toHaveAttribute("src", /animation_assets\/home\.mp4$/)

  for (const text of BADGES.en) await expect(page.getByText(text, { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "Language" }).click()
  await page.getByRole("menuitemradio", { name: /Українська/ }).click()
  for (const text of BADGES.uk) await expect(page.getByText(text, { exact: true })).toBeVisible()
})

test("phones get no landing clip, so it never downloads", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "phones only")
  await page.goto("./")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.locator("video")).toHaveCount(0)
})

test("goal preview plays the clip of the selected goal", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium", "the goal preview is desktop-only")
  await page.goto("./goal")

  const firstSource = page.locator("main video source").first()
  await expect(firstSource).toHaveAttribute("src", /step_1_all\.av1\.mp4$/)
  await page.getByText("Personal / Productivity").click()
  await expect(firstSource).toHaveAttribute("src", /step_1_personal\.av1\.mp4$/)
})

test("success page loops the thank-you clip", async ({ page }) => {
  await page.goto("./skills")
  await page.getByRole("button", { name: "Share your contacts" }).click()
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Ada Lovelace")
  await page.getByRole("textbox", { name: "Work email" }).fill("ada@example.com")
  await page.getByRole("button", { name: "Get my estimate" }).click()

  await expect(page).toHaveURL(/\/success$/)
  await expect(page.locator("main video source").first()).toHaveAttribute(
    "src",
    /animation_assets\/thx\.av1\.mp4$/,
  )
})

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" })

  test("shows stills and stops the badges", async ({ page }, info) => {
    test.skip(info.project.name !== "chromium", "desktop is enough")
    await page.goto("./")
    await expect(page.locator("main img[src$='animation_assets/home.webp']")).toBeVisible()
    await expect(page.locator("video")).toHaveCount(0)
    await expect(page.getByText("25+ skills", { exact: true })).toHaveCSS("animation-name", "none")

    await page.goto("./goal")
    await expect(page.locator("main img[src$='goals/allinone.webp']")).toBeVisible()
  })
})
