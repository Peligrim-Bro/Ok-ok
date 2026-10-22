# J-Kao card update

Authorized by the owner on 22 Oct 2026, with a screenshot of the listing card.
Base main: b22e7646862a388f94a10ccb5f48c5bdd3585e50.

Before: Map/Save and other actions existed only in the detail sheet, so the
listing card gave no visible action buttons. The schedule was entirely unknown.
After: the J-Kao listing has Map and Details buttons. Map opens the existing
owner-supplied location without also opening the sheet; Details opens the
existing sheet, preserving gallery, map, save, sharing and close behavior.

Owner update: closed on Sundays; decent tom yum for 120 baht, plenty of seafood
but a little tough. Recorded as an owner impression/update, not a new claim of
official verification. First visit stays 16 Oct; update is 22 Oct. Exact opening
hours on other days remain unconfirmed. Price range now 60–120 baht. All three
languages updated. No rating, phone, live opening status or family ownership
invented. Original photos, address and referrals preserved.

Build and 71 native tests passed locally. Budgets unchanged: HTML 454357 bytes,
gzip 124954, JS 924825. Six existing browser cases now cover visible actions,
updated review/hours, and (RU dark) a mocked map popup without accidental sheet
opening. Physical iOS/vendor navigation is not claimed tested.

CI 39750876424: build, payment checks and three Lighthouse runs passed; 130 browser
cases passed. Six J-Kao cases stopped on an ambiguous test locator matching the
existing vote buttons as well as Details. Corrected to the exact localized
Details role/name; application output unchanged. Repeat the browser check.

Pending: full browser suite and screenshot review before
main; then Workers Builds success, exact live revision and public release checks.
The PR will hold final release receipts. Keep production unchanged on failure.
