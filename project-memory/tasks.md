# Tasks: Financial Health Check (internal) — MVP

Route: R3 (new product) · Tier: T1 · Planned at G3, 2026-11-19 · Sources: PRD 0.2, spec 001 0.3, D-003, D-004

| ID | Task | Serves | Size (est → actual) | Depends | State | Evidence |
|---|---|---|---|---|---|---|
| T-001 | Setup: ignore file, folder layout, README, test runner that works in a browser page and in `node --test`, one empty test passing | G3 | M → M | — | done | `tools\verify-browser.cmd` on the company laptop: RESULT: PASS 2/2, exit 0; deliberately broken test gave FAIL 1/2, exit 1 (2026-11-19). `node --test` not yet run (no Node.js on the laptop): first step of the next session on the personal machine |
| T-002 | Line catalogue TT200 / TT99: name + code per template, default template by fiscal year, matching pasted rows by name | REQ-002 AC-002.1–3; AC-001.3 (matching part) | M → | T-001 | todo | |
| T-003 | Input checks: assets = resources, sub-lines sum to group, positive allowance warning, PBT B02 = B03 | REQ-003 AC-003.1–4 | M → | T-002 | todo | |
| T-004 | Ratio table calculation with "Không tính được" handling | REQ-004 AC-004.1–2; spec §2 | M → | T-002 | todo | |
| T-005 [P] | Altman Z' / Z'' by company type, zones, "Không áp dụng" for financial firms | REQ-005 AC-005.1–2; spec §3 | S → | T-004 | todo | |
| T-006 [P] | Beneish M with the 8 sub-indices | REQ-006 AC-006.1–2; spec §4 | M → | T-004 | todo | |
| T-007 [P] | Piotroski F with per-criterion pass / fail / not computable | REQ-007 AC-007.1; spec §5 | M → | T-004 | todo | |
| T-008 | Flag engine F01–F18 with reason line (rule, numbers, years, threshold); audit opinion input drives F18 | REQ-008 AC-008.1–2; REQ-010 AC-010.1; FLAG_RULES 0.2 | L → | T-004, T-005, T-006, T-007 | todo | |
| T-009 | Entry page: type or paste per year, unit choice, empty ≠ 0, template per year, company type, audit opinion | REQ-001 AC-001.3–5; AC-002.1; REQ-010 | L → | T-002, T-003 | todo | |
| T-010 | Save to file / open file (`.json` with schema version and checks), automatic browser draft, "unsaved changes" banner | REQ-001 AC-001.1–2; NFR-003; D-004 | M → | T-009 | todo | |
| T-011 | Results page: ratios, Z/M/F, flags with reasons, red/yellow counts, industry notes, disclaimer, click a number to see its formula; test that the code makes no network calls | REQ-004 AC-004.3; REQ-008 AC-008.3–4; D-002 Q4; ARCHITECTURE "Security risks" | M → | T-008, T-009 | todo | |
| T-012 | Print layout A4 portrait | REQ-009 AC-009.1 | S → | T-011 | todo | |
| T-013 | Owner acceptance: enter PHP, VIC, HPG (2 years each) from audited reports; compare with Owner's Excel; time one entry | NFR-001, NFR-002; BRIEF success 1–3 | M → | T-012; Owner's Excel | waiting_owner (Owner's Excel) | |

Order: T-001 → T-002 → T-003 / T-004 → T-005, T-006, T-007 (any order) → T-008 → T-009 → T-010 → T-011 → T-012 → T-013. Riskiest first after setup: T-002 (template mapping) because a wrong mapping silently corrupts every number.

**Estimate** [ASSUMPTION, PD-04 buffer 30–50%]: 2 S + 9 M + 2 L. If one session completes about two S/M tasks or one L task, the build needs about 6 sessions, 8–9 with buffer. This is larger than the BRIEF guess (2–4 build sessions); the gap comes from REQ-002 and REQ-003, added at G1 after the data test.

**Definition of done for every task** (canonical → QA-02 §4.1): criteria pass with evidence at the tier's V-level (AI-07 §4.1); tests per QA-01, seen failing first; full verify command passes; diff contains only intended changes, self-reviewed; tasks, STATE and LOG updated and committed with the work.

## Criterion → test map (T1)
| Criterion | Test name(s) or `manual` (steps, reason) |
|---|---|
| AC-001.1 | `AC-001.1 saved company reopens with the same numbers` (save/load round trip on the data format); manual: save, close, reopen in the browser |
| AC-001.2 | `AC-001.2 opening-balance-only year counts as a balance-sheet year` |
| AC-001.3 | `AC-001.3 pasted rows match by line name; unknown rows listed` |
| AC-001.4 | `AC-001.4 unit conversion dong/trieu/ty` |
| AC-001.5 | `AC-001.5 empty cell is missing, "-" is zero` |
| AC-002.1 | `AC-002.1 FY2025 defaults to TT200, FY2026 to TT99` |
| AC-002.2 | `AC-002.2 interest uses TT200 code 23 and TT99 code 24, never TT99 code 23` |
| AC-002.3 | `AC-002.3 TT99-only lines add into their group total` |
| AC-003.1–4 | `AC-003.1 assets vs resources mismatch 22.38` · `AC-003.2 sub-lines vs group` · `AC-003.3 positive allowance warning` · `AC-003.4 PBT B02 vs B03` |
| AC-004.1–2 | `AC-004.1 HPG 2025 current ratio 1.10` · `AC-004.2 zero or missing denominator` |
| AC-004.3 | manual (click a ratio; formula and inputs shown) — needs the page |
| AC-005.1–2 | `AC-005.1 Z' for manufacturer, Z'' otherwise, zones` · `AC-005.2 financial firm not applicable` |
| AC-006.1–2 | `AC-006.1 one year only needs 2 years` · `AC-006.2 eight sub-indices returned` |
| AC-007.1 | `AC-007.1 missing criterion counted as not computable` |
| AC-008.1–2 | `AC-008.1 F01 yellow with reason line for HPG 2025` · `AC-008.2 missing data flag says not computable` |
| AC-008.3–4 | `AC-008.3 industry note attached to related flags` · manual: disclaimer visible on screen and print |
| AC-009.1 | manual (print preview A4 portrait, no cut columns) |
| AC-010.1 | `AC-010.1 qualified opinion turns F18 red; unset is not computable` |
| NFR-001 | manual (T-013, compare with Owner's Excel, tolerance 0.01) |
| NFR-002 | manual (T-013, stopwatch) |

## Defects
| ID | Severity | Criterion affected | How found | Date | State |
|---|---|---|---|---|---|
