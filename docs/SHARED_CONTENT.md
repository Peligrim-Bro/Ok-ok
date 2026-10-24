# Shared editorial records — 24 October 2026

The existing `content/jkao-seafood.json` and `content/musselana-shabu.json`
remain the canonical reviewed place records. `shared-content.mjs` loads these
same records for website build patches and Telegram draft preparation. There
is no new database service, account, API key or recurring model request.

Website: both owner-place build scripts read `getSharedPlace`. Channel: run
`node scripts/prepare-place-draft.mjs jkao-seafood` (or `musselana-shabu`). The
output is an unapproved Russian draft with an explicit source snapshot, map,
historical visit notes, conditions and unconfirmed hours preserved. It is not
inserted into the publication queue. The editor checks factual changes, selects
topics, a unique reviewed image and a future slot before approval.

New place drafts carry `placeRef` metadata. Existing posts are unchanged. Never regenerate approved
post bodies from a changing place record: IDs/body/photo determine historical
dedup, and Telegram history must not change through a catalogue edit. A corrected
fact feeds new reviewed drafts, not silent historical edits or reposts.

`content/editorial.json`, `services.json` and other current datasets keep their
existing roles; this initial shared-place integration does not pretend that all
catalogue data and historical posts have been migrated. Extend shared records
with reviewed mappings when a concrete new content type needs them.

Verification: shared-place tests compare fresh draft output after a fact edit,
isolation from caller mutation, existing post body/identity stability and unknown
place failures. The normal full build/browser/Lighthouse/release gates apply.
