# NEXUS resumed certification — 2026-10-16

Decision: **HOLD**. No production deployment, merge, release publication or service purchase.

## Latest verification — 2026-10-17 UTC

- Actual deployed Edge staging journeys passed at 320/768/1024/1440 without a candidate HTML overlay (76.04s). Logo source fix was deployed by successful Nexus2 staging-only run 38963531519.
- Linux Chromium CI 38990243993 correctly FAILED for real directory-card overflow at 320: scrollWidth=332, viewport=320. Diagnostics now retain dimensions, offending elements and screenshots. Nexus2 PR49 head 8d3346c fixes grid intrinsic sizing/card wrapping and is undergoing fresh staging-only deployment.
- Manual DOM review of incomplete checks found six named generic divs without roles and the send-arrow label ambiguity. PR49 fixes those findings. Contrast remains OPEN: 772 incomplete nodes in the 320px scan, mostly gradient backgrounds, plus overlap, empty inputs and symbols. This is not a passing manual review.
- Strengthened actual keyboard coverage: menu opens/closes with Enter, Tab reaches its navigation links, filter entry uses keyboard input and local draft save uses Space. Existing skip-link, focus, reload and directory Enter checks remain.
- Full incomplete-node details are retained in Actions evidence rather than just rule IDs. No violation or overflow assertion was relaxed.
- Re-run current-head Chromium after the staging source deployment. Source-candidate, Edge and Linux evidence are distinct. Full manual keyboard/contrast and screen-reader review remain required; no authenticated-app acceptance is claimed.

## Prior evidence (historical)

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
