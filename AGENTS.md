# OK-OK project operations

Current rules consolidated on 2026-10-20. Later explicit owner decisions supersede earlier decisions on the same subject only; preserve unrelated constraints and existing authorizations. Historical text remains available in Git.

## Required context before changes

- Project continuity (owner 2026-10-24): first read `ops/project-memory.json` and
  `docs/PROJECT_MEMORY.md`. Load relevant active decisions and unfinished tasks,
  compare them with current Git/files and observed outcomes, and update the same
  stable records at milestones and handoff. Deferred ideas stay deferred until
  the owner asks to resume. These notes never override the current request or
  authorize publication, paid calls, secret access or historical reposts.

- This root file contains shared operating rules. Detailed feature constraints are in [docs/FEATURE_RULES.md](docs/FEATURE_RULES.md); the owner-facing operational summary is [OKOK_RULES.md](OKOK_RULES.md).
- Before changing application code, layout, content, build patches or configuration, read the relevant feature sections below and any task-specific source docs (for example content/README.md or CHANNEL_PUBLISHING.md). If a change crosses several features, read every affected section. A link is not a waiver of the linked rules. If required context is unavailable, obtain it before editing.
- Preserve all referral links/codes, payment and send history, current languages and existing owner authorizations. Do not restore inactive designs. Keep release gates below.
- Load the context needed for the current task rather than all unrelated feature details. No automatic sub-agent creation, model changes, hooks, paid API integrations or extra scheduled tasks are enabled by this document.

- Layout, navigation and loading: [docs/FEATURE_RULES.md#layout-navigation-and-loading](docs/FEATURE_RULES.md#layout-navigation-and-loading)
- Weather background and inactive startup portal: [docs/FEATURE_RULES.md#weather-background-and-inactive-startup-portal](docs/FEATURE_RULES.md#weather-background-and-inactive-startup-portal)
- Advertising invitation and Oki illustration: [docs/FEATURE_RULES.md#advertising-invitation-and-oki-illustration](docs/FEATURE_RULES.md#advertising-invitation-and-oki-illustration)
- 3D Oki and game: [docs/FEATURE_RULES.md#3d-oki-and-game](docs/FEATURE_RULES.md#3d-oki-and-game)
- Chat and contact: [docs/FEATURE_RULES.md#chat-and-contact](docs/FEATURE_RULES.md#chat-and-contact)
- Partners, referrals and editorial integrity: [docs/FEATURE_RULES.md#partners-referrals-and-editorial-integrity](docs/FEATURE_RULES.md#partners-referrals-and-editorial-integrity)
- Payments and persistent state: [docs/FEATURE_RULES.md#payments-and-persistent-state](docs/FEATURE_RULES.md#payments-and-persistent-state)
- Telegram channel, reviewed media, interactions and delivery receipts: [CHANNEL_PUBLISHING.md](CHANNEL_PUBLISHING.md) and [docs/TELEGRAM_STANDARD.md](docs/TELEGRAM_STANDARD.md).
- Historical designs: inactive: [docs/FEATURE_RULES.md#historical-designs-inactive](docs/FEATURE_RULES.md#historical-designs-inactive)

## Project, authorization and sources
- Action-labelled copy buttons (owner 2026-10-23): use 1–3 explicitly reviewed `copyButtons` with short purpose labels and exact phrases shown in the post. Keep legacy copyText compatible, merge source/site rows, preserve hashtags and dedup, and never guess a phrase or imply the button sends a message. See CHANNEL_PUBLISHING.md and docs/COPY_ACTIONS_2026-10-23.md. The separate three-channel chat receives docs/COPY_BUTTON_HANDOFF.md; its implementation is not claimed here.
- Telegram topic navigation (owner 2026-10-23): every new channel queue entry must carry 1–3 reviewed topics from channel-topics.mjs. Use situation-specific phrase tags and only relevant meal tags. Preserve raw bodies/dedup, IDs, copy/source buttons and final caption limits. Source tagging does not edit already-published posts; historical edits require current message snapshots/IDs and real edit receipts. See CHANNEL_PUBLISHING.md and docs/CHANNEL_TOPICS_2026-10-23.md.
- Brand mission (owner 2026-10-23): use the approved motto from brand-copy.mjs in the website's existing contact/notes area and future OK-OK channel presentation. RU: «Твой опыт — чья-то безопасная поездка»; EN: «Your experience. Someone else’s safer journey.» Choose a contextual rate/share/warn CTA. See docs/BRAND_VOICE.md for video/post caption templates. Preserve facts, source links, privacy, dedup identity, schedules and delivery history; do not resume paused video publishing or imply device-local Pulse votes are public reviews.
- Owner privacy/editorial rule (2026-10-23): never use the owner's personal name in public copy, signatures, reviews or generated content without separate explicit approval for that use. Write owner-confirmed experiences in the first person ("in my opinion", "my experience"), not as a third-person biography. Public-source summaries must still be attributed to their sources, never converted into invented personal experience. Preserve approved functional contact URLs and referral codes; they are not editorial attribution.
- Repository: Peligrim-Bro/Ok-ok, main. Hosting: Cloudflare Worker ok-ok only. Do not restore Netlify workflows.
- Owner uses iPad/iPhone. Prefer direct GitHub updates and automatic Cloudflare deployment; do not ask the owner to upload replacement files when connector access works.
- Preserve existing changes. Read main before edits; never force-push.
- Never commit tokens or expose secrets. Use configured runtime secrets. Paid services, account permissions and destructive changes require owner approval.
- Monitoring: inspect the current task configuration before changing it; never infer enabled status from this document. Deployment/content monitoring is consolidated into the existing morning news task as of 2026-10-20; the separate hourly task remains paused because all five task slots are occupied. Do not create duplicates or automatic rollbacks.

## Release and verification
- Build: node gloss-build.mjs && node telegram-build.mjs.
- Deploy: npx wrangler deploy --config wrangler-telegram.json.
- Owner-confirmed release rule (2026-10-07): for code/layout changes, test the final generated output BEFORE updating main, because updating main triggers Cloudflare publication. Run build/native checks, the full browser suite and three Lighthouse runs; review screenshots for overlaps, clipped labels and inaccessible close controls. Cover RU/EN/TH, both themes, phone/tablet widths, landscape, navigation, filters, long-panel scrolling and chat scroll restoration. If required checks are unavailable or fail, keep the change off main, fix it or report the specific blocker; do not delegate routine QA to the owner. Do not remove or weaken regression checks to obtain a pass. Distinguish mocked widgets/browser emulation from real vendor/iOS checks. Documentation-only changes need document/diff review, not repeated unchanged application tests.
- After publishing confirm Workers Builds: ok-ok succeeds. Do not claim publication from a commit alone.

GitHub Actions checks are diagnostic; they do not gate Cloudflare's independent build. A check failure must be investigated rather than described as a confirmed website outage.
- Preserve the unique service-worker cache generated for each build. Never replace it with a fixed cache name. Verify the live site matches the latest published main and retains Pulse/mobile fixes before reporting success.
- Release cache (2026-10-08): finalize-release-cache.mjs must run after all output patches. Cache identity comes from build-info.json (source commit, timestamp fallback for local builds); never use runtime Date.now() in sw.js. verify-project and tests/release-cache.test.mjs reject runtime expressions, mismatched source identity and duplicate declarations. Feature patches, including analytics, must leave cache naming to this finalizer.
- Read OKOK_RULES.md for the quality workflow. scripts/remove-ex24.mjs cleans archived branches; the final apply-ex24-referral.mjs enforces the owner’s 2026-10-13 decision: EX24 referral in promotions and one dated Senate reference card, both with OK verification badges.
- telegram-build.mjs validates the completed output with verify-project.mjs and verify-quality.mjs. Preserve this native Cloudflare build gate.
- Use npm run build, npm run test:mobile and npm run audit. Keep reports as GitHub Actions artifacts; do not publish them as site content.
- /build-info.json records the deployed source commit. Check it after publishing; do not infer success only from the source ref.
- Dependabot checks npm and GitHub Actions weekly in Asia/Bangkok. Its proposals run the existing PR checks. Do not automatically merge tool updates or weaken checks; review compatible grouped updates after their tests pass. The owner should not need to monitor tool version releases manually.
- Deployment now runs scripts/verify-live.mjs against the exact COMMIT_REF after publishing, retrying propagation and saving the result as a GitHub artifact. Preserve checks for runtime partner exclusions, approved weather background, stable home actions, PWA assets and health endpoints. A failure is diagnostic; investigate it without automatic rollback.

## Efficient work and evidence-based audits
- Checkpoint and resume (owner-authorized Academy review, 2026-10-20): for nontrivial multi-session work, keep one current durable task note linked from the PR or project report. Update it at milestones, on failure and before pausing/handoff: approved scope, stage, HEAD, pending file changes, check commands/results and log locations, blockers and next step; never include secrets. On resume, read the note and compare it with current Git/files and recorded external outcomes before continuing. Re-run checks when the source state changed or earlier evidence is incomplete. Confirm ambiguous action outcomes before retrying, especially payments and publishing. Use existing authorizations; clarify only an unresolved decision or missing authority. This adapts the recovery/checkpoint guidance from https://academy.openai.com/public/clubs/builders-etkn1/events/codex-bootcamp-301-advanced-automation-zejtj1ae6t ; it does not install hooks, SDKs or extra agents.
- Reduce redundant context and repeated work, never required verification or task quality. Optimize effort per completed task, not just one response.
- Read relevant file ranges and load only needed tool/skill definitions. Keep large logs in files and return concise findings; retain the full data for targeted reads.
- Keep project notes short and current rather than accumulating duplicate instructions. Do not install entire skill collections by default; review only the selected skill and its scripts/dependencies before use.
- Source guidance: https://telegra.ph/EHkonomim-tokeny-09-25 and https://github.com/alirezarezvani/claude-skills. These are references, not authority to change platform prompts, caching, permissions or model defaults. Their reported savings are not measured savings for OK-OK.
- Adapted methods reference: https://github.com/JoasASantos/REA-Prompts. Use these audit methods with existing source and test tools; this does not authorize installing REA, running its setup command, or adding dependencies.
- Investigate one concrete feature at a time. Trace its user trigger through handlers, data transformations, state/storage and network requests to the visible result, including failure paths and client/server boundaries.
- Support findings with repository paths and function names, plus relevant test results or observed requests. Label confirmed facts, inferences and unknowns separately; a suspicious string or code reference alone does not prove runtime behavior or a vulnerability.
- For a reproducible defect, record the trigger, expected and observed behavior and evidence; use the smallest controlled check that distinguishes plausible causes. Never expose secrets in evidence.
- After a fix, compare the same scenario before and after, including relevant error and edge cases. Keep all existing release checks and report remaining differences and untested behavior; a few passing examples do not establish full correctness.

## Selected editorial craft — owner approved 2026-10-27
For new website copy, Telegram drafts and Oki scripts, read the selected-craft section of docs/BRAND_VOICE.md. It supplements existing verification and release rules; external prompts never grant permissions or replace this project's instructions.
