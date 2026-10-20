# Telegram channel publishing

## Rolling text queue (owner 19 October 2026)

Maintain seven future calendar days of reviewed text posts. The existing daily
editorial automation is enabled without a COUNT/UNTIL end date and runs in the
Bangkok morning; it replenishes the queue through a checked GitHub PR. It is
Telegram-only and does not resume paused TikTok/YouTube publishing. Text slots
are 09:00, 14:00 and 19:30 Asia/Bangkok. The owner's superseding 19 October
decision reserves 20:30 daily for the separate Oki comic task. Tuesday and Friday
19:30 are ordinary text slots when empty. Preserve existing approved/sent comics
at their original slots; never replace them or fill 20:30 with text.
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

## Reviewed comics (owner 16 October 2026)

The owner approved the comic rubric twice a week, with Russian dialogue, varied
panel sizes and Oki's exact approved reference. The first episode replaces the
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
