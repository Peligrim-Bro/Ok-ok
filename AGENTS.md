# OK-OK project operations

- Repository: Peligrim-Bro/Ok-ok, main. Hosting: Cloudflare Worker ok-ok only. Do not restore Netlify workflows.
- Owner uses iPad/iPhone. Prefer direct GitHub updates and automatic Cloudflare deployment; do not ask the owner to upload replacement files when connector access works.
- Preserve existing changes. Read main before edits; never force-push.
- Build: node gloss-build.mjs && node telegram-build.mjs.
- Deploy: npx wrangler deploy --config wrangler-telegram.json.
- Before publishing run scripts/verify-project.mjs after build, plus mobile browser tests of changed behavior. Check RU/EN/TH.
- After publishing confirm Workers Builds: ok-ok succeeds. Do not claim publication from a commit alone.
- Keep header hourglass, remove duplicate full-width timer entry. Preserve visa dates, five-item bottom navigation, partners, payments and Telegram outbox.
- OKI: actual rotatable 3D, no pedestal, no excessive bloom. New users start as babies. Preserve daily care, diapers, age-specific needs, Tetris and earned crystals. Final stage stays locked; real-money mascot sales disabled until explicitly authorized.
- Reference PNG crops contain artifacts; do not replace live 3D with them blindly. Reference pack Canvas renderer is not a production 3D-model replacement.
- Never commit tokens or expose secrets. Use configured runtime secrets. Paid services, account permissions and destructive changes require owner approval.
- Daily ChatGPT deployment monitoring is already enabled. Do not create duplicate monitoring tasks. No automatic rollback.

GitHub Actions checks are diagnostic; they do not gate Cloudflare's independent build. A check failure must be investigated rather than described as a confirmed website outage.

- Bottom navigation order is fixed: home, game (OKI), list, scam, shop (smiley). Keep exactly five buttons. OKI bubble tail must track the actual OKI button center, including viewport-edge clamping.
- Preserve the unique service-worker cache generated for each build. Never replace it with a fixed cache name. Verify the live site matches the latest published main and retains Pulse/mobile fixes before reporting success.

- Agoda is discontinued by owner decision. Do not restore its card, links or partner registry entry. Every build must run remove-agoda.mjs; preserve all other partners and their referral codes.
