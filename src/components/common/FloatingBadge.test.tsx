import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import { FloatingBadge } from "./FloatingBadge"

it("sizes to its text and carries its own levitation path", () => {
  render(
    <FloatingBadge tone="brand" size="xl" float={{ x: -6, y: -10, duration: 1.8, delay: 0.3 }}>
      25+ skills
    </FloatingBadge>,
  )
  const badge = screen.getByText("25+ skills")

  // Padding only: a fixed width would clip longer translations.
  expect(badge.className).not.toMatch(/(^|\s)(min-|max-)?w-/)
  expect(badge.style.getPropertyValue("--levitate-x")).toBe("-6px")
  expect(badge.style.getPropertyValue("--levitate-y")).toBe("-10px")
  expect(badge.style.animationDuration).toBe("1.8s")
  expect(badge.style.animationDelay).toBe("0.3s")
})
