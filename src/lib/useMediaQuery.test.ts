import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { stubMatchMedia } from "@/test/matchMedia"
import { useMediaQuery } from "./useMediaQuery"

afterEach(() => vi.unstubAllGlobals())

it("is false where matchMedia is missing", () => {
  const { result } = renderHook(() => useMediaQuery("(width >= 48rem)"))
  expect(result.current).toBe(false)
})

it("follows the query and unsubscribes on unmount", () => {
  let wide = true
  const media = stubMatchMedia(() => wide)
  const { result, unmount } = renderHook(() => useMediaQuery("(width >= 48rem)"))
  expect(result.current).toBe(true)

  wide = false
  act(() => media.change())
  expect(result.current).toBe(false)

  unmount()
  expect(media.listeners.size).toBe(0)
})
