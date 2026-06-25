---
name: browser-test
description: Use when an implementation has passed internal verification and needs real browser validation with Playwright before integration
---

# Browser Test

## Overview

Validate the implemented user flow in a real browser with Playwright. If the browser test passes, use `merge-master` to merge and clean up the work branch.

**REQUIRED SUB-SKILLS:** Use `playwright` for browser automation and `merge-master` after successful browser verification.

## Preconditions

- The implementation is committed or the intended verification scope is clear.
- Internal tests, lint, and build relevant to the change have passed.
- A realistic user flow and success criteria are known.

## Procedure

1. Announce that `browser-test` is being used.
2. Confirm the internal verification commands and results.
3. Start the required backend/frontend dev servers without changing production settings.
4. Use Playwright to run the actual user entry point through the success state.
5. Check visible UI state, console errors, network failures, and the expected persisted/API result.
6. If the browser test fails, investigate, fix, rerun internal verification, and repeat the browser test.
7. If the browser test passes and a work branch exists, call `merge-master`.
8. Report the tested URL, scenario, result, screenshots/logs if useful, and merge result.

## Scope Control

- Test the smallest user flow that proves the changed behavior.
- Do not run broad exploratory browser testing unless requested.
- Do not use browser testing for documentation-only changes unless requested.
- Clean up generated screenshots, uploads, logs, and temporary test data files before commit or merge.

## Common Checks

| Area | Verify |
| --- | --- |
| UI | Expected page, copy, controls, and success state are visible |
| Console | No relevant runtime errors |
| Network | Expected API calls return successful responses |
| Data | Saved or returned values match the scenario |
| Cleanup | Generated local artifacts are not left in git status |

