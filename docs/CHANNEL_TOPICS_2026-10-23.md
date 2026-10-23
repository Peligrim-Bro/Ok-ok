# Telegram topic navigation

Owner request, 23 October 2026: give every post thematic hashtags, including
phrase categories for greetings, restaurant orders and taxi use. Source main:
20060b41a558e8d0a90ec8be6bf2af0573d48f56.

All 48 reviewed queue entries have 2–3 explicit topics in channel-topics.mjs.
New entries must provide topics directly or receive a reviewed mapping; missing
metadata fails the queue import instead of guessing. TOPICS is the shared
vocabulary. Use #Фразы plus the situation: #Приветствия, #Ресторан, #Такси.
#Английский is appropriate for English phrase collections. Use #Завтрак, #Обед
or #Ужин only for an actual meal-specific post, not for a universal sauce/bill
phrase. Keep at most three tags, no synonyms or unrelated trending tags.

Post scheduled 23 October 14:00: “Две короткие фразы для заказа” →
#Фразы #Английский #Ресторан. Existing body, selected copy phrase, entities,
buttons, media, IDs, timings and legacy delivery hashes remain unchanged.
channelText appends tags after the signature; channelPresentation adds explicit
UTF-16 hashtag entities outside hidden answers. Full composed length is checked
by the existing publisher before a text or photo send.

Historical tagging is NOT completed by a source change: the existing publisher
does not expose authenticated message editing or stored message snapshots.
Public channel history was unavailable through both the web reader and a direct
public request in this session. Do not reconstruct and overwrite existing posts
from the queue: the owner may have edited/highlighted them. Do not send test or
replacement posts, forward private copies, guess message IDs or alter delivery
records. Historical edits require actual current messages/markup and message
IDs plus authenticated access, then before/after checks and edit receipts.

Local build and topic/publisher tests pass; an initial build failed the protected
partner check, and a fresh build without source changes passed it. Final CI is
required before release. Pending: full browser suite, Lighthouse three runs and
screenshot review; then Cloudflare success and exact live SHA. PR records final
release proof. Future source/payload checks do not prove Telegram delivery.
