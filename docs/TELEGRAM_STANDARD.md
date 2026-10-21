# OK-OK Telegram editorial and verification standard

Owner's handoff, adapted 22 October 2026, Asia/Bangkok. Target: @PattayaOk_Ok,
@Aibotadam_bot, Cloudflare Worker ok-ok, isolated ChannelPublisher namespace.
The deployed numeric channel ID and enabled state must be checked with the
authenticated owner's `/channel`; never replace TG_CHAT_ID (payment recipient).

## Content and illustrations

- Russian, one concrete subject, honest headline, short paragraphs, useful action.
- Check volatile facts against an opened primary source with its actual date.
  Personal verification requires the owner's corresponding confirmed visit.
- Preserve all referral URLs and parameters. Do not invent prices, testimonials,
  visits, guarantees, sources or current weather. Keep essential conditions visible.
- Give each new post a different original photograph or topic-specific illustration.
  Cropping, recolouring, changing text/date or rotating a background is not uniqueness.
- Record original-source provenance and file SHA-256 in review notes; compare with
  history. Exact hashes alone do not detect edited copies; visually review the scene.
- Use readable Cyrillic and safe margins; 1080×1350 is a reference format, not
  permission to distort approved comics or increase the site's static size budget.
- Preserve Oki's approved reference. Label fictional/generated places appropriately.
  Do not substitute another mascot. No default GIFs or restoration of deleted posts.
- Brand typography may repeat; the original scene must differ. Before committing,
  inspect final images. A script, prompt or unmerged PR is not finished media.
- English-only applies to promo video captions, not Russian Telegram or comics.
- Check significant holiday dates/context before subtle themed treatment.

## Native interaction and safe delivery

- Prefer useful site/map/source buttons with the exact reviewed URL in the post.
- Copy one explicit, unambiguous, verified phrase; retain its visible translation.
  Several possible phrases require an editorial choice, not automatic guessing.
- Use spoilers only for verified optional answers; three choices need three answers.
  Keep critical costs, addresses, risks and source links outside hidden regions.
- Optional long explanations may expand; do not complicate a short post.
- `channel-presentation.mjs` uses native entities instead of parsing arbitrary HTML:
  plaintext characters and link parameters remain unchanged; UTF-16 offsets are tested.
- No callback_data without its live handler. No drawn fake controls. Rich-message
  slideshows, albums, polls and quizzes require their own separately tested paths.
- Text and photo payloads keep merged copy/link rows. Captions stay within 1024
  UTF-16 units; long content is rejected, never silently truncated or split into spam.
- A valid delivery receipt includes the expected chat_id and positive message_id.
  Record latency and flag >15 minutes. On ambiguous send reserve needs_review,
  preserve history and reconcile before any retry. Never send a public test or backfill
  missed posts in a burst. Never restore owner-deleted material automatically.
- Existing post edits require known message IDs and checks of text, buttons, photo
  and pin; no historical edit is claimed without those observations.

## Automation and release

Preserve ordinary 09:00/14:00/19:30 and extra 20:30 Oki slots in Asia/Bangkok.
The Cloudflare queue checks every 15 minutes; replenishers are distinct existing
tasks at 08:00 and 10:00. Do not import the other network's eight-slot schedule,
tokens, permissions, cross-promotion frequency or $10 budget.

Review the actual future generator and queued assets, not just a manual launch
series. Keep at least seven calendar days ready under the current authorization;
flag <48 hours. No new paid service or model change without cost/authority review.
Read workflow triggers before pushing. Mandatory build, native checks, full browser
suite, three Lighthouse runs and post-release SHA verification remain in force.
Offline tests mock Telegram and asset bindings. Retain a task note with initial SHA,
tests, PR, release result, unknowns and next action; do not call an unknown delivered.

## Sources checked for this adaptation

- Owner's full handoff pasted in this chat on 22 October 2026.
- Source project's current `network/APPROVED_STANDARD.md`, `interactions.py`,
  `tarot_interaction.py`, read without importing its credentials or state.
- https://core.telegram.org/bots/api#copytextbutton
- https://core.telegram.org/bots/api#messageentity
- https://core.telegram.org/bots/api#sendphoto

Known initial gaps: ordinary future posts lack unique illustrations; complete
coverage of 28 October is missing; runtime channel ID, enablement and delivery
cannot be confirmed by repository checks or configured:true alone. These remain
open until actual media, merged coverage and runtime observations close them.
