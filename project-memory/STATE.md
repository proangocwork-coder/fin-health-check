# State

Updated: 2026-11-19 by WP-07 session 4 (VIBEOS, company laptop) · Checkpoint: CP-20261119-09
Tier: T1 · Stage: Development (G4 loop) · Last gate passed: G3 (2026-11-19, agent-confirmed) · G2 (2026-11-19, D-003, D-004)

## Now
T-001, T-002 done. T-002: `src/lines.js` catalogue of 39 lines with TT200 / TT99 codes, default template by fiscal year, matching pasted rows by name (accents, numbering, case, site typos ignored). Browser verify PASS 9/9 on the laptop. No task in progress.

## Next
1. On the personal machine, first step: `node --test` must pass 9/9 (the Node path of the harness is still untested). If it fails, fix the harness before anything else.
2. T-003 input checks, then T-004 ratios (tasks.md order). T-003 must write explicit sum formulas (catalogue `parent` is not additive).
3. Ask the Owner at T-008 whether the reference Excel for PHP, VIC, HPG is under way (PR-08).

## Waiting on Owner
- Nothing blocking. Optional: time one manual entry of HPG 2 years with a stopwatch (NFR-002); start the reference Excel from audited reports (needed at T-013).

## Known issues
- The built-in browser pane is not signed in to GitHub; repository-level actions on GitHub are done by the Owner.
- Company laptop has no Node.js; it verifies with `tools\verify-browser.cmd` (Edge headless). The browser pane of Claude cannot open `file://` pages, so UI checks there are done by the Owner.

## Verify
Command: `node --test` (personal machine) · `tools\verify-browser.cmd` (laptop) · Last result: laptop browser PASS 9/9 (2026-11-19, after T-002); Node not run yet

## Pointers
Brief: project-memory/BRIEF.md · PRD: project-memory/PRD.md · Architecture: project-memory/ARCHITECTURE.md · Spec: project-memory/features/001-metrics-and-scores/spec.md · Flags: project-memory/FLAG_RULES.md · Tasks: project-memory/tasks.md · Risks: project-memory/RISKS.md
Decisions: project-memory/decisions/
Principles: project-memory/PRINCIPLES.md
Handbook: VIBEOS repo (personal machine `C:\Users\1\Desktop\vibeos`; company laptop `Desktop\VIBEOS_PROJECT\VIBEOS`); pilot metrics in 09_PILOTS/PILOT-01-fin-health-check/METRICS.md
