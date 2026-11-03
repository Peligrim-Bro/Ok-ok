# OK-OK SPLIT — source received, integration checklist

Source: complete standalone HTML pasted by owner in conversation on 2026-11-03. Preserve original source when transferring to split-bill.html; do not replace with a simplified rewrite.

## Existing functions
RU/EN; by-items and equal modes; participant assignment; VAT 7%; service 10%; additive/cascade; inclusive/exclusive; tips; PromptPay; local OCR with Tesseract.js (tha/eng/rus); manual OCR review; copy and Telegram share; satang rounding.

## Focused fixes before publishing
1. In equal mode, the bill amount is labeled 'total bill' but taxes can be added on top. Clarify whether input is before/after fees.
2. Thai OCR may mistake comma grouping, quantities, and totals. Require review; avoid claiming OCR is accurate.
3. `parseOcrText` accepts strings ending in a price but does not reliably detect quantity, thousands separators, discounts and negative rows. Review against actual Thai receipt photos.
4. In `calculate` the largest remainder allocation must reconcile all member shares plus unassigned amount to grand total, including floating point and removal edge cases.
5. `currentLang = localStorage.getItem('okok_lang') || 'ru'` should validate stored value to 'ru' or 'en' to avoid undefined translations.
6. Clipboard API needs failure handling and fallback on iOS.
7. Telegram `window.open` may be blocked; offer a copy fallback.
8. Do not promise fully offline operation: Tailwind CDN, Font Awesome, Tesseract worker/models and jsPDF are remote assets.
9. PromptPay field contains sensitive payment details: do not send to any server; confirm sharing intent.
10. Keep a working 'back home' link and mobile safe-area bottom padding.

## Publish plan
Add original full source to split-bill.html in this feature branch, address the above, test on iPhone, open PR; do not merge to main without owner approval.
