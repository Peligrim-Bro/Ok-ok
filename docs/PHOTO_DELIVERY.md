# Responsive place photos

## Scope and implementation

Four existing catalogue/home photos (Sky Gallery, Harlan's, Cabbages and Musselana) get 480px and 960px WebP variants. Native srcset/sizes selects the resource during initial card rendering; the original src, detail cover/gallery, lazy loading, alt text, languages, filters and card layout stay intact. Other photos are unchanged. No new dependency, paid API, external image host or hosting configuration.

Sources: existing site photos under assets/images/places/, listed in content/responsive-photos/manifest.json. Variants were made from those originals with EXIF transpose, RGB conversion, proportional LANCZOS resize, Pillow WebP quality 78/method 6. All eight files decoded and their declared widths were checked. Originals remain in site-source.zip. To refresh a source photo, regenerate both variants from the new original; filenames in the published assets include content hashes.

## Transfer measurements

| Photo | Original bytes | 480px bytes | 960px bytes |
|---|---:|---:|---:|
| Sky | 430670 | 39348 | 140558 |
| Harlan's | 330189 | 39294 | 143984 |
| Cabbages | 244098 | 52332 | 165518 |
| Musselana | 386256 | 48886 | 169192 |

These are per-image file sizes, not a claim about whole-page speed. All eight variants add 799112 bytes to static output; existing size budgets remain enforced. No variants are added to install precache; requested ones use the existing service-worker runtime cache. Old releases use a distinct cache identity as before.

## Verification and release checkpoint

Base: 33747e6897190a2dcf1258ffc426907c58e8742b. Local isolated patch: eight outputs generated, inline JavaScript parsed, original detail cover retained. Browser checks cover actual selected currentSrc on 390px DPR1/DPR2 and 768px DPR1, absence of original photo requests before opening details, Thai rerender, original detail cover and offline reuse. Full browser suite, native build and three Lighthouse runs are required on the final PR head before main. Review screenshot artifacts across RU/EN/TH, both themes and portrait/landscape. CI results and production build/SHA confirmation will be recorded in the linked PR before marking complete.
