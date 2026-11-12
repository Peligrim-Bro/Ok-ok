# Telegram buffer — 12 November 2026

Scope: append 21 ordinary entries and 7 new Oki comics #25–31 for 13–19 November; preserve all 107 existing entries, IDs, content, slots and delivery history. Hosting/delivery settings unchanged. No public test or catch-up send.

Base main: `d311b1aeb553c7bb5ca0b084e79dc7a45c7abaeb`. Stage: reviewed and locally validated; PR/production checks pending.

Content: short Russian practical posts; seven exact English phrases with visible Russian translations and native copy buttons; seven independent fictional Oki stories. Built-in image generation produced a separate source for each image. Prompts use unique scenes, no real-visit claim; comics use the opened episode #24 identity reference. All 28 images visually inspected. Generated scenes explicitly disclosed in captions. Source PNGs retained in generation artifact store; delivery JPEGs below. Ordinary 640px quality65, comics720px quality76, proportional, no change to historical assets.

Tests: all107 previous objects compared exactly unchanged; 41 publisher/presentation tests pass; 28 final composed captions under1024 UTF16; queue audit ready:true, no gap/collision/missing media/exact duplicate; native build and verify-project pass. Initial build exceeded33MB; compressing only new media reduced final siteBytes to32640715 without changing budgets. Browser/Lighthouse CI pending. Runtime enabled/chat_id/delivery receipts unknown.

| Asset | Source SHA256 | Delivery SHA256 |
|---|---|---|
| okok-bike-return-20261113.jpg | `4e494a6f6924ade984827114045b19b35759feb73c213dcf690dd1e6db6241c2` | `aeb6773f3fbf5cc2df92bc93a3205181c33d7cb16905750ccaea00aca03c7682` |
| okok-table-outside-20261113.jpg | `481ff9fd673129434976df128137d1ac40d9bbb184a12b48d38ffb9f7d5a9836` | `599675ea517348b3c53ca75798fbb4626fce458e3d8881c09cee70f9a773b382` |
| okok-book-evening-20261113.jpg | `73c8c9fa8ca513a7cfabff102d2c5cadd0d1330876f500ee1a87a2e255500638` | `773161692b3d156010e8071ed75db830f6ca09c8da44d764805b33b8495d6722` |
| okok-rain-bag-20261114.jpg | `fb28e3315f9b5dc7556142279fccf941f2c93b841a8693fbd2a0dcd044932208` | `481474e2dd625b75579329685a710659f10f7dd0e1f90eb8c556be18e968001e` |
| okok-no-sugar-20261114.jpg | `f04cb0f3fbcb3e2467facefb25a7d9ecaa6a5e32dbbb1aae70ac90dac65790d3` | `0406af52e51805fdf4ef973ef4f0d126440ea7774e230e765e160e894a91a1dc` |
| okok-bill-detail-20261114.jpg | `2c86532d687ec082f0a1c464047867ea9799a275632d5f5f1496fdcd4ccb65fc` | `675bc064161d9789d3a4d01856dc55c6a5a0e5eb354de294c1ee5a13b14145c7` |
| okok-crossing-20261115.jpg | `30f1c50cc00178b487235a047077c178a65686281bb8e70465dbe0fce9d0d3bb` | `9112873b85757d614431b6d047bfd0053241c23fda7afa4c003383dd80b7a86f` |
| okok-takeaway-20261115.jpg | `eafc0e55fc4b4a1fc78cfdb525fa65f105374ce1bd0d97038be6de2ff4a139fd` | `fec92f0f07b68288dc2a4811251a422957197f782d22a0a21da896026a56c44d` |
| okok-photo-route-20261115.jpg | `d40feb3bc309201484e0383d39d37764d54291c85920b8c2a99f4085316e4ccd` | `820fc79c4f28979050e948f0fe5e12bbfc10192d54cda6201e76b5029ce9aab6` |
| okok-booking-name-20261116.jpg | `e0835b2efd7a4ff17592e41028ed4e41dd852b3c400fd1b3c04297f6cea6d45e` | `850f2e0ecbbbaac23e7e45edd88cff11ab4cecdd9780d99b8be1e569d5ee5872` |
| okok-receipt-please-20261116.jpg | `dc52d5ef7c73133ef442a369dd0d3e5c201b5143cdc6b75928f737cd5b16b03e` | `784c83498d1c184d1b095a6a73b7b0db73708c1761a1f73e91b9516a50f35551` |
| okok-sunset-back-20261116.jpg | `8d815ee082aa63c381badb32f02d59cd64bfe21e8849639a7f534638e37f740a` | `a57c8bcd17763375e8b6c0ddaf38e188a20979e65b017b516fb70df527223e8c` |
| okok-helmet-fit-20261117.jpg | `4ea260f430931140232b0282429e70b68da1945076682d803ea029ca9ea2567f` | `279d5700d440e8d6a02fea7295638f570e45b691f050d52caa0f3f2d17df62ed` |
| okok-pay-card-20261117.jpg | `2e4a48844cd80f4e410178087923827f0f65d42914f3007f5fe686c1d5839d5e` | `c1f014fca2e9d4f58896fdc5a55dea8f3e9c7bfdc79469f44570d80ecaa59d69` |
| okok-quiet-stop-20261117.jpg | `4b7c6a371ded1d1d07f4688c8c0d4782a4e75c86b32f418c531e4e31687262a6` | `31ac5647752a9150a0c874bcb95cc893d439cb1b2037648b0e7df0958fddbb2b` |
| okok-rental-deposit-20261118.jpg | `1eccecb66e2cea4b9afc82ad9d158b23ba3d9d9afe22def94fb08246a128ea8e` | `1006d8a2756b4761d2b2ae8c461194a94e856bdd261f25b1c07e9feb5ba1025e` |
| okok-slower-again-20261118.jpg | `af79f5e0afc602ef049cff5adc767eb5b51215d46c184cd41dcd32f4e2b268d1` | `4c7eb5a0cbbe21242b0c7a7980898f7d34f85656e844cbdc996f227a5756fbac` |
| okok-shared-photo-20261118.jpg | `0bf88ed9e9ce899613864568f53121e09d3b1748e6b6d988d7ac02ff1f27cade` | `bc24d158158de52a8c860140fb3a767858d765525d758729124d30edf00faf5f` |
| okok-stairs-entry-20261119.jpg | `519e23bb858d69778732357058df3c9dd39883cf50707a98f84e180c59daa492` | `395486b1e8187f204740be3b80dc2ea5c218f16c4077df3abab0fab07532ef88` |
| okok-water-bottle-20261119.jpg | `35148d54758519f1a288c6515382062b9bfa8b82542c5779f518a167c48ddf73` | `d72772d5b1ac5e434cfdc4ae3207d4522126090f4d22f05945447d209c2ab609` |
| okok-one-find-20261119.jpg | `f79bf2d9c4d6092dc8b4b5b982b85934bdd19012007a6df6ddedada226103eb8` | `2c2619ba15d196ccb9833a2298e15f5323712e752dbbc586731801ee478fdf62` |
| oki-comic-025-20261113.jpg | `4ae138930a17fc67a5f098073de4c2328e4ee301a8698890bed2499ae0f5c598` | `532e9aeb24b49d8f2cf04b7fd711c058c81b44117aac5fe0e473355c867d6f6b` |
| oki-comic-026-20261114.jpg | `6596a3eaf15492fb7a0798a10bd2c53bc403301640d344b3b92cd4616553156e` | `30461d97633f2676566796152821a9b017ea2d20ee89e012340234bc30440cd2` |
| oki-comic-027-20261115.jpg | `00c9914c49efa2ff7d62cc2607c3fe3503d8d466a481e6dd6b2e88cb7f6fa8d5` | `346d65a46b46092ba1b658bf853f7d306ceb652d801da3230f65892db0b5ad3e` |
| oki-comic-028-20261116.jpg | `de2a70e010ed23f6f123d24ce1203123363eb2356836930d40b5025f5fe88037` | `fa0977ee44905bb33e16394e9c10629026495e4af874d1af55617420138cc4f1` |
| oki-comic-029-20261117.jpg | `81f6fdcd22db95e20188c86424a388e472139d9d13dd1b3a4a7ab1390b4b7aeb` | `0dd6c72919049442996b1621527c8cec3391a349d23bdc62858828876e43cc9c` |
| oki-comic-030-20261118.jpg | `8eeb3cc309ac6fc709832bae92e71c4072811f8f0fc48a54a13ca95ce9ac75e7` | `a23288848fb46a0c914ed879c31d8884350dc022847aad5b576d7bbf60d217f6` |
| oki-comic-031-20261119.jpg | `26c8e0bd42c6170aa512d1993ba61f8a87e5a7091141ebff6ff9349e91d9aef1` | `087e4e4e79b76f13b4260f1e3a3962e3fa4c6f5ac7f4f97a153d18c4295c9c42` |
