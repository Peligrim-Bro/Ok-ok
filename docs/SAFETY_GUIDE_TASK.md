# Situation-based safety guide — 27 October 2026

Owner approved replacing the old scam-card presentation, starting with bike
rental deposits. Base e204bc7. First release: RU/EN/TH, both themes, two modes,
local-device checklist/reset, selectable English phrases/copy fallback, fictional
quiz, share URL and author-contact entry. No accusation database or public reports.
Existing sourced warnings remain under a secondary disclosure. Other topics are
explicitly next stage, not empty working buttons. Direct URL:
https://ok-ok.click/#safety/bike-deposit

Implementation: isolated same-origin document, content-hashed filename, bounded
height messages checked by origin + frame source. Parent language/theme and tab
navigation retained. Precache all three language URLs; offline iframe navigation
must use its own cached page, not index.html. No third-party dependency.
GA4 safety_action tracks mode/copy/share/report intent under existing test/privacy
exclusions; report click is not submission or a lead, share is not a recipient receipt.

Sources opened 27 October 2026:
- https://www.smartraveller.gov.au/destinations/asia/thailand — passport deposit warning
- https://www.touristpolice.go.th/en — Tourist Police 1155
Checklist and English phrases are editorial suggestions, not claims about Thai
legal rights, a refund guarantee or confirmed incidents. No owner name/documents.

Local build/native checks pass; unchanged size budgets: index gzip 124922,
JS 924544. New browser coverage: languages, themes, phone/tablet/landscape,
checklist persistence/reset, copied-text fallback, quiz, report dialog, direct
hash navigation and offline reload. Await full CI, screenshot review and three
Lighthouse runs before main. Then verify exact release SHA on Cloudflare.

Owner steering: first-screen identity uses OK-OK wordmark and a short localized
places/scam-awareness descriptor. One primary guide entry before map and other
home actions replaces the lower teaser, with no duplicate call or extra header
banner. Existing ad pricing, invoices and partner links unchanged. No paid
safety badge, cashback promise or new free posting workflow is introduced.

## Production recovery and first-screen redesign — 27 October

After PR 80 the owner reported a blank safety view in iOS PWA and rejected the
vertical stack of full-width controls. Live cloud-browser inspection also saw
an empty embedded document (chrome-error://chromewebdata/) for the external
HTML URL. Exact platform failure cause is not established; local static-server
checks did not reproduce it. Existing production verification covered the shell,
not this interactive path.

Replacement bundles the reviewed document as srcdoc with the shell, so its UI
requires no separate HTML request. The secondary sourced warning dataset moves
to content-hashed JSON, loaded on disclosure and precached. New tests abort all
external safety HTML requests and still exercise the full guide and offline flow.
Parent origin/frame-source message checks remain. Check the published UI path
in a live browser after release; do not infer it from a source commit.

Home: two labeled panels with native horizontal scroll/snap, no auto-rotation.
Safety has before-rental, withheld-deposit and fictional quiz entries. Places
has daily choice, map and tours using their existing handlers. Filter disclosure
is compact when closed; all five bottom tabs and paid-ad behavior retained.

Budget review: moving guide content into the shell removes a failure-prone
navigation and shifts warnings out. Measured HTML 459016 (under unchanged
460000), JS 924392 (under unchanged 925000), total site 31858100 (under unchanged
33000000). Shell gzip rises from 124818 to about 127976 bytes (~2.5%); its budget
is narrowly updated to 128500 for this explicit reliability/layout scope, with
Lighthouse retained. No regression tests, privacy checks or other budgets removed.

Current stage: local build/native checks pass. Await new focused browser tests,
full browser suite, three Lighthouse runs, screenshot review and live verification.

CI runtime follow-up: the runner spent ~7 minutes installing browsers/system
dependencies before beginning the full suite. Ubuntu runner already supplies
Chrome dependencies (Lighthouse passed). Install the Playwright headless shell
only, run the unchanged full browser suite with two isolated workers, and allow
20 minutes for full jobs. No test, assertion or scenario is omitted. Focused
14 tests and payment coverage retain their normal single-worker config. Verify
missing-library/parallel-state failures rather than masking them.

## Compact checklist correction — owner screenshot IMG_3012, 27 October

PR81/82 are released (3d3ffcb). The owner rejects oversized before-rental
checklist, duplicate mode heading and black iframe canvas. Prior screenshots
primarily showed the after-rental state and did not establish visual acceptance
of the before-rental state. Compact typography and segmented mode control,
shorter equivalent RU checks, reset/count in the panel header, explicit theme
canvas and Safari text-size-adjust:100% (zoom remains enabled). Full document
height now includes the centre link. No checklist storage IDs or functions reset.
New regression assertions cover mode height, before-panel density, reset hit
target above dock and nontransparent canvas; before screenshots in every existing
language/theme/width case. Await final full CI and image review before main.
