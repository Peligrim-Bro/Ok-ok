# Sourced business reports — 27 October 2026

Owner: add a real report after entering a rental/school name or website. Approved
first stage: prepared source reports, then arbitrary-business research. No paid
API, new secret, bot configuration, external service, automated public message or
RAG assistant reactivation is included. Unknown businesses must remain unknown.

Implementation: 10 Pattaya records (five rentals, three visa agencies, two language
schools), explicit organization selection, source dates, self-published claims,
separate old rating snapshots, unknown registry/licence/complaint coverage, English
questions + translations/copy fallback, source links and report share/deep links.
The home carousel’s existing third entry opens #check in /ne-vedis/index.html.
Trainer/catalogue routes and the guide remain. No extra home button stack.

Data: content/business-reports.json. Nine usable business source pages reviewed
27 Oct (Dee Trip retained at original 18 Oct catalogue date: Canva content could
not be extracted). Existing rating snapshots remain dated 18 Oct; they are not
restamped by viewing the report. No claim of an independent complaint search,
registry verification, current school licence validation, whole-review analysis,
current operating status, safety guarantee or AI-generated live research.

Reviewed source pages (27 Oct):
- https://www.speedbikepattaya.com/
- https://pattayabiketrip.com/guide/deposit-insurance
- https://pattayarentacarandbike.com/rental_requirement/
- https://www.zoride.com/16769145/requirments-and-payment%E0%B9%80%E0%B8%AD%E0%B8%81%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%AD%E0%B8%9A
- https://www.tvsservicesthailand.com/All-Services
- https://thaivisa-express.com/
- https://pattayaservicemarket.com/
- https://progresspattaya.com/language-courses/
- https://plcpattaya.com/about/
Dee Trip attempt: https://deetrip-tours.my.canva.site/website-dee-trip

Pattaya Bike Trip’s X-ADV passport/cash exception and bike damage/theft insurance
exclusions are attributed to the business page. School licensing remains a claim
from each school. Progress’s published number is preserved without presenting it
as independently valid. Existing provider/referral data is unchanged.

Runtime matches prepared records only. No submitted URL is fetched; user input
is not persisted or logged. Unknown names get a clear coverage message and optional
manual Maps/web search links, never a fabricated verdict. Matching rejects schemes,
credentials, homograph/suffix hosts, unrelated Canva paths and unrelated Maps
queries. Reports are embedded only in the on-demand centre, already cached offline;
root HTML, JS and total budgets remain unchanged. Sources older than 30 Bangkok
calendar days are labelled for recheck; offline viewing never creates a new date.

Stage: local build/native source-matching tests pass. Run final focused reports,
full browser suite and three Lighthouse runs, review images, then merge/deploy and
verify live organization selection/report/copy path. Browser QA is emulated;
physical iOS and third-party clipboard/Telegram apps are not implied tested.

## Completion — 27 October 2026

PR84 merged as 320f6c8cd52d64ed4856942f68c697ab7e953e08. Final app
head21c3e3d8d3bae82aa5e39309b1ea80764ac0d8af; CI40514368549 passed216
full browser tests,45 focused guide/centre/report tests, native/build checks,
payments and3 Lighthouse runs. Search/report screenshots reviewed across languages,
themes, phone/tablet/landscape; Thai glyphs in Linux snapshots depend on installed
system fonts. Cloudflare deploy40515522654 succeeded and verified the exact app
merge SHA plus11 live checks. Root budgets: HTML459821, gzip128264, JS924815.

Live browser: home carousel -> checker; Progress -> one explicit candidate ->
source-dated school report; unknown name -> coverage message/no generated verdict.
Copy UI acknowledges writeText, but the cloud clipboard read returned empty, so
a physical clipboard success is NOT claimed. Exact text and denied-copy fallback
pass browser mocks; visible English text is always manually selectable.
Canonical entry observed: https://ok-ok.click/ne-vedis/?lang=ru#check
This closes the first-stage task. Whole-web arbitrary-business research, independent
registry/licence/complaint checks and physical iOS remain outside this release.
A documentation-only follow-up records completion without changing app files.
