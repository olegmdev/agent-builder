import { expect, test } from "@playwright/test"

test("landing → goal → skills (defaults) → contact → success", async ({ page }) => {
  await page.goto("./")
  await page.getByRole("main").getByRole("link", { name: "Let's build" }).click()

  await expect(page).toHaveURL(/\/goal$/)
  await expect(page.getByRole("radio", { name: /All-in-One/ })).toBeChecked()
  await page.getByRole("link", { name: "Choose skills" }).click()

  await expect(page).toHaveURL(/\/skills$/)
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(3)
  await page.getByRole("button", { name: "Share your contacts" }).click()

  await expect(page).toHaveURL(/\/contact$/)
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Ada Lovelace")
  await page.getByRole("textbox", { name: "Work email" }).fill("ada@example.com")
  await page.getByRole("button", { name: "Get my estimate" }).click()

  await expect(page).toHaveURL(/\/success$/)
  await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible()

  // Router state is lost on reload → back to the landing page.
  await page.reload()
  await expect(page).toHaveURL(/\/agent-builder\/$/)
})

test("deep link to /skills survives a hard load and validates the contact form", async ({
  page,
}) => {
  await page.goto("./skills")
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(3)
  await page.getByRole("button", { name: "Share your contacts" }).click()
  await page.getByRole("button", { name: "Get my estimate" }).click()
  await expect(page.getByText("Please enter your name")).toBeVisible()
  await expect(page).toHaveURL(/\/contact$/)
})
