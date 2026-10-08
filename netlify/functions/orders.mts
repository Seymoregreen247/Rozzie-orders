import type { Config } from "@netlify/functions"

// Returns the Rozzie Bike order-form submissions. Requires the app PIN.
export default async (req: Request) => {
  const pin = Netlify.env.get("APP_PIN")
  if (!pin || req.headers.get("x-app-pin") !== pin) {
    return Response.json({ error: "bad_pin" }, { status: 401 })
  }
  const token = Netlify.env.get("NETLIFY_TOKEN")
  const formId = Netlify.env.get("ORDER_FORM_ID") || "6abf97fc55a8e20008071740"
  if (!token) return Response.json({ error: "missing_token" }, { status: 500 })

  const all: unknown[] = []
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `https://api.netlify.com/api/v1/forms/${formId}/submissions?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
      return Response.json({ error: "netlify_error", status: res.status }, { status: 502 })
    }
    const batch = (await res.json()) as unknown[]
    all.push(...batch)
    if (batch.length < 100) break
  }
  return Response.json(all, { headers: { "cache-control": "no-store" } })
}

export const config: Config = { path: "/api/orders", method: "GET" }
