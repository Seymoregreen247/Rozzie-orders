# Rozzie Orders (PWA)

Home-screen app for the I Bike Roslindale shirt order. Pulls live orders from the
`rozzie-order` Netlify form, keeps Printed / Paid / Emailed / Picked up checks synced
across devices, and has one-tap "ready for pickup" emails.

## Netlify environment variables (scope: Functions)
- `APP_PIN` — the PIN you type to open the app
- `NETLIFY_TOKEN` — a Netlify personal access token (User settings → Applications → Personal access tokens)
- `ORDER_FORM_ID` — optional; defaults to the rozzie-order form

Build settings come from `netlify.toml` (publish `public`, functions `netlify/functions`).
