# Threads buffer — 6 November 2026

## Scope and checks
Queue-only content extension; no Worker, secrets, schedules or automations changed.
Preserved all 14 existing entries byte-for-byte as parsed objects, including IDs, dates and text.
Added 16 free future slots, 12–19 November, 12:30 and 19:00 Asia/Bangkok.
6–19 November inclusive now has exactly two slots per calendar day (28 future posts at review).
Validated JSON, unique IDs, instants and texts; maximum 387 Unicode code points across the complete queue.
New editorial entries are hypothetical choices, project intentions and reading discussions, not invented visits, reviews, prices or news.
Book-related discussion slots: 9/11/13/15 November (4), 16/18/19 November (3 to date). New book discussions contain no unverified plot, quote or premiere link; verified-text excerpts remain blocked.

## Public question research
Original opened 6 November:
https://www.reddit.com/r/ThailandTourism/comments/1tmwz6i/can_anyone_advise_how_to_get_a_taxi_from_bkk/
The original question concerns unpredictable airport exit time and advance transfer booking. Adapted the question only for 12 November; no commenter prices, service endorsements or guarantees were adopted.
Second family/group transport original could not be fetched:
https://www.reddit.com/r/ThailandTourism/comments/1w71rqx/getting_around_pattaya/
No factual claims were taken from that inaccessible original.

## Campaign blockers — do not turn into text-only ads
scripts/apply-receipt-book.mjs generates receipt/rain/keys/window direct routes and verifies manuscript chapter counts/endings. Source existence is not proof of public accessibility.
Attempted public shelf and each URL on 6 November:
- https://ok-ok.click/travel-reads.html
- https://ok-ok.click/books/receipt.html — Квитанция на двоих
- https://ok-ok.click/books/rain.html — Дождь на записи
- https://ok-ok.click/books/keys.html — Два одинаковых ключа
- https://ok-ok.click/books/window.html — Окно без моря
Web retrieval was inaccessible; direct shelf HTTP returned 403 from this environment. Public title/full-text validation not completed.
Worker currently hard-codes media_type TEXT and auto_publish_text; queue has no image forwarding. Four image campaign announcements intentionally not added. Visual image approval and attached author Threads copy not verified because campaign is blocked before preparation. Worker changes require a separate owner instruction (current request explicitly prohibits them).
Current source travel-reads passengerStory is the pier version; bus/02:43/seat17 full public version unconfirmed. No new premiere for that version.
Existing queue content untouched, including historical shelf links and earlier bus teaser.

## Delivery and metrics
Latest accessible prior Threads deployment: run 41827864797, success; token health step passed on 4 November 2026.
https://github.com/Peligrim-Bro/Ok-ok/actions/runs/41827864797
This does not prove scheduled post delivery.
Worker receipts are written to Durable Object storage and Cloudflare logs; current Worker exposes no read-only receipts/insights endpoint.
No receipt files in current tree or matching Threads issue receipts were found. Live /threads-check retrieval failed from this environment. Current token state and actual delivery remain unknown, not failed.
No confirmed Threads ID/permalink or subscription/reply/click measurements available. Do not claim growth or adjust topics based on nonexistent data. Review again by 20 November; keep general content mix for now.

## Next verification
After merge, confirm Threads deployment and token check for exact merge commit.
For future run, read latest main, this note and project memory. Check receipt/metrics access if available, validate public book pages and images before queuing campaign.
