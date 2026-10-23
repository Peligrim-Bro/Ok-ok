# Public voice / name approval

Owner instruction, 23 Oct 2026: remove personal-name attribution from the site;
write confirmed personal experiences in the first person; never use the owner's
name in public copy without separate approval. Base 9c8ebedca7c2817606656f4a99c14ce37a6400bb.

Rewrote J-Kao's RU/EN/TH listing blurb and owner review in the first person.
Preserved the visit/update dates, prices, Sunday closure, original photos,
location, voting and save/map/share actions. Other-day opening hours remain
unconfirmed. Public-source summaries must remain attributed to their sources;
they must not be converted into fabricated first-person experience.

Recorded the rule in AGENTS.md and feature rules. The native build scans served
HTML/JS/JSON/text for unapproved name attribution, preserving only previously
approved functional referral code and contact URL. Six existing J-Kao browser
cases now require first-person text and absence of name attribution in listing
and sheet. No Telegram messages or historical queue/receipts changed.

Pending final build/native checks, full browser suite, three Lighthouse runs,
screenshot review, then native Cloudflare build and exact live release checks.
The PR records final release evidence. Keep changes off main on any failure.
