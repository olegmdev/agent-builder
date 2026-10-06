import type { z } from "zod"

export const API_MODE = import.meta.env.VITE_API_MODE === "live" ? "live" : "mock"

const MOCK_DELAY_MS = 300

const mockFiles = import.meta.glob<unknown>("./mocks/*/*.json", { import: "default" })

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function loadMock(path: string): Promise<unknown> {
  const load = mockFiles[`./mocks/${path}.json`]
  if (!load) throw new Error(`Mock not found: ${path}`)
  const [data] = await Promise.all([load(), delay(MOCK_DELAY_MS)])
  return data
}

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  return res.status === 204 ? undefined : res.json()
}

/**
 * GET a resource and validate it. `mockPath` is relative to `src/api/mocks`, without `.json`.
 * Throws on a schema mismatch so broken data never reaches the UI.
 */
export async function getResource<T extends z.ZodType>(
  schema: T,
  livePath: string,
  mockPath: string,
): Promise<z.infer<T>> {
  const data = API_MODE === "live" ? await fetchJson(livePath) : await loadMock(mockPath)
  return schema.parse(data)
}

export async function postJson(path: string, body: unknown): Promise<void> {
  await fetchJson(path, { method: "POST", body: JSON.stringify(body) })
}

/**
 * Make.com hook URL that receives form submissions. Empty in local dev and tests, which
 * keeps submissions on the demo path in submit.ts.
 */
export const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL ?? ""

/**
 * Shared secret echoed in every submission so the Make scenario can drop anything that
 * does not carry it. It ships in the public bundle like the hook URL above, so it filters
 * traffic that found the URL some other way; it is not access control.
 */
export const SUBMIT_SECRET = import.meta.env.VITE_SUBMIT_SECRET ?? ""

/**
 * POST to the Make.com hook. Make answers 400 on any path suffix, so every form posts to
 * this one URL and the scenario routes on the body's `type` field.
 */
export async function postWebhook(body: unknown): Promise<void> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Webhook failed: ${res.status} ${res.statusText}`)
}
