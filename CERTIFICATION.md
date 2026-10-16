# NEXUS resumed certification — 2026-10-16

Decision: **HOLD**. No production deployment, merge, release publication or service purchase.

## Resumed certification results

- PASS: actual NEXUS staging marketplace search/reset, private browser-local draft save/refresh, tool-directory search, skip-link keyboard activation, visible 3px focus outline and no horizontal overflow at 320, 768, 1024 and 1440 CSS pixels.
- PASS: candidate HTML overlay of the final PR #49 fix has zero axe violations, no console exceptions and no failed requests at all four widths (70.15s). This is source-candidate evidence, not proof of deployment. JSON is retained under verification/.
- FOUND: deployed staging has a serious label-content-name-mismatch on its home logo. Adjacent span text concatenates to NNexus while the explicit accessible label differs. Fix is isolated in Nexus2 draft PR #49; production is unchanged.
- Added actual staging browser suite, console/network failure assertions, per-width screenshots and JSON evidence. Installed Edge was used on MattWorkspace because Chrome was absent; the controlled cloud browser was used first to inspect the actual interface visually. CI uses Chromium.
- Default test mode audits the deployed site. Optional NEXUS_CANDIDATE_LOGO_FIX=1 overlays the exact proposed HTML response for candidate validation and labels all evidence candidate_html_overlay; it does not represent a deployment.
- Axe incomplete results require manual review. Full screen-reader acceptance, paid AI inference and external app handoffs were not performed. Actual source deployment and final automated acceptance are still subject to the staging-only workflow and current-head CI.

## Earlier evidence (historical)

# NEXUS certification evidence — 2026-10-16

Decision: **HOLD**. Draft PR #1; no merge, production deployment, service purchase, or publication authorized by this evidence.

6 Python tests pass locally. GitHub Actions run 38960147539 passed on commit 714ffe6, including real Chromium/axe detection of an unlabeled button and npm audit (zero reported vulnerabilities locally).
The runner restricts HTTP requests to one operator-allowlisted origin, blocks service workers, and reports actual violations plus incomplete rules. A successful scan is distinct from accessibility acceptance. No numeric accessibility score is invented.
Local Chromium installation failed because the browser archive was invalid/truncated; CI successfully installed and ran Chromium. Actual application URLs, authenticated journeys, keyboard checks and responsive visual acceptance remain unverified. Run this adapter only in an isolated runner with no internal network or service credentials; origin allowlisting does not provide DNS/network isolation.

## Reproduce

`python -m unittest discover -v -p 'test_*.py'`

GitHub Actions runs on the PR branch with contents:read and a bounded job timeout. Review current-head Actions results; prior passing commits are not substitutes for current-head evidence. No tests against live Sentry/Jenkins or a production environment were executed.
