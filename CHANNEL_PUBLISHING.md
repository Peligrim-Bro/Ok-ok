# Telegram channel publishing

## Owner standard transferred on 22 October 2026

Read `docs/TELEGRAM_STANDARD.md` before editing queue content, illustrations or
delivery. This adapts the owner's Telegram network handoff to this channel;
tokens, identities, schedules and budgets of the other channels are not copied.
Keep the existing stable post/content dedup records. Optional reviewed
`copyText`, `buttons` and `formatting` fields affect presentation only, not the
legacy content hash. `channel-presentation.mjs` validates them before sending.
The two copy phrases for 27 October and the three site buttons preserve their
original post IDs, text, dates and exact URLs. Already-sent slots do not resend.

Native MessageEntity offsets use UTF-16 and leave the original text intact;
HTML-looking input is literal, not executable Telegram markup. Supported optional
formatting: bold, spoiler, expandable_blockquote, each naming one unique exact
substring. No nesting or automatic hiding of sources/footers. Copy buttons copy
one explicit phrase of at most 256 UTF-16 units actually present once in the post.
URL buttons merge with copy buttons; callback buttons and external URL guessing
are not supported. The feature is tested offline, not claimed as client-verified
until an actual approved scheduled post and receipt can be observed.

New successful sends require a positive message_id and the exact channel chat_id
in Telegram's response. Receipts retain planned time, observed delivery time and
delay in minutes. Old receipts are retained as-is and explicitly labelled when
chat_id was not recorded. `/channel` is read-only and shows current rights,
numeric channel ID, enablement, recent receipts and review count only to the
authenticated owner. It does not post publicly or enable the queue.

Run `node scripts/audit-channel-queue.mjs` for an offline seven-day slot/media
report in `quality-reports/channel-readiness.json`. Exit 1 means known editorial
gaps; it does not mean the live website is down. The report never sends anything
or invents delivery. Exact-file hashes catch identical assets across history;
they cannot certify that crops/recolours use a different original scene.

Initial offline audit on 22 October 2026 (also checked at reference time
07:30 Bangkok): 24 future approved entries,
6 with available, different photo files, 18 ordinary entries without a separate
illustration. All four slots of 28 October are missing, so the complete seven-day
buffer is not ready. Delivery and runtime enablement remain unconfirmed without
owner-only runtime evidence; public-channel access was unavailable to the checker.
Do not turn this snapshot into a permanent fact; rerun the audit on current main.

## Rolling text queue (owner 19 October 2026)

Maintain seven future calendar days of reviewed text posts. The existing daily
editorial automation is enabled without a COUNT/UNTIL end date and runs in the
Bangkok morning; it replenishes the queue through a checked GitHub PR. It is
Telegram-only and does not resume paused TikTok/YouTube publishing. Text slots
are 09:00, 14:00 and 19:30 Asia/Bangkok every day. The additional daily Oki
comic has its separate 20:30 slot and never replaces these text posts.
Never backfill missed slots in a burst. Keep existing IDs and delivery history;
warn the owner if replenishment fails or the confirmed buffer drops below 48h.
New text content is reviewed by the editorial task under the owner's ongoing
authorization; public test messages and automatic ambiguous-send retries remain
prohibited. A schedule/commit is not evidence that Telegram delivered a post.

Owner-authorized channel: @PattayaOk_Ok. Bot identity must be @Aibotadam_bot.
Uses the existing TG_BOT_TOKEN and owner TG_CHAT_ID only inside Cloudflare.
Never change TG_CHAT_ID to the channel: that would redirect payment notifications.

The separate ChannelPublisher namespace stores enablement and delivery records;
ADS_STORE and payment notifications are not modified. A cron checks every 15
minutes. The queue starts disabled. Only the existing authenticated owner may
enable it using /channel_start, inspect permissions using /channel, or stop it
using /channel_stop in Adam's private chat. Stop cannot undo a send already begun.

channel-posts.mjs contains reviewed posts, explicit publishAt/expiresAt times and
approval flags. The Worker only delivers reviewed entries; ongoing editorial
replenishment is provided by the separate daily task above. The initial intro is
eligible from 19:00 Bangkok on 15 October until 19:00 on 16 October 2026; it will
not publish unless the owner enables the queue. Every queued post needs a stable
ID. Both ID and text hash are reserved durably before sending to prevent duplicates
across overlapping cron calls, restarts and deployments. Never erase these records
to retry a send: Telegram delivery may have succeeded before a timeout. Failures
become needs_review and trigger a private owner notification when possible.

No test message is sent publicly. Tests mock all Telegram API calls. A live
permission check still requires the owner command after the verified release.
New videos require owner approval; the four videos supplied on 15 October are
already published on TikTok and must not be automatically reposted.

## Reviewed comics (owner 19 October 2026; reaffirmed 20 October)

Publish one additional new Oki comic every day at 20:30 Asia/Bangkok, with Russian
dialogue, varied panel sizes and Oki's exact approved reference. This supersedes
the former Tuesday/Friday schedule. Preserve an already approved/sent comic for
the same day; never add a second or resend an old slot under a new ID. If 20:30
is occupied, preserve that post and use the nearest later free slot at least
30 minutes after it. New daily IDs are stable and unique; expiresAt is three
hours after publishAt. Ordinary 09:00, 14:00 and 19:30 text slots remain.
Until 1 November 2026 publish only to Telegram; do not resume TikTok, YouTube or
Metricool. No repeated routine owner approval is required for this comic task.
Owner decision 20 October 2026: keep at least seven upcoming calendar days of
finished, individually reviewed comic pages ready in the queue. The existing
daily 10:00 Asia/Bangkok comic task replenishes missing future 20:30 slots;
preserve existing episodes and delivery records. Warn if confirmed ready
coverage falls below 48 hours. Scripts or unmerged PRs are not ready coverage.
The seven-page buffer adds about 4.1 MB of JPEG assets to the former 27.8 MB
bundle. The total static budget is 33 MB for this owner-requested expansion;
HTML, gzip and JavaScript budgets remain unchanged. Comics are fetched only
for channel delivery, never loaded by the website UI or added to its precache.
Expired later episodes remain in Git but are excluded from the public build.
Each page must be reviewed before entering the queue. The first episode replaces the
16 October 19:30 text slot, retaining its ID so an already-delivered slot cannot
be sent again. Optional `photo` uses only versioned images at
https://www.ok-ok.click/assets/channel/. Captions must fit 1024 characters.
Assets are copied from channel-media during the native build; max 10 MB.
Photo posts read the reviewed file through the internal ASSETS binding and upload
its bytes using multipart sendPhoto. Telegram never fetches the public URL.
Text posts retain sendMessage and their existing
text hashes. Ambiguous photo sends are never retried automatically or replaced
with text. New comics require reviewed content; do not invent real visits,
prices or documentary depictions. The approved published comic is the public Oki style reference.
