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

## Isolated preview setup (not yet executed)
From the repository root, use `cd prototypes/okok-go` then `npx wrangler dev --config wrangler.jsonc`. Open the local preview root; `POST /api/resolve` runs in the same origin. For remote testing, deploy the *separate* `okok-go-preview` worker only after security and test review. Do not change the production `ok-ok` Worker or merge the draft PR.

## iPhone share workflow (once HTTPS preview is reachable)
Create a Shortcuts action that accepts URLs from Share Sheet and opens `https://<verified-preview-host>/?url=<URL-encoded shared URL>`. The web page resolves the map link. This is a manual Shortcut, not a registered native share extension, and the preview host must be verified rather than assumed.

## Run focused tests
`node --test prototypes/okok-go/resolve-worker.test.mjs`

Current status: router and preview configuration committed, but deployment, tests, real Google Maps shortlink expansion, physical iOS clipboard, and Grab deep link are NOT verified.

## Opt-in deployment
The repository now contains `.github/workflows/okok-go-preview-deploy.yml` which runs only by manual `workflow_dispatch`, and deploys the isolated Worker name `okok-go-preview` using the existing GitHub Cloudflare secrets. It never deploys the production `ok-ok` Worker. GitHub only exposes manual dispatch for workflows present on the default branch; therefore, this PR does not itself create a usable deploy button until the workflow is made available on the default branch. Do not merge the whole prototype merely to expose that button: first review the workflow and use a separately approved workflow-only change if desired.

After deployment, retrieve the actual workers.dev/custom domain URL from the deployment log; do not assume it. Verify `GET /` returns HTML and `POST /api/resolve` handles both safe and hostile test cases before creating the iPhone Shortcut.
