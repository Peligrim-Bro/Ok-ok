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
