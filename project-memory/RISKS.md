# Risks: Financial Health Check (internal)

Last reviewed: 2026-11-19 at G3; PR-08, PR-09 updated 2026-11-19 (D-005)

| ID | Risk | Likelihood (L/M/H) | Impact (L/M/H) | Action | Trigger to review | Status |
|---|---|---|---|---|---|---|
| PR-01 | Entering 3 statements × 2 years takes the Owner more than 20 minutes, so the tool is not used (BRIEF riskiest assumption) | M | H | watch: paste by line name (AC-001.3) to reduce typing; measure with a stopwatch at T-013 | T-009 done; T-013 | open |
| PR-02 | TT99 line codes taken from an unofficial copy of Phụ lục IV (expertis.vn) are wrong | L | H | reduce: match by line name first, code second (REQ-002); check against the first real FY2026 annual report | first FY2026 report entered | open |
| PR-03 | Numbers copied from public data sites are shifted or mislabelled (seen on CafeF, HPG) | H | H | reduce: input checks (REQ-003); Owner's reference Excel built from audited PDFs | every T-013 entry | open |
| PR-04 | Automated tests cannot run on the company laptop (no Node.js) | H | M | reduce: tests also run in a browser page; on the laptop via Edge headless (`tools\verify-browser.cmd`); `node --test` on the personal machine | each verify on the laptop | open |
| PR-05 | Owner forgets "Lưu ra file" and loses entries | M | L | reduce: browser draft + unsaved banner (T-010); data is public and re-enterable | T-010 done | open |
| PR-06 | Z, M, F (built on US data) read as verdicts on Vietnamese firms | M | M | reduce: disclaimer and industry notes on every result (AC-008.3–4) | T-011 done | open |
| PR-07 | Usage limit of the Claude plan reached mid-task | M | L | watch: one task per checkpoint; tasks sized for one session | any session stopped by the limit | open |
| PR-08 | Owner's reference Excel for PHP, VIC, HPG not ready when the build ends | M | M | watch: ask at T-008; T-013 stays `waiting_owner` until it exists | T-012 done | closed (2026-11-19, D-005: agent builds the reference) |
| PR-09 | The reference check (T-014) and the app share the same misreading of a formula, so a wrong number passes (D-005) | M | H | reduce: T-014 in a separate session that does not read `src/`; formulas taken from the original papers, not from the app; Owner spot-checks 5 numbers against the PDFs | T-014 done | open |
