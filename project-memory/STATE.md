# State

Updated: 2026-11-19 by WP-07 session 4 (VIBEOS, company laptop) · Checkpoint: CP-20261119-08
Tier: T1 · Stage: Development · Last gate passed: G3 (2026-11-19, agent-confirmed) · G2 (2026-11-19, D-003, D-004)

## Now
G3 passed. `tasks.md` (13 tasks, criterion → test map), `RISKS.md` (8 risks), PRINCIPLES conventions, `.gitignore`, README, empty skeleton (`index.html`, `src/fhc.js`, `tests/`, `tests.html`, `tools/verify-browser.cmd`). T-001 done: browser verify PASS 2/2 on the laptop. Spec 001 0.3 has the TT99 line codes (from an unofficial copy of Phụ lục IV on expertis.vn). Session 4 closed. No product feature code yet.

## Next
1. Personal machine, first step: `node --test` must pass 2/2 (the Node path of the harness is untested). If it fails, fix the harness before T-002.
2. T-002 line catalogue TT200 / TT99 (riskiest), then T-003 / T-004 (tasks.md order).
3. Ask the Owner at T-008 whether the reference Excel for PHP, VIC, HPG is under way (PR-08).

## Waiting on Owner
- Nothing blocking. Optional: time one manual entry of HPG 2 years with a stopwatch (NFR-002); start the reference Excel from audited reports (needed at T-013).

## Known issues
- The built-in browser pane is not signed in to GitHub; repository-level actions on GitHub are done by the Owner.
- Company laptop has no Node.js; it verifies with `tools\verify-browser.cmd` (Edge headless). The browser pane of Claude cannot open `file://` pages, so UI checks there are done by the Owner.

## Verify
Command: `node --test` (personal machine) · `tools\verify-browser.cmd` (laptop) · Last result: laptop browser PASS 2/2 (2026-11-19); Node not run yet

## Pointers
Brief: project-memory/BRIEF.md · PRD: project-memory/PRD.md · Architecture: project-memory/ARCHITECTURE.md · Spec: project-memory/features/001-metrics-and-scores/spec.md · Flags: project-memory/FLAG_RULES.md · Tasks: project-memory/tasks.md · Risks: project-memory/RISKS.md
Decisions: project-memory/decisions/
Principles: project-memory/PRINCIPLES.md
Handbook: VIBEOS repo (personal machine `C:\Users\1\Desktop\vibeos`; company laptop `Desktop\VIBEOS_PROJECT\VIBEOS`); pilot metrics in 09_PILOTS/PILOT-01-fin-health-check/METRICS.md
