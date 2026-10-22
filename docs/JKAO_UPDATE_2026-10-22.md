# J-Kao review and Pulse — current checkpoint

Authorized by the owner on 22 Oct 2026, with a screenshot of the listing card.
Base main: b22e7646862a388f94a10ccb5f48c5bdd3585e50.

The owner's «Как здесь сейчас?» means the Pulse voting block. Root cause:
Pulse guessed place cards from stars, action links or review/verification words.
J-Kao had none. Recognize native .card[data-open] entries after the existing
scam/ad exclusions, and stop vote propagation so voting does not open the sheet.
Preserve the existing local store/keys. Votes are device-local, not crowdsourced
server verification. Existing detail/gallery/map/save/share behavior remains.

Owner update: closed on Sundays; decent tom yum for 120 baht, plenty of seafood
but a little tough. Recorded as an owner impression/update, not a new claim of
official verification. First visit stays 16 Oct; update is 22 Oct. Exact opening
hours on other days remain unconfirmed. Price range now 60–120 baht. All three
languages updated. No rating, phone, live opening status or family ownership
invented. Original photos, address and referrals preserved.

Six J-Kao browser cases check all three Pulse vote buttons, local persistence,
no accidental sheet opening, updated review/hours and normal detail behavior.
Physical iOS/vendor navigation is not claimed tested.

CI 39750876424: build, payment checks and three Lighthouse runs passed; 130 browser
cases passed. Six J-Kao cases stopped on an ambiguous test locator matching the
existing vote buttons as well as Details. An earlier interpretation added
unsolicited Map/Details buttons to the listing. These were removed before
release; they are not part of the final Pulse fix. Earlier application checks
do not validate the final source; repeat all required checks.

Pending: final build/native, full browser suite, three Lighthouse runs and screenshot review before
main; then Workers Builds success, exact live revision and public release checks.
The PR will hold final release receipts. Keep production unchanged on failure.
