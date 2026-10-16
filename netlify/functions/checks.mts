import type { Config } from "@netlify/functions"
import { getStore } from "@netlify/blobs"

// Stores the checklist ticks (printed, paid, emailed, picked up) so every device stays in sync.
export default async (req: Request) => {
  const pin = Netlify.env.get("APP_PIN")
  if (!pin || req.headers.get("x-app-pin") !== pin) {
    return Response.json({ error: "bad_pin" }, { status: 401 })
  }
  const store = getStore({ name: "rozzie-orders", consistency: "strong" })
  const current = ((await store.get("checks", { type: "json" })) as Record<string, unknown>) || {}

  if (req.method === "POST") {
    const patch = (await req.json()) as Record<string, unknown>
    for (const [k, v] of Object.entries(patch)) {
      if (k.length >= 200) continue
      if (typeof v === "boolean") current[k] = v
      else if (k.endsWith("_method") && typeof v === "string" && ["", "Venmo", "Cash App", "PayPal", "In Person", "Other"].includes(v)) current[k] = v
      else if (k.endsWith("_paid_date") && typeof v === "string" && (v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v + "T12:00:00Z")) && new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v))) current[k] = v
      else if (k.endsWith("_receipt") && v && typeof v === "object" && !Array.isArray(v) && typeof (v as any).amount === "number" && Number.isFinite((v as any).amount) && (v as any).amount >= 0) current[k] = v
      else if (k === "reconciliation_extras" && Array.isArray(v)) current[k] = v
    }
    await store.setJSON("checks", current)
  }
  return Response.json(current, { headers: { "cache-control": "no-store" } })
}

export const config: Config = { path: "/api/checks", method: ["GET", "POST"] }
