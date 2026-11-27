# Telegram buffer review — 27 November 2026

Scope: add only the missing 1–3 December slots after the joint queue check found
four complete future days (27–30 November) in `main` at
`7a498b071816346ef5013cd167de7a59218b7cdc`. Existing posts, media, IDs,
referrals, delivery history, website layout, advertising state and schedule are
unchanged.

## Reviewed entries

- Ordinary posts: nine new 09:00, 14:00 and 19:30 entries for 1–3 December.
- Comics: three new 20:30 pages, episodes #43–45.
- Every entry is approved, expires three hours after its slot, has a distinct
  topic-specific image, reviewed topics and a unique UTM campaign.
- Copy buttons exactly reproduce the visible phrases in the 1 December 14:00,
  2 December 14:00 and 3 December 14:00 posts.
- No volatile price, schedule, review, weather or personal-visit claim is used.

## Image provenance and SHA-256

All source files were created with the built-in image generator during this
run. Ordinary images are independent scenes. Comic pages use only
`channel-media/oki-comic-001-super-soup.jpg` as the public character/style
reference (SHA-256
`3db594c99972abfa1c4a26f649090d49d356c643371d8534b5cdd87280c92246`).

| Final file | Source SHA-256 | Final SHA-256 |
| --- | --- | --- |
| `okok-private-luggage-tag-20261201.jpg` | `83554bbc1b1fdeb1e586fc9e34ca14f84b503a2009f9d9dd054aa671e9a7eabc` | `99a826bd6c7b7a0c610f4df419e77a2b14c2c47abfd54f82dcb2b4b8de2c0cc9` |
| `okok-write-address-card-20261201.jpg` | `6514b7fc13063b7fd1b141f52345e3382184f486fdce0f0fcad82d4a05c36c15` | `7fcadd86120de684bff761bed13c9245fb95e69564426eeed076e05c0033ad76` |
| `okok-parking-landmark-20261201.jpg` | `59615361cb42830b5ae0c9a74b80ba785c39c8547a8bfb703ee59e923b6a4113` | `2526a16a1b9c5cc0895b98506b76da9e220f534f5cbf90706a5725ce5029eb71` |
| `oki-comic-043-banana-phone-20261201.jpg` | `423d1973ccf3b65aacf6bfc52832bee3c8cb395543045f4d3b455c46dcf68f35` | `415740ef8c16fa68a7833a46eb9065b47a5f0f8381ba05b7049fb9e80c5b66e4` |
| `okok-laundry-item-count-20261202.jpg` | `ee018f2afa45356eb4eab66b7479e90346c6ca533198f96bf829e609657a7b31` | `09b78ea981cccfaae2b87acde4584de55f724e7fd0c1413e02ecff1c827965fb` |
| `okok-less-sweet-20261202.jpg` | `d339d7f1d091e92a86242a35f73b38d9ce1ee13a165b96d34d7196fc0f281fe0` | `c14724b0002549963e828d763ec5a6a00895a9441eb2660fa479b4ea453881c5` |
| `okok-fallback-meeting-point-20261202.jpg` | `8c5dbf2fa457f096b97649ca646f9dbca7779c53590d93bbcdaa0b9ed64432f1` | `1af86899a9ecd681ff6bb9af6c2fd74aedad064a874ac77b4471c20a3259b606` |
| `oki-comic-044-shell-alarm-20261202.jpg` | `41a0cd0a76463c3ce999e00c732ec399329fad2409230209a34ee9e4d01fd6c0` | `8ef7bcfcc8fa1bd612f2011d52411833f943ab63a39f70aa8de6edd0711c2e58` |
| `okok-pickup-side-20261203.jpg` | `66e316aced59a432dae95b5986f198d02e0ae204717c9221aed1fc676b4c7583` | `67307fab3308999e3628aeaac94d1944e932dd12b4587cbf934c7a57e17ad1a2` |
| `okok-speak-slowly-20261203.jpg` | `4b28aa81972229431b2559b87bb24cee075c4275f9ac6e570c09b5cbfecf9569` | `fb2b828ad4329ae5575ff55d4c29a796f516c319128ce798dc9ce3e477515cf1` |
| `okok-choice-wheel-start-20261203.jpg` | `1ee8c78b66140910ab066e8a056ad30bee06571411137e283136f5cd6a6e7f01` | `92448db48e0651bf70532d55714c4cf05e6fe2da49d60679f0ea3b3bb73aed86` |
| `oki-comic-045-leaf-map-20261203.jpg` | `77af3a404160af33b1bae6b28e7023a5a5e6a691c1fd35ff5252906e4141ed2d` | `bb07bcaab4b27f39c2d94f958e900eaf7b0378a2ff04a4ae5182a52b26de72d5` |

## Visual review

- Reviewed all final JPEGs together after optimization: nine distinct ordinary
  scenes and three distinct comic pages; no recolour/crop substitution.
- Ordinary scenes match their subjects, contain no asserted documentary venue,
  readable private data, prices or brand marks, and are clearly presented as AI
  illustrations in their captions.
- Comic reading order, issue numbers, titles, Russian dialogue and
  `ok-ok.click` are readable. Oki keeps the approved curl, face, translucent
  pink/turquoise body and Hawaiian shirt; no costume/robot substitution or
  material limb error was observed.
- Final ordinary images are 720×900 JPEG; comics are 720×1080 JPEG. Each file is
  below 0.35 MB and remains readable at delivery size.

Deployment, queue enablement and Telegram delivery are separate facts. A valid
delivery still requires the expected numeric `chat_id` and positive
`message_id`; this review does not claim either.

## Local verification

- `scripts/audit-channel-queue.mjs --now=2026-11-27T08:10:25+07:00`:
  `ready:true`, 28 future posts/photos, no missing slots/images/files,
  collisions or exact image duplicates.
- `npm run build`: passed after optimizing only the new JPEGs; final static size
  32,710,575 bytes within the unchanged 33,000,000-byte budget.
- Channel publisher/readiness/style/presentation and payment tests: 57/57
  passed; channel publisher integration subset: 45/45; payments: 10/10.
- The owner-disabled advertising invitation remains absent. Browser/Lighthouse
  CI and exact deployed source verification remain required before release is
  called complete.
