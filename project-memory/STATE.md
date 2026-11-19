# State

Updated: 2026-11-19 by WP-07 session 4 (VIBEOS, company laptop) · Checkpoint: CP-20261119-13
Tier: T1 · Stage: Development (G4 loop) · Last gate passed: G3 (2026-11-19, agent-confirmed) · G2 (2026-11-19, D-003, D-004)

## Now
T-001 to T-007 done. T-005 `src/altman.js` (Z' / Z'' by company type, zones; HPG 2025 Z' ≈ 1,49 grey). T-006 `src/beneish.js` (8 indices, needs 2 years). T-007 `src/piotroski.js` (9 criteria, "x/n tiêu chí tính được" when some are missing, zero denominators reported as not computable). Short line names moved to `FHC.lines.label` (shared). T-004: `src/ratios.js`, 21 ratios per year with formula text, inputs, "Không tính được" / "Không áp dụng" reasons, averages from opening and closing balances (year-end with a note in the first year); HPG 2025 values match the G1 hand test. T-003: `src/checks.js` (assets vs resources marks the year "số chưa cân"; group sums from the catalogue; pasted B01 sub-lines vs their group by numbering level; positive asset allowance warning; PBT B02 vs B03) and `src/format.js` (Vietnamese number style). Browser verify PASS 47/47 on the laptop. No task in progress.

## Next
1. On the personal machine, first step: `node --test` must pass 47/47 (the Node path of the harness is still untested). If it fails, fix the harness before anything else.
2. T-008 flag engine F01–F18 (L): uses ratios, Z, M, F and the audit opinion.
3. D-005 (2026-11-19, Owner: "m tự làm kiểm tra đi"): the agent builds the reference check (new T-014) in a separate session that does not read `src/`; T-013 compares the app with it, the Owner spot-checks 5 numbers and still times one entry (NFR-002).
3. Ask the Owner at T-008 whether the reference Excel for PHP, VIC, HPG is under way (PR-08).

## Waiting on Owner
- Nothing blocking. At T-013: spot-check 5 reference numbers against the PDFs and time one entry with a stopwatch (NFR-002).

## Known issues
- The built-in browser pane is not signed in to GitHub; repository-level actions on GitHub are done by the Owner.
- Company laptop has no Node.js; it verifies with `tools\verify-browser.cmd` (Edge headless). The browser pane of Claude cannot open `file://` pages, so UI checks there are done by the Owner.

## Verify
Command: `node --test` (personal machine) · `tools\verify-browser.cmd` (laptop) · Last result: laptop browser PASS 47/47 (2026-11-19, after T-007); Node not run yet

## Pointers
Brief: project-memory/BRIEF.md · PRD: project-memory/PRD.md · Architecture: project-memory/ARCHITECTURE.md · Spec: project-memory/features/001-metrics-and-scores/spec.md · Flags: project-memory/FLAG_RULES.md · Tasks: project-memory/tasks.md · Risks: project-memory/RISKS.md
Decisions: project-memory/decisions/
Principles: project-memory/PRINCIPLES.md
Handbook: VIBEOS repo (personal machine `C:\Users\1\Desktop\vibeos`; company laptop `Desktop\VIBEOS_PROJECT\VIBEOS`); pilot metrics in 09_PILOTS/PILOT-01-fin-health-check/METRICS.md
