# Content workflow test and activation notes

## Why no GitHub Actions run appeared
The new workflow exists only on feature/social-content-pipeline. A workflow_dispatch workflow generally must exist on the default branch to be manually dispatched through GitHub Actions. No schedule is configured, and opening a draft pull request alone does not trigger this workflow.

## Safe next test
1. Review the draft pull request and verify it does not touch site/public or Cloudflare deployment configuration.
2. Run the generator locally or in a separate isolated CI workflow already on the default branch.
3. If enabling the new workflow on main, review the merge diff and deployment triggers first. Avoid merging until confident that no Cloudflare auto-deploy is triggered.
4. Trigger workflow_dispatch and inspect the editorial-drafts artifact.
5. Do not enable publishing or grant write permissions.

## AI integration prerequisites
A real AI writer needs a model API, credentials stored as GitHub secrets, prompt constraints, and validation. The existing offline generator is deterministic and produces outlines, not model-generated posts. Do not call it AI generation until that integration is verified.

## Editorial quality gate
- Sources must have URLs and dates for current news, prices and opening hours.
- Never fabricate testimonials, ratings, leads or conversion figures.
- Oki visuals require an approved reference; all on-screen copy English only and exact URL ok-ok.click.
- Affiliate links remain unchanged.
- All posts remain drafts pending review.
