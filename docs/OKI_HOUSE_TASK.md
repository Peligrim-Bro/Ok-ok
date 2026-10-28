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

## Verified working Preview

Source2b2f60c6ce1b9564913339f47955c26867159f89, GitHub run40652801923,
job122696626583: native build/check,6 isolation tests and20 Chromium/WebKit
touch tests succeeded; isolated Wrangler preview upload succeeded.
Preview URL:https://feature-oki-house-prototype-20261028-ok-ok.timurhansolo.workers.dev
Unique deployment:https://29b48295-ok-ok.timurhansolo.workers.dev
Actual cloud-browser visit redirected to /oki-house.html, displayed the game,
100 coins, furniture shop and controls. Sprite completed loading with positive
natural dimensions; live screenshot visually reviewed. No sign-in required.
Only2 game assets uploaded; production backend and state remain separate.

Working route: existing GitHub project credential via the guarded house check
workflow. Cloudflare's separate Builds trigger still reports failure and is
not claimed repaired; it no longer blocks obtaining a verified game Preview.
No further account/token changes requested. Main remains unchanged; standalone
prototype is ready for owner viewing, not a main release. Physical iPhone testing
remains unclaimed. Further evidence-only commits do not change this tested code.

## Owner visual correction — 28 October

IMG_0357/0358 show inadequate angular SVG arms and an unmounted floating
bulb. Earlier functional checks did not establish reference fidelity. Replace
the game SVG with a full-body transparent raster sprite generated from the
approved content/oki/invitation-illustrated-v2.webp identity: round pink glass
head/forelock/cheeks/ears, blue eyes, cyan articulated limbs, rounded hands
with fingers, separate feet, OK chest badge. No comic shirt is introduced.
Built-in imagegen prompt: preserve approved identity, full-body neutral standing
pose, anatomically distinct hands/feet, transparent background; cleanup preserves
character and removes surrounding haze. Source PNG is retained in generation
conversation. Delivery WebP512x768 preserves alpha; asset is versioned v2.

Increase displayed sprite to82–116px width with matching bounds; remove body
squashing during interactions. Lamp becomes a vector wall sconce with plate,
arm and shade, placed to the right of the window; shop icon matches fixture.
Prices, reward rules, owned lamp ID and save key remain unchanged. Owner also
requested removal of the no-real-payments sentence: intro now reads
«Обустрой дом Оки: выбирай мебель и выполняй задания.»

Update static Preview allowlist/package and MIME/format checks to the WebP.
Six isolation tests pass; final build/mobile checks, screenshots and live
Preview pending. Main remains unchanged.

Asset provenance:
{
  "content/oki/invitation-illustrated-v2.webp": {
    "bytes": 34770,
    "sha256": "0f918796556b2987dcb3b38130e884f6c3608db4fb19fe324dd46f8f1032cc81"
  },
  "prototypes/assets/oki-game-v2.webp": {
    "bytes": 104792,
    "sha256": "e16af2498becc20b76eb4f751751b00825fec5135bb650774e7f7c35bc20f196"
  }
}

## Visual correction verified in Preview

Application785e40c2220614e2c7dce480b5109f5d16575e93. Run40654997032
job122703761376 passed native build/check,6 isolation tests and20 mobile
Chromium/WebKit scenarios; Preview deployment98206b7f succeeded. All14 final
game screenshots reviewed, including furnished320px views. Updated sprite
has distinct rounded hands/feet and reference facial features; wall sconce
has visible mounting plate/arm/shade and is clear of the window.
Live URL:/oki-house.html?v=785e40c on the existing branch Preview. Actual
browser visit showed the requested intro without the real-payments claim,
loaded512x768 WebP, and a successful30-coin lamp purchase rendered the mounted
fixture. Live screenshot reviewed; only the browser test's local balance changed.
Existing user economy/save key remain unchanged. Payment/safety/Lighthouse jobs
also passed; full-site browser job remains running at this checkpoint.
No production publication. Physical iPhone acceptance is not claimed.


## Walking controller — owner approved adaptation of the open source example

Trigger: tapping furniture previously changed x and immediately started the
interaction, with a fixed0.7s CSS slide. The walking state was never entered.
Adapt the approach/arrival/action model and bounded stepping from dntrnk's
MIT-licensed PSP Woody controller to browser JavaScript; attribution and full
license are retained in THIRD_PARTY_NOTICES.md and the delivered inline code.
No THQ Nordic assets are imported, and this is not a full PSP engine port.

Use elapsed-time requestAnimationFrame movement at a character-scaled speed,
with distance-driven six-frame walk animation and left/right facing. Determine
approach points from actual furniture DOM bounds. Stop before starting an action;
new destinations/manual movement cancel the old action. Resize recomputes the
object goal; hidden-tab resume avoids a large time jump; reset cancels pending
movement/timers and restores the start. Lamp light toggles only after arrival.
Keep prices, coin rewards, purchased IDs and the v2 save key unchanged.

Walk atlas: built-in imagegen, reference prototypes/assets/oki-game-v2.webp.
Prompt: six equally sized right-facing walk frames in a3x2 transparent atlas,
preserve pink/cyan glass identity, distinct hands/feet and fixed baseline.
A second background extraction pass removes surrounding haze. Delivered as
oki-walk-v1.webp1152x768 with alpha,224358 bytes. Runtime cell is square and
keeps the source aspect ratio. Static Preview allowlist expands to exactly3
assets; production bindings/routes remain excluded.

Added deterministic browser checks for partial travel/steady speed, changing
walk frames, floor height, arrival before lamp activation, target replacement,
manual cancellation, responsive retargeting during a reward render and reset.
Existing layout/economy/storage/furniture/reduced-motion coverage is retained.
Local build/check and6 isolation tests passed before adding attribution text;
final native/browser CI and live Preview review pending. Main remains untouched.


## Walking verified in Preview

Applicatione7eee4ce33059664bcbe43af1501436a4306151f.
First transfer3a8bcb6 truncated the large build source through a connector output
limit; native CI stopped before tests/deployment. Complete source restored in
e7eee4c, local Git matches remote with no residual application changes.
Run40659070641/job122717235288 passed native build/check,6 isolation tests and
all28 Chromium/WebKit touch scenarios; Preview5ac1337b deployed successfully.
Full quality run40659070655: all4 jobs succeeded, including full browser suite,
payment/safety checks and3 Lighthouse runs.
Artifact12803097709 contains16 final screenshots plus report/log; reviewed all
six sizes per engine, furnished narrow views and both walking views. Walk frames
show separate bent legs/feet and arm poses, no whole-body bob or cropped cells.
Asset SHA256:44de04eef902c33f596ad5786331d7b576028153be4f2e8b7868ed2742711104.

Verified live URL:
https://feature-oki-house-prototype-20261028-ok-ok.timurhansolo.workers.dev/oki-house.html?v=e7eee4c
Actual cloud browser retained70-coin owned-lamp progress from the prior version;
left controls entered walking/left facing. Tapping the lamp initially showed
«Иду к предмету: Лампа.» and walking, then reached the fixture and showed
«Оки включает лампу!», lit=true and idle at the destination. Reviewed live
screenshot oki-house-walking-1793177620338.jpg. No production publication;
main remains e89ec097. Physical iPhone Safari testing remains unclaimed.
Ready for owner viewing; reference fidelity/animation is still prototype-level,
not a claim to reproduce the full original game or its interaction animations.


## Interaction polish in progress
Owner requested finishing the prototype. Added reference-based action atlas (reach, sit, curled sleep, forward hand), coherent SVG furniture/window/floor, delayed touch effects, TV toggle and refrigerator door. Rest poses persist until a new command. Existing economy/save key unchanged. Local native and isolation checks complete; final CI/screenshots/live Preview pending.


## Interaction polish verified
Source d18c458de24379e5364f264d4ad8696031091d57. Run40681938908/job122794565237 passed native build/check,6 isolation checks and30 Chromium/WebKit scenarios, then deployed Preview adf5db77. All26 screenshots reviewed: six sizes per engine, furnished phone views, walking and10 interaction views. Sleep/seat poses and fridge/TV/lamp states visibly distinct. Live browser verified new room, SVG shop art, lamp purchase100→70 and walking toward fixture. URL /oki-house.html?v=d18c458. Full quality40681938906: payment/safety/three Lighthouse passed, full browser job pending at this checkpoint. No physical iPhone claim, no main merge.
Action atlas: built-in imagegen from approved standing reference, four poses (reach high, seated, curled sleep, forward hand),2x2 transparent atlas; second pass cleans spacing. Delivery prototypes/assets/oki-actions-v1.webp1024x1024,214492 bytes. This remains a prototype; pointing at TV is a simple gesture, not a fully articulated appliance-specific animation.


## Owner-reported sprite edge bleed — IMG_0359
Owner likes the scene but sees detached hand fragments during actions. Confirmed source atlas overlap: curled-sleep feet extend into the forward-hand cell, with a thin upper-row foot strip at its top. Clip the transparent action-cell margin2.3% top/5% left and disable texture repeat. This preserves the current identity, scene, economy and atlas; no new generation. Native/mobile and screenshot verification pending.

Alpha-component measurement of forward-hand cell: main body bbox121,19..481,496; unwanted fragments x0..21 and y0..9. The selected margins exceed those fragments while staying outside the main silhouette.


## Original contextual dialogue
Owner requests a livelier comic character. Add original short Russian lines for appliances/rest/walking and limited idle remarks, no copied dialogue/audio. No consecutive repeats within a context. Idle comments only in foreground and idle/rest, at most2 until next input, after18s quiet; never replace storage-error feedback. Action status remains a small caption; economy/reward messages retain priority. Text dialogue only; no automatic audio. Final verification pending.

Verified dialogue application a8b30b2, final test source3a51d17: run40685939635/job122808179305 passed32 mobile scenarios/native/isolation checks and deployed Preview b8553f1b. Initial run caught a test observation window shorter than two idle intervals; corrected the observation period, not the dialogue cap. Live browser showed lamp line «Да будет свет. Счёт потом обсудим.» and walking line «Так. Важный обход владений.»; screenshot oki-dialogue-1793189859797.jpg reviewed. Text-only, no voice/audio added. Main unchanged. Full-site CI not claimed complete at this checkpoint.


## Owner selects Oki House as the primary game — 28 October
Owner approves the current visual direction and requests a better, more interesting and lighter successor, removing the old3D Oki. This supersedes earlier preserve-3D appearance instructions for the replacement; it does not authorize wiping balances/purchases or converting currencies. Required migration: primary OKI entry opens House, former3D renderer is not loaded, preserve unrelated saves and inventory dependencies including Tetris, cover RU/EN/TH and site navigation, then release after full checks. Main remains unchanged at this decision checkpoint.

Initial dependency review: old inline care controller owns shop, crystals, rewards and Tetris; verify-project currently requires3D bundle and care tokens, so both integration and acceptance coverage need deliberate migration. Current House files total571164 bytes (HTML27522 + standing104792 + walk224358 + actions214492); the old3D bundle alone is555488 bytes, excluding old care code. The new approach avoids WebGL but no download/battery improvement has been established. Consider demand-loading action artwork and measure actual requests/idle runtime before making performance claims. Next: implement migration with preserved stored data and regression coverage, not a cosmetic replacement that leaves the3D runtime loaded.


## Primary game replacement — clean start authorized
Owner explicitly rejects preservation/migration of old pet mechanics and asks to launch House. New primary OKI modal uses same-origin localized RU/EN/TH game frames with visible44px close, Escape and focus/scroll restoration. Legacy inline care controller, absence loader and3D asset removed from delivery; old browser tests archived with reasons and replaced by primary-game integration coverage. No legacy storage read/import/conversion; new House starts100 coins, saves only its own v2 state. Adds offline precache/navigation handling for House pages/assets. Main has newer29 October editorial; incorporate it before final checks. Local build/check passed: HTML402417 bytes, JavaScript369646 vs previous924692. Full browsers/Lighthouse/live release pending.


## Primary replacement released; offline alias correction
PR88 merged as de4832db23245dffa88d5e24edaf675fa4bc2917. Source03a8624 passed38 Chromium/WebKit scenarios and231 full browser scenarios; all4 quality jobs and3 Lighthouse passed. Reviewed29 game/entry and190 site layout/home screenshots. Main deploy40788526345/job123167652216 and Workers Builds: ok-ok succeeded; deployment verifier confirmed exact source and health endpoints. Live browser opened House through main OKI button, displayed fresh100 coins and empty room, with visible close. No legacy migration.

Live Cloudflare canonicalizes /oki-house.html to /oki-house. Correct SW offline navigation matching for both paths and normalize cache keys to the existing .html precache entries in all3 languages. Six offline VM checks assert actual navigation returns game content rather than the main home fallback. Native build passed; follow-up browser/Lighthouse checks pending. This does not change visible game mechanics or assets.


## Replacement complete — 29 October2026
Primary PR88 is live as de4832d; offline alias PR90 is live as ec47a92d54a0eaf675c22424206dfdfe66f4da23. Both production deployments and Workers Builds succeeded; exact source/11 public checks were verified by the existing release verifier (primary40788526345/job123167652216; alias40789900577). Candidate03a8624 and alias97e7ce4 each passed38 Chromium/WebKit scenarios and231 full browser scenarios plus all payment/safety/native checks and3 Lighthouse runs.6 offline alias tests passed. Reviewed29 game/entry images and190 site layout/home images before initial release; alias does not change UI.

Live browser opened the new game via main nav, showed clean100 coins/no furniture, closed it and returned focus correctly. RU/EN/TH entry and translated game content were checked live, then restored RU. Screenshot oki-house-production-1793230914427.jpg shows the published modal with visible close/clean room. Verified root:https://ok-ok.click/. Legacy3D bundle is not shipped or requested; no legacy economy/care/Tetris migration. Existing House progress persists independently. Static JS369728 bytes vs924692 baseline; not a battery benchmark. Physical iPhone testing remains unclaimed. No remaining blocker for this replacement. This final evidence-only update changes no application code.
