# Oki place guide — checkpoint

Owner authorized a useful site feature and explicitly required the site to keep
working if the assistant disconnects. Base main d1f854850cfb795254e53ded60b5b5f25cd7b89a.

Implementation: optional browser-only helper inside the existing Pattaya holiday
wheel, collapsed initially. Two choices: food/sights and approximate visit time.
Uses the existing 50-place catalogue, localized descriptions, reviewed sources,
photos and existing visit-time estimates. No AI call, new service, geolocation,
timer or autonomous message is needed. Travel time is explicitly excluded.
Results skip drawn/visited entries and respect the existing family filter.
Showing ideas does not consume draw history. Existing save/visited actions are
reused. RU/EN/TH and both themes supported; existing close control stays in charge.

Failure boundaries: a missing guide script leaves the normal wheel available;
the guide is imported only after the user opens the already-rendered wheel,
through a guarded optional call. Its fetch cannot delay startup DOM/load events.
A stalled optional download must not block the normal UI; late initialization
also respects a switch into the saved-list view.
Styles ship inside the page, adding no blocking stylesheet request. The versioned
lazy JS is precached before normal release-cache finalization. Offline
selection uses local data; external maps/sources still need connectivity.
Storage failure uses the existing visible warning without blocking navigation.
No pet progress, payment, referral, Telegram or other-city changes.

Current files: oki-place-guide.js/css, scripts/apply-oki-place-guide.mjs,
tests/oki-place-guide.test.mjs and tests/oki-place-guide.spec.cjs, build import.
Local build and 71 native tests passed on the final application source. Size:
HTML 454,782 bytes, gzip 124,990, JavaScript 924,906, site 31,616,896; existing
limits unchanged. New browser cases cover all languages/themes, preserved history,
source/map/save actions, reachable close, missing/stalled helper, offline and blocked storage.
Required full browser suite, three Lighthouse
runs and screenshot review must pass before main. Then check native Workers build,
exact live source, guide assets and the 11 public release checks. Preserve this
checkpoint and the PR evidence if interrupted; main remains working until release.

CI 39743861052 passed all 136 browser tests, including the nine helper cases,
payment UI and three Lighthouse runs (65/60/62, accessibility 98, best practices
96, SEO 100). Final stylesheet delivery was then simplified to inline CSS to
remove any optional stylesheet download from startup. The final module loads on
wheel opening only; failure fixtures block service workers to test actual network
failures, and filter listeners belong to the current popup to avoid stale nodes.
Repeat required release
checks on that final output. Remaining proposed features are themed carousels,
optional-answer travel quiz and a phrasebook; they are not claimed implemented.
