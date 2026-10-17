# Staging accessibility review — 2026-10-17 UTC

Decision: **HOLD**. Automated zero violations is not a WCAG conformance claim.

| Finding | Review and action | Status |
|---|---|---|
| Six named generic `div` elements | Popular searches, marketplace preview, listing categories, Creator Lab filters, AI tool categories and AI modes are groups of related content/controls. Nexus2 PR49 adds `role=group`, preserving their names and descendants. Deployed Edge scan no longer reports aria-prohibited-attr incomplete. | Resolved for reviewed staging source |
| Home logo visible/accessibility name | Real separator between visible N/Nexus spans and name `N Nexus home` align the complete visible text. Deployed Edge axe scans have no violation. | Resolved |
| Send arrow label-content-name-mismatch incomplete | Reviewed DOM is an icon-only submit button with `aria-label="Send message"`, containing a decorative `aria-hidden` upward arrow. The arrow is symbolic, not a human-language text label. The functional name is appropriate under W3C's symbolic-character guidance for SC2.5.3. This adjudication applies only to this node/rule; it does not assert screen-reader or contrast acceptance. | Reviewed; no SC2.5.3 failure identified |
| Color contrast incomplete | At 320px, 772 nodes reduce to 82 computed-style/background/reason groups, retained in verification/contrast-groups-20261017.json. Most involve gradients; additional reasons include overlapping content, empty form values and symbol-only content. The group data is an inventory, not a contrast calculation or a pass. Background layers, focus/hover states, placeholder/entered values and overlaps require measured review. | OPEN |
| Mobile navigation focus | Enter originally opened links before the button in DOM order, so Tab skipped navigation. PR49 now focuses the first link on open and returns focus to Menu on Escape. Actual Edge keyboard tests pass; Linux acceptance additionally exposed header overflow at 768px, addressed by the 900px disclosure breakpoint. | Fixed source deployed; current Linux rerun required |
| Responsive directory cards | Linux 320px overflow was caused by grid minimum-content sizing. PR49 uses minmax(0,1fr), card shrink/wrap and wrapping metadata. Assertions retain exact overflow detection and screenshots. | Fixed source deployed; current Linux rerun required |

Actual Edge staging acceptance (no overlay) passed at 320/768/1024/1440 in 42.48 seconds, including keyboard menu/Tab/Escape, skip link/focus, marketplace filter/reset, browser-local draft keyboard save/reload and directory Enter search. That run preceded the later tablet CSS change. Browser contexts were isolated; no AI requests or external handoff submissions were sent.

Full manual keyboard traversal, assistive-technology/screen-reader acceptance, authenticated application journeys and measured contrast review remain open. The application does not expose a configured authenticated test journey; no signed-in acceptance is invented.

Reference: [W3C Understanding SC2.5.3, symbolic text characters](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html#symbolic-text-characters). This is a scoped manual DOM adjudication, not a replacement for the remaining reviews.

Post-tablet-fix Edge follow-up: all four deployed widths and journeys pass in 37.23s; see verification/staging-deployed-20261017.json. Linux Chromium must pass independently.

## Follow-up: platform contrast and input focus

Resolved real pale-on-light platform heading, eyebrow and description contrast defect in Nexus2 commit 42ecfa5. Scoped foreground/background-envelope tests require at least 4.5:1 for all reviewed text, including large headings; assert the reviewed gradient palette and decorative grid opacity; verify placeholder contrast. Restored visible keyboard outlines for search inputs, textareas and select. Actual deployed Edge acceptance passes at 320/768/1024/1440; screenshots visually reviewed at desktop. The existing actual staging journeys pass again. Evidence: verification/platform-regression-20261017.json. This closes these specific defects, not the entire 772-node incomplete inventory. Full contrast/state, assistive-technology and authenticated-journey acceptance remains open. Previous Linux staging runs 38992511943 and 38992516225 passed.

## Integration documentation preview

Actual Pages preview passes HTTP 200, exact index.html source hash, strict CSP presence, keyboard skip-to-main, responsive no-overflow and zero axe violations at all four widths in Edge. A mobile long-identifier overflow was found and fixed in devtools e80aadc. Reproduce: node test_docs.cjs; optionally supply NEXUS_DOCS_EXPECTED_SHA256 for exact source comparison. Evidence: verification/docs-preview-20261017.json. This documentation acceptance does not close the application contrast/AT gates.

### Deployed platform link states - 2026-10-17
Verified actual staging after Nexus2 hover fix: default, hover and keyboard focus link colors meet the conservative 4.5:1 background-envelope test at 320, 768, 1024 and 1440 widths. Field focus and placeholder checks also pass. Evidence: verification/platform-regression-20261017.json. This scoped result does not close the remaining axe incomplete or assistive-technology reviews.

