import type { Config } from "@netlify/functions"
import { getStore } from "@netlify/blobs"

// Stores the checklist ticks (printed, paid, emailed, picked up) so every device stays in sync.
export default async (req: Request) => {
  const pin = Netlify.env.get("APP_PIN")
  if (!pin || req.headers.get("x-app-pin") !== pin) {
    return Response.json({ error: "bad_pin" }, { status: 401 })
  }
  const store = getStore({ name: "rozzie-orders", consistency: "strong" })
  const current = ((await store.get("checks", { type: "json" })) as Record<string, boolean>) || {}

  if (req.method === "POST") {
    const patch = (await req.json()) as Record<string, unknown>
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === "boolean" && k.length < 200) current[k] = v
    }
    await store.setJSON("checks", current)
  }
  return Response.json(current, { headers: { "cache-control": "no-store" } })
}

export const config: Config = { path: "/api/checks", method: ["GET", "POST"] }
