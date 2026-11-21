# Threads auto replies — 21 November 2026

Owner scope: enable replies to comments on the existing personal Threads profile,
with uncertain comments reviewed privately through @workforwriters1_bot.
Preserve OFFSCRIPT, the website, post queue, receipts and existing 15-minute publication cron. Reply scans only09:00,15:00,21:00 Bangkok (owner21Nov).
No paid model/service added. This first release uses a narrow complete-phrase
allowlist for RU/EN reactions and a contextual book-link FAQ, not generative AI.
Other comments require an owner-written answer and explicit publish button.

Implementation: dedicated ThreadsReplies Durable Object; authenticated Telegram
webhook; private owner-ID checks; versioned approval; immediate callback ack;
durable send claims, target revalidation and checks for manual owner replies.
An uncertain external send never retries automatically and reconciles against
visible owner replies. No fallback to top-level publication. Limit: 3 automatic
answers per scan and 20 reserved reply attempts per UTC day, 5 review notices per
scan. Scope: newest 50 own posts, paginated conversations up to 3 pages per tick
with persisted cursors; new visible replies from activation, at most 24h old.
Nested replies only continue conversations addressed to the owner.

Controls in the bot: /threads_on, /threads_off, /threads_status;
/reply ID text creates a preview; only its current publish button sends it.
Website source/layout and queue.json are unchanged.

Verified: existing GitHub diagnostic run 44876012798 confirmed read/manage/publish
scopes and actual reply reading. Bot preflight in goroskop-bez-nuda-bot PR26,
run44876948636 confirmed bot identity, empty webhook, unique human channel creator
and access to the existing okok-threads-auth Worker. No public test comments sent.
Local worker tests:19 passing;25 native tests and build passed. GitHub worker test passed. Lighthouse3 runs and safety-guide passed. Shared website payment checks fail on the existing ad block (11 assertions); website files are unchanged. Main must remain unchanged; deploy only this isolated Worker from the reviewed branch.

Stage: implementation verified; isolated Worker deployment pending. Shared website CI ran; screenshots reviewed, no website changes. Main merge blocked by inherited ad tests. Next: deploy exact worker branch source without updating main;
configure only the review token/owner/webhook secret using existing repository
secrets without printing values; register the previously empty webhook, verify
health and private notification. Preserve the owner's off state on reprovision.
Do not call implementation complete before live enabled status is observed.
