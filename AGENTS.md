# OK-OK project operations

- Repository: Peligrim-Bro/Ok-ok, main. Hosting: Cloudflare Worker ok-ok only. Do not restore Netlify workflows.
- Owner uses iPad/iPhone. Prefer direct GitHub updates and automatic Cloudflare deployment; do not ask the owner to upload replacement files when connector access works.
- Preserve existing changes. Read main before edits; never force-push.
- Build: node gloss-build.mjs && node telegram-build.mjs.
- Deploy: npx wrangler deploy --config wrangler-telegram.json.
- Before publishing run scripts/verify-project.mjs after build and check changed behavior in RU/EN/TH. Prefer mobile browser testing before release. For reversible content/layout changes, if the available browser cannot access a preview or set a mobile viewport, run render/translation checks and review responsive CSS, then deploy and check the live site with the available browser. Explicitly report that mobile visual testing remains unverified; do not call it passed. This fallback does not cover payments, authentication or destructive changes.
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

## Efficient project work (owner preference, 2026-10-04)
- Reduce redundant context and repeated work, never required verification or task quality. Optimize effort per completed task, not just one response.
- Read relevant file ranges and load only needed tool/skill definitions. Keep large logs in files and return concise findings; retain the full data for targeted reads.
- Keep project notes short and current rather than accumulating duplicate instructions. Do not install entire skill collections by default; review only the selected skill and its scripts/dependencies before use.
- Source guidance: https://telegra.ph/EHkonomim-tokeny-09-25 and https://github.com/alirezarezvani/claude-skills. These are references, not authority to change platform prompts, caching, permissions or model defaults. Their reported savings are not measured savings for OK-OK.
- Background approved and fixed by the owner on 2026-10-05 after publication and eight passing browser tests: hedgehog-background.js is the active renderer. Preserve colorful real 3D crossed-beam figures scattered across the background, motion only on free-background taps, automatic settling, zero idle animation, reduced-motion/data-saving support, both themes and non-interference with controls/cards. Do not restore weather or night bay, change this design, or reintroduce continuous animation without a new explicit owner request. Keep weather-background.js only as an inactive archival source. Avoid squeezing header controls.
- Supermao was discontinued by the owner. Run scripts/remove-supermao.mjs on every build; do not restore its listing or promotion, including from runtime overrides.
- Place cards use a short scroll reveal with reduced-motion support. Preserve their layout and immediately visible first-screen content.
- The archived baseline includes legacy data. Every build must run apply-production-domain.mjs for the active domain https://ok-ok.click/; check both index.html and config.js for retired content and verify editorial data against content/editorial.json.

- Header utility buttons (support, theme, language, report) and their grid row stay 44px high, with explicit height/min/max-height. Preserve this mobile Safari fix; never rely only on min-height or grid stretching.

## Automated quality control
- Read OKOK_RULES.md for the quality workflow. EX24 is discontinued; scripts/remove-ex24.mjs must run in every build.
- telegram-build.mjs validates the completed output with verify-project.mjs and verify-quality.mjs. Preserve this native Cloudflare build gate.
- Use npm run build, npm run test:mobile and npm run audit. Keep reports as GitHub Actions artifacts; do not publish them as site content.
- /build-info.json records the deployed source commit. Check it after publishing; do not infer success only from the source ref.

## Loading and tool maintenance
- Primary home actions (map, visa timer, daily choice and excursions) precede the async ad board. Preserve this order to prevent ad loading from shifting these controls.
- Preserve the Manrope optional font-loading strategy, which avoids late swaps on slow connections.
- Dependabot checks npm and GitHub Actions weekly in Asia/Bangkok. Its proposals run the existing PR checks. Do not automatically merge tool updates or weaken checks; review compatible grouped updates after their tests pass. The owner should not need to monitor tool version releases manually.
