# State

Updated: 2026-11-19 by WP-07 session 3 (VIBEOS, company laptop) · Checkpoint: CP-20261119-06
Tier: T1 · Stage: Design · Last gate passed: G1 (2026-11-19, D-002) · **awaiting_approval: G2**

## Now
G2 package written and sent: `ARCHITECTURE.md` (proposed), D-003 platform = plain browser app opened from a file, no install, calculations in separate plain JavaScript files tested with Node's built-in test runner; D-004 data = one `.json` file per company saved/opened by the Owner, plus an automatic draft in the browser. Both APPROVAL, status proposed. No code, no dependency until approved.

## Next
1. On approval: D-003, D-004 → approved with the Owner's exact words; ARCHITECTURE status approved.
2. G3: `plan-tasks` → tasks.md, RISKS.md; .gitignore (data files out of the repo); empty project with `node --test` passing; TT99 line-code map from Phụ lục IV of the original circular.
3. Before G4: Owner's own Excel for PHP, VIC, HPG from audited reports (success measure 1, NFR-001).

## Environment note
Company laptop (Windows 11) has no Node.js (checked 2026-11-19): automated tests run on the personal machine only. G3 onwards should run there unless the Owner later approves a portable Node.js on the laptop.

## Findings this session (for PILOT-01 and the product)
- TT99/2025/TT-BTC replaces TT200 for fiscal years from 01/01/2026; FY2025 stays TT200. Line codes shift; B02 code 23 changes meaning (interest → financial expense). Sources: KPMG, MISA summaries; original text not read.
- Public data site (CafeF, HPG): misaligned rows in the TT99-layout column for 2025, two views differ by 22.38 bn at total assets, the "Q4-2025" cash-flow column is full-year. → REQ-002, REQ-003.
- Data entry time for the Owner (NFR-002, riskiest assumption) is still NOT measured: the agent pulled ~80% of FY2025 lines in ~2 minutes, which says nothing about the Owner's time.

## Waiting on Owner
- Approve G2 (D-003, D-004).
- Optional: time one manual entry of HPG 2 years with a stopwatch (NFR-002).

## Known issues
- The built-in browser pane is not signed in to GitHub; repository-level actions on GitHub are done by the Owner.
- This session ran on the company laptop (Owner's choice 2026-11-19), clone at `C:\Users\ngoc.nguyen25\Desktop\fin-health-check`. WORK_PACKAGES says WP-07 belongs on the personal machine; pull there before the next session.

## Verify
Command: none yet (set at G3) · Last result: n/a

## Pointers
Brief: project-memory/BRIEF.md · PRD: project-memory/PRD.md · Architecture: project-memory/ARCHITECTURE.md · Spec: project-memory/features/001-metrics-and-scores/spec.md · Flags: project-memory/FLAG_RULES.md
Decisions: project-memory/decisions/
Principles: project-memory/PRINCIPLES.md
Handbook: VIBEOS repo (personal machine `C:\Users\1\Desktop\vibeos`; company laptop `Desktop\VIBEOS_PROJECT\VIBEOS`); pilot metrics in 09_PILOTS/PILOT-01-fin-health-check/METRICS.md
