# Generator smoke test — 2026-10-14

Scope: local Node.js 22-compatible script check against the current three-item queue. This is **not** a GitHub Actions or Cloudflare run.

Results:
- `node --check content-pipeline/generate.mjs`: PASS
- `node content-pipeline/generate.mjs`: PASS, generated 3 review-only draft sections
- Three `Approval: pending` markers: PASS
- Oki video gate present: PASS
- Setting `publishing_enabled: true`: correctly rejected
- Duplicate draft ID: correctly rejected
- Unknown channel: correctly rejected

Limitations:
- No AI model API was called; existing drafts are template-based.
- No GitHub Actions execution or Cloudflare deployment was performed.
- Full editorial accuracy and final video visuals still require human review.
- Keep PR #20 draft-only and do not merge while production auto-deploy remains enabled.
