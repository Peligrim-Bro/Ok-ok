# Halloween 2026 — PR 77

Approved scope: small passive pumpkins/webs, Bangkok 28–31 October 2026.
Production remains unchanged until all release gates pass.

Initial CI at d7ae79f failed because JavaScript was 925803 bytes against 925000.
Styles moved to assets/halloween-2026.css and inlined by the build; budget unchanged.
Date state now refreshes every minute and on visibility changes, including removal
from a page left open after Bangkok midnight on 1 November.
Local npm run build and npm run check pass. Local Chromium download unavailable;
GitHub Actions must run the full existing browser suite, 3 Lighthouse runs and
new seasonal boundary/mobile screenshots before merge. Review screenshots.

Next: inspect CI results for this commit, fix failures, review seasonal screenshots,
then follow AGENTS release rules and verify exact deployed build-info commit.
