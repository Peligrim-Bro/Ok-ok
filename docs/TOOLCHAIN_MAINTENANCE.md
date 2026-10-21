# Toolchain maintenance checkpoint — 2026-10-21

Scope: keep the current Lighthouse CI 0.15.1 and all thresholds; patch only two vulnerable transitive consumers and pin the already-used GitHub deployment CLI.

- Scoped override @lhci/cli → uuid 11.1.1 (last compatible CommonJS line with the relevant buffer fix).
- Scoped override get-uri → basic-ftp 6.2.3. Current get-uri APIs and parsing of ordinary/synthetic malformed listings checked offline.
- Existing tmp 0.2.7 override remains unchanged. Lock comparison found only uuid 8.3.2 → 11.1.1 and basic-ftp 5.3.1 → 6.2.3; no removed packages.
- npm ci --ignore-scripts passed locally. Offline consumer check verifies UUID v4/v5, v5 short-buffer rejection, get-uri import and FTP client surface/list parsing. The malformed-list check has a three-second child-process timeout.
- Before: uuid v5 accepted an 8-byte output buffer at offset 4 without throwing. After: RangeError. No external server, payment or Telegram call used.
- npm audit --package-lock-only: 14 → 9 (10 high/4 moderate → 6 high/3 moderate), all remaining reports belong to dev tooling. Audit counts include propagated parent packages, not independent vulnerabilities. Production audit must remain zero.
- extract-zip and sprintf-js advisories remain open; published patch versions were not found. No audit downgrade, disabled test or substituted unsafe extractor.
- wrangler-action now receives exact wranglerVersion 4.151.3, matching the successful previous production deploy. This pins the GitHub deploy path, not Cloudflare Dashboard build settings. No account, permission or runtime compatibility_date change.

Release validation on the final PR head: build/native checks, full browser suite, payment UI, three Lighthouse runs and representative screenshot review before main. Actual results and release SHA are retained in the PR description. After merge require successful production deployment and exact live build-info SHA.

Rollback: revert this maintenance commit through a reviewed change while retaining unrelated current main work. This restores the previous vulnerable transitive versions, so it is an emergency compatibility option, not a preferred security state. GitHub may again choose a floating Wrangler version if its pin is reverted.

Sources:
- https://github.com/advisories/GHSA-w5hq-g745-h8pq
- https://github.com/advisories/GHSA-c475-qrg2-pj4r
- https://github.com/advisories/GHSA-jmr9-qjv8-65gv
- https://github.com/cloudflare/wrangler-action#configuration
