# Telegram channel publishing

Owner-authorized channel: @PattayaOk_Ok. Bot identity must be @Aibotadam_bot.
Uses the existing TG_BOT_TOKEN and owner TG_CHAT_ID only inside Cloudflare.
Never change TG_CHAT_ID to the channel: that would redirect payment notifications.

The separate ChannelPublisher namespace stores enablement and delivery records;
ADS_STORE and payment notifications are not modified. A cron checks every 15
minutes. The queue starts disabled. Only the existing authenticated owner may
enable it using /channel_start, inspect permissions using /channel, or stop it
using /channel_stop in Adam's private chat. Stop cannot undo a send already begun.

channel-posts.mjs contains reviewed posts, explicit publishAt/expiresAt times and
approval flags. No recurring editorial schedule is implied. The initial intro is
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
