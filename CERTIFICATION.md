# NEXUS certification evidence — 2026-10-16

Decision: **HOLD**. Draft PR #1; no merge, production deployment, service purchase, or publication authorized by this evidence.

6 Python tests pass locally. GitHub Actions run 38960147539 passed on commit 714ffe6, including real Chromium/axe detection of an unlabeled button and npm audit (zero reported vulnerabilities locally).
The runner restricts HTTP requests to one operator-allowlisted origin, blocks service workers, and reports actual violations plus incomplete rules. A successful scan is distinct from accessibility acceptance. No numeric accessibility score is invented.
Local Chromium installation failed because the browser archive was invalid/truncated; CI successfully installed and ran Chromium. Actual application URLs, authenticated journeys, keyboard checks and responsive visual acceptance remain unverified. Run this adapter only in an isolated runner with no internal network or service credentials; origin allowlisting does not provide DNS/network isolation.

## Reproduce

`python -m unittest discover -v -p 'test_*.py'`

GitHub Actions runs on the PR branch with contents:read and a bounded job timeout. Review current-head Actions results; prior passing commits are not substitutes for current-head evidence. No tests against live Sentry/Jenkins or a production environment were executed.
