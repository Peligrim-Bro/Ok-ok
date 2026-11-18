# Rental calculator · 18 November 2026

Owner approved mobile Figma design https://www.figma.com/design/hkRXoxLdkuHO80PxgWm4ny and implementation/publication after existing release checks.

Scope: standalone rental.html with home and Tools entries, RU/EN/TH, two themes, browser-local saved A/B terms, unknown-value subtotals, apartment comparison, downloadable PNG with visible image fallback. No external services, paid calls, market-rate claims or telemetry added. Explicit example figures are editable; deposit stays outside monthly cost. Entry total includes the full advance exactly once plus deposit and one-off entry charges. Monthly rent remains the contractual monthly amount, independent of prepayment timing.

Source baseline: main 1a5a8e0. Branch feat/rental-calculator-20261118.

Implemented: rental.html, tools/rental.css, tools/rental-math.mjs, tools/rental-ui.mjs. Existing standalone build copies and precaches all calculator assets, adds offline navigation route before generic home fallback. Existing final release-cache identity is unchanged. No payment, referral, Telegram or chat changes.

Verification: npm run build passed native quality, SEO, PWA and size gates. node --test tests/rental-math.test.mjs tests/oki-house-offline.test.mjs tests/live-release.test.mjs tests/release-cache.test.mjs tests/weather-service.test.mjs tests/catalogue-analytics.test.mjs tests/resource-check.test.mjs: 29 passed. Added tests/rental.spec.cjs: interaction/independent state, persistence, validation, PNG plus 18 language/theme/viewport cases and mobile screenshots. Local Chromium is blocked by socket Operation not permitted; Playwright browser download also failed. Do not claim local browser success. Local Lighthouse cannot launch Chromium either. Temporary checks/config remain outside tracked source.

Next: run existing PR CI, review screenshot artifacts, resolve failures, require full browser suite and three Lighthouse runs before merge. Confirm Cloudflare Workers Builds and exact live build-info/verify-live after publication. Physical iPhone/Safari save is not yet verified; PNG visible-image fallback supports manual saving.

## Final visual correction

CI44218119291 and44219357308 each passed282 browser tests plus all four jobs and three Lighthouse runs. Screenshot review exposed missing Thai glyphs in the CI environment. Bundled licensed Noto Sans Thai directly in CSS; its local face uses swap so an initial fallback cannot lock in missing glyphs. PNG export awaits that face. Added explicit Thai computed-family/font-ready assertion before screenshots. Removed redundant active-apartment summary from comparison and preserve the example warning after partial edits. Final local build and eight tools tests pass; cloud-browser actual Thai glyphs visually confirmed. Final CI and exact production verification remain pending.

## iPhone safe-area regression · 18 November

Owner reports home link under iPhone system status bar after release. Confirmed source cause: viewport-fit=cover paired with body padding-top:20px; only bottom safe area was handled. Original browser matrix changed screen sizes with zero safe-area env values and checked horizontal overflow, missing this geometry.

Fix: add all four browser safe-area insets to content padding; home link has a48px minimum tap target. Tests override actual Chromium env values with Emulation.setSafeAreaInsetsOverride:59px portrait top,59px landscape sides, tablet top/bottom. Assert home and language geometry across RU/EN/TH and both themes; rotate in place, scroll and click home. No financial/calculation changes. Local build/native passed; browser launch unavailable locally, use PR CI for full suite/three Lighthouse and screenshots before main. Physical iPhone remains unverified.
