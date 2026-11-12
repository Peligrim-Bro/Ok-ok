# Telegram community — 12 November 2026

Owner superseded embedded chat with a Telegram group and supplied invite https://t.me/+PzbwNFr0aNE1ZDI6.
Scope: localized community link and explanation in existing author-contact block; support remains separate. No Supabase writes, bots, messages, scheduled tasks or paid services.

Base:95bfaa6. Files: author-chat.js, scripts/apply-author-chat.mjs, tests/author-chat.spec.cjs; stable task telegram-community.
Build/native checks passed (npm run build). Local Chromium cannot start: socket() Operation not permitted; full browser/Lighthouse must pass on GitHub before main. New tests cover exact URL, translations, new-tab safety and lazy support behavior. Review generated screenshots for contact block; confirm Workers Builds and /build-info.json after publication. Telegram group access and moderation settings are owner-managed and not verified by an invite URL.
