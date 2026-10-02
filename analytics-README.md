# OKI usage analytics

Collection: POST /api/oki/events. Health: GET /api/oki/health.
Owner report: `/oki` in the existing Telegram bot. Webhook secret and private owner chat are verified before reading. Delivery uses the existing durable outbox.

Metrics: active browsers 1/7/30 days, new browsers, age-specific care, daily rewards, Tetris starts/wins/losses/early exits, shop views/unlocks/crystal purchases and language. Wearing an owned skin is not a purchase. Calendar days use Asia/Bangkok.

D1/D7/D30: returns on the exact day after first observed use. Denominator: the latest 30 eligible cohort days. Immature cohorts show insufficient data. Browser IDs do not identify people across devices.

Storage: isolated SQLite instance `okok-oki-metrics-v1` of existing AdsStore. Never accesses payment or wallet records. No new binding, migration, service or secret. Frontend sends random UUID, allowlisted event, timestamp, language, age stage and item. Server stores a salted hash of the UUID; no IP, names, contacts, balances, gameplay boards or wallets. Detail records and dormant IDs expire after 65 days via ingest/report cleanup. First observed day is retained while a browser remains active.

Translated toggle in OKI: turning off discards unsent events and local analytics ID, persists the choice, preserves game progress. DNT and Global Privacy Control disable collection. Previously sent records are unaffected. Queue cap 100, expiry 24 hours, batches 20, unique event deduplication. Server validates events, stages and timestamps; daily caps 200/browser and 20,000 total. Blocked requests, limits, disabled collection and abuse can affect counters; these are not a payment ledger.

Build: `node gloss-build.mjs && node telegram-build.mjs`.
Check: `node scripts/verify-project.mjs` and `node scripts/verify-oki-analytics.mjs` (Node with node:sqlite, tested on Node 24). Analytics test uses in-memory SQLite, no live events or Telegram messages.

Real-money mascot purchases remain disabled. Editorial news/scam automation is independent.
