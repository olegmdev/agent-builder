import { vi } from "vitest"

/**
 * Stubs `window.matchMedia` (jsdom has none). `matches` decides each query's result; call
 * `change()` after updating what it returns to notify subscribers.
 */
export function stubMatchMedia(matches: (query: string) => boolean) {
  const listeners = new Set<() => void>()
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return matches(query)
    },
    media: query,
    addEventListener: (_: "change", listener: () => void) => listeners.add(listener),
    removeEventListener: (_: "change", listener: () => void) => listeners.delete(listener),
  }))
  return {
    listeners,
    change: () => listeners.forEach((listener) => listener()),
  }
}
