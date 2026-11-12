# Threads refresh — 11 November 2026

Owner explicitly authorized improving personal Threads, editing future copy and adding media to the existing Worker. Supersedes prior queue-only constraint for this task. No new scheduler, paid generation API, token changes, historical reposts or Telegram changes.

15 future slots on 12–19 November rewritten with concrete everyday situations, varied rhythm and humor. Avoid invented owner experiences and unsupported business allegations. Keep 15 historical objects, all IDs and all times unchanged. Screenshot confirms one rental post with 1 like and 3 replies; reply contents/reach unknown, no conversion claim.

Three distinct generated editorial illustrations reviewed visually: rental keys, photographing scooter wear, splitting a dinner bill. JPEGs in media/threads. Original generation prompts: apartment keys/phone/paper at tropical condo dusk; hand photographing scooter wear on tropical street; three hands around restaurant bill. Built-in image generation, no paid runtime calls. No readable embedded text. Captions and alt text identify AI illustrations; not documentary photos.

Worker creates IMAGE container, waits for FINISHED, then publishes container. Preserves existing TEXT path and receipt keys. An ambiguous media attempt stays claimed and can reconcile against recent public text, preventing a duplicate container/publication. Media errors never silently publish a text-only substitute. GET /delivery-status returns slot IDs and public receipt IDs/permalinks only, no token/content. If processing/publish fails and no public post matches, manual reconciliation remains required; no blind retry.

Validation: node --check worker.mjs; 3 focused tests (image publish/dedup; ambiguous failure/reconciliation; review gate/legacy text); JSON uniqueness, <=500 characters; 15 historical objects equal HEAD; live token health ok=true. Existing full PR checks must pass before main; exact Threads deploy must succeed. Real image delivery cannot be claimed before 12 Nov 19:00 Bangkok. Read /delivery-status after the scheduled slot; do not send an extra test post.

12 Nov: owner explicitly authorized GitHub transfer and launch. Noon slot restored exactly from production source; first rental image moved to 19:00 Bangkok. Production history and other services preserved.
