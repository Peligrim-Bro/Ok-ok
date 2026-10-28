# Oki House mobile verification — PR 88

Scope: continue the standalone game in the existing test branch. No main merge
or production publication in this task. Existing care/3D Oki, payments,
referrals and unrelated saved progress remain separate.

Starting head: 2ca3487ea41c09729c66a67a5eeccc0b35b2c505, main e89ec097.
Actions did run: 40642833276 (prototype) and 40642832996 (full quality) failed
at build. Locally reproduced `Oki House prototype invalid`: gloss-build checked
v1 after the page moved to v2. Fixed to the actual v2 save schema.

Mobile fixes: clamp the character's left coordinate against its actual width,
keep the sleeping pose inside the left wall, give furniture 44px touch targets,
apply top/bottom safe-area padding, and retain a visible warning when storage
writes fail instead of immediately replacing it with a success message.
Coin amounts, prices, reward rules and localStorage key remain unchanged.

Verification: native build passed after the schema fix, within existing budgets.
Local browser install failed with a truncated Chrome archive; no local browser
pass is claimed. Added touch tests for six portrait/landscape phone/tablet sizes,
sprite loading, bounds, all furniture, purchases, reload persistence, reward
limits, Bangkok date rollover, reset cancellation/isolation, invalid saves and
blocked storage feedback. Dedicated existing workflow now runs Chromium and
WebKit and retains screenshots/traces; full existing quality checks remain.

Pending: final native checks, branch CI, screenshots and three Lighthouse runs.
WebKit with mobile/touch emulation is not physical iPhone Safari testing.
No physical-device service is configured or claimed. Review CI outcomes before
calling this ready. Production unchanged.

## First branch CI

09f9e44: native build/check and Lighthouse passed. Prototype run40643539654
passed 9 Chromium scenarios; furniture test reproduced fridge intercepting taps
on the palm. Moved palm to a separate row and aligned its interaction position.
WebKit failed to launch because a Chromium-only --no-sandbox argument was
shared; scoped that argument to Chromium. Assertions were not weakened.
Expanded optional local Node sweep:91/92 passed; unchanged channel-style test
has a stale fixed count27 versus current45 posts. No Telegram content or test
was changed for this unrelated existing issue. Required native CI19/19 passed.
An early concurrent local build/check read partial cache output; final sequential
build followed by check passed. Use sequential builds/checks.

## Second branch CI

f3b29bf: prototype run40643974245 passed all20 touch scenarios in Chromium
and WebKit. All14 screenshots reviewed, including both furnished narrow-room
views: no clipped controls or furniture hit-target overlap. Added observable
movement endpoint assertions before screenshots so stationary characters cannot
pass the boundary check. Full final CI and three Lighthouse runs pending.

## Final tested application state

Tested source31eb1b1568fad8b17565fbf916b4a263d313fda8.
- Prototype run40644395548:20/20 Chromium+WebKit touch scenarios passed,
  including actual movement endpoint checks. All14 final screenshots reviewed;
  empty/furnished rooms and portrait/landscape phone/tablet views remain usable.
- Full quality run40644395671: all4 jobs succeeded. Full browser suite233/233
  passed in7.1min; native checks, payment checks, safety/centre regressions and
  all3 Lighthouse runs passed. Halloween smoke40644395438 also passed.
- Main remained e89ec09788dce19e418ff8d26e1929f90aca16ce. No merge/deploy here.

Unresolved: Workers Builds check122669779621 failed for the branch preview.
Its GitHub output provides a build ID and dashboard link, no error text or
annotations. No Cloudflare build-log connector is available. Do not invent the
reason or infer a production outage. Build IDf2314adf-fb49-4e69-809d-1d4f24442ed5.
Physical iPhone Safari/safe-area verification remains unavailable; WebKit touch
emulation is accurately labelled. Existing optional stale Telegram count test
remains recorded above, unrelated and unchanged.

Next: inspect authenticated Cloudflare preview build logs, fix a demonstrated
issue if any, then verify an actual preview. Keep draft/off main until the
remaining preview/device acceptance is resolved. Later evidence-only edits to
this note and project-memory do not change the tested application source.

## Confirmed preview failure and fix — owner screenshot 28 October

IMG_0352 shows build success followed by dashboard deploy command
`node scripts/portal-preview.mjs`, which fails MODULE_NOT_FOUND because the old
portal launcher exists only on experiment/portal-launch. This is a confirmed
missing entrypoint, not an Apple/Google authentication or application-build error.

Add that compatibility entrypoint on the existing game branch, guarded to
Workers CI and the exact Oki House branch/account. It packages only the built
oki-house.html and oki-game.svg, and invokes pinned Wrangler4.151.3 preview.
A separate static-only preview handler serves those files; root redirects to the
game. No production Worker imports, DO namespaces, cron, routes or backend
secrets are included in its configuration. APIs and non-game files return404,
mutations405. Production config/workflows remain unchanged. Existing configured
Preview credential is used only at runtime; no credential is read or committed.
Five offline isolation/guard/HTTP tests and native build/check pass. Actual
Cloudflare Preview outcome pending. Existing game233+20 tests remain unchanged.
No Cloudflare dashboard edit is required for the confirmed missing command.

## Preview credential failure — IMG_0353

Owner screenshot confirms the restored entrypoint runs and invokes Wrangler,
then Preview API returns10000 and /accounts returns9109 Invalid access token.
Launcher had preferred archived PORTAL_PREVIEW_API_TOKEN over the selected
Workers Builds CLOUDFLARE_API_TOKEN. Remove that override and its fallback;
only the Builds-selected credential is used, with a non-secret source marker.
Six offline tests pass, including stale portal token isolation. No credential
values, permissions or account settings changed. If the selected Builds token
also fails, actual Build settings need correction; do not guess its validity.
Actual Preview outcome pending. Main remains untouched.

## Owner renewed Builds credential — IMG_0356

Owner confirms completion; screenshot shows selected API token named
Workers Builds - 2026-10-28 14:47. This is selection evidence, not proof of
validity or successful Preview deployment. Retry the same guarded game branch
with no application/configuration change and verify the new Preview outcome.
No token value is requested, read or stored. Main remains untouched.

## Existing GitHub credential route

Cloudflare Builds retry1dacdc8 failed after owner selected a new token; its
detailed log is not available through GitHub. Do not assume the new token
fixed the separate Preview trigger. Use the already configured GitHub project
credentials in the existing Oki House check workflow, after all20 mobile tests.
The publish step requires pull_request + same repository + exact game branch;
forks and unrelated branches cannot receive credentials or publish. It invokes
only the guarded static Preview launcher, not production deploy. Existing
CLOUDFLARE_API_TOKEN/ACCOUNT_ID secrets remain masked and are never read by the
agent. Retain CLI output in the existing report artifact for diagnosis.
Actual Preview result pending.
