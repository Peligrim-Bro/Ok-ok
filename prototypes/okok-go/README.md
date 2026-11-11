# OK-OK GO — experimental handoff

Status: draft PR, NOT deployed. No Grab/Bolt/inDrive deep-link support has been verified on physical devices.

## Prototype
- `index.html`: client-side coordinates extraction from explicit coordinates or full Google Maps URLs, confirmation map and clipboard fallback.
- `resolve-worker.mjs`: standalone Cloudflare Worker handler accepting `POST {"url":"https://maps.app.goo.gl/..."}`. Strict HTTPS Google Maps host allowlist, manual redirect limit, no page scraping, no arbitrary URL fetching, no inferred map-center location. This is **not** connected to the current site or deployed.
- Expected response: `{"lat":12.934,"lng":100.881,"source":"url","needsConfirmation":true}` or a structured error. Example values are illustrative only.

## Known limitations
- Some Google Maps short links resolve to a page without coordinates in the URL; this prototype intentionally fails closed. A proper place lookup might require a licensed provider API.
- Google Maps viewport coordinates can differ from the actual destination pin. Always confirm before dispatch.
- Grab coordinate search and custom deep links are unverified; no claim of booking handoff.
- iOS system Share extension requires native integration or a Shortcut. Telegram sharing is not equivalent to a native share extension.
- Never pass unvalidated arbitrary user URLs to fetch. Before deployment add rate limits, same-origin policy, request timeouts, privacy and API contract tests.

## Acceptance gate
Test shortlinks (including unavailable coordinates), encoded map URLs, malicious redirect attempts, non-Google hosts, mobile clipboard fallback, physical iPhone/Android Grab behavior; run repo's required build, mobile browser suite and 3 Lighthouse passes before main. Preserve all current site features and payment/referral logic.
