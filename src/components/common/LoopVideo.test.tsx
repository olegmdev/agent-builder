import { render } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { stubMatchMedia } from "@/test/matchMedia"
import { LoopVideo } from "./LoopVideo"

afterEach(() => vi.unstubAllGlobals())

it("plays a muted inline loop, AV1 first with an H.264 fallback", () => {
  const { container } = render(<LoopVideo name="animation_assets/home" />)
  const video = container.querySelector("video")!

  expect(video).toHaveAttribute("autoplay")
  expect(video).toHaveAttribute("loop")
  expect(video).toHaveAttribute("playsinline")
  expect(video.muted).toBe(true)
  expect(video.getAttribute("poster")).toMatch(/animation_assets\/home\.webp$/)
  const sources = [...video.querySelectorAll("source")].map((s) => s.getAttribute("src"))
  expect(sources).toEqual([
    expect.stringMatching(/home\.av1\.mp4$/),
    expect.stringMatching(/home\.mp4$/),
  ])
})

it("shows the still instead of the clip under reduced motion", () => {
  stubMatchMedia((query) => query.includes("reduced-motion"))
  const { container } = render(
    <LoopVideo name="animation_assets/step_1_business" still="goals/business.webp" />,
  )

  expect(container.querySelector("video")).toBeNull()
  expect(container.querySelector("img")?.getAttribute("src")).toMatch(/goals\/business\.webp$/)
})

it("mounts nothing while its media query doesn't match, so nothing downloads", () => {
  stubMatchMedia(() => false)
  const { container } = render(<LoopVideo name="animation_assets/home" media="(width >= 48rem)" />)

  expect(container.querySelector("video, img")).toBeNull()
})
