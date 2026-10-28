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
