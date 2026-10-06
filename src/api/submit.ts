import { API_MODE, SUBMIT_SECRET, WEBHOOK_URL, delay, postJson, postWebhook } from "./client"
import type { EstimatePayload, QuickRequestPayload } from "./schemas"

const DEMO_SUBMIT_DELAY_MS = 800

/** Context both forms carry, so one Make scenario can tell them apart and route on it. */
const envelope = (type: "estimate" | "quick-request") => ({
  type,
  submittedAt: new Date().toISOString(),
  source: typeof location === "undefined" ? "" : location.host,
  ...(SUBMIT_SECRET ? { secret: SUBMIT_SECRET } : {}),
})

export async function submitEstimate(payload: EstimatePayload): Promise<void> {
  if (WEBHOOK_URL) return postWebhook({ ...envelope("estimate"), ...payload })
  if (API_MODE === "live") return postJson("/estimates", payload)
  console.log("[demo] submitEstimate", payload)
  await delay(DEMO_SUBMIT_DELAY_MS)
}

export async function submitQuickRequest(payload: QuickRequestPayload): Promise<void> {
  if (WEBHOOK_URL) return postWebhook({ ...envelope("quick-request"), ...payload })
  if (API_MODE === "live") return postJson("/quick-requests", payload)
  console.log("[demo] submitQuickRequest", payload)
  await delay(DEMO_SUBMIT_DELAY_MS)
}
