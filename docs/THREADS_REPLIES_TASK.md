# Threads auto replies — 21 November 2026

Owner scope: enable replies to comments on the existing personal Threads profile,
with uncertain comments reviewed privately through @workforwriters1_bot.
Preserve OFFSCRIPT, the website, post queue, receipts and existing 15-minute cron.
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
Local worker tests: 15 passing at initial checkpoint; final checks below pending.

Stage: implementation, final tests and deployment pending. Next: worker tests,
full project checks and screenshot review before main; deploy exact worker source;
configure only the review token/owner/webhook secret using existing repository
secrets without printing values; register the previously empty webhook, verify
health and private notification. Preserve the owner's off state on reprovision.
Do not call implementation complete before live enabled status is observed.

## Live activation
21 Nov2026 14:11 Bangkok: live configured=true, enabled=true; startedAt2026-11-21T07:11:28.960Z. Schedule09:00/15:00/21:00 Asia/Bangkok. Isolated Worker source5f946a337d68a5ba643a24e2dc23273e4c8fe944 deployed by run44878678968, versiondf105ec9-5d1b-4a21-a39e-97de7582f531. Bot setup run44879036155 confirmed expected identity, authenticated activation/read access, registered webhook and actual private notification receipt. No public test reply sent; first real reply delivery awaits a new eligible comment.19 worker tests pass. Main unchanged; PR135 remains unmerged because inherited website ad tests fail. Do not redeploy main's older Threads Worker over this live branch. Do not rerun provisioning blindly or override owner /threads_off. Reply policy is a narrow allowlist, not a generative AI model.
