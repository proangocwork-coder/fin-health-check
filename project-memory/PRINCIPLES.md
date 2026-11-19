# Principles: Financial Health Check (internal)

## Tier (G0, approved 2026-11-19, D-001)
Tier: T1 · Reason: highest answer decides (FD-03 §4.2)

| Question | Answer | Tier |
|---|---|---|
| Who uses it? | Only the Owner | T1 |
| What data? | Public financial statements of listed companies, or invented data | T1 |
| Money involved? | No | T1 |
| If it breaks or loses data? | Owner inconvenienced; data re-enterable from public sources | T1 |
| Who can reach it? | Only on the Owner's machine | T1 |

## Non-negotiables
- No client financial statements in this version or in the repository; using them triggers a tier review (FD-03 §8.1).
- Scores and flags are warning signals, not verdicts and not buy/sell advice; every output states which rule and which numbers produced it.
- No hosting, no paid service, no login (VIBEOS boundaries).

## Environment (observed 2026-11-19)
- Personal machine: Windows 10 Pro 10.0.19045 · Git 2.54.0 (credential.helper=manager) · Node.js 24.16.0
- Company laptop: Windows 11 Pro · Git portable 2.56.1 (repo-level `credential.helper` reset then `manager`) · no Node.js · Microsoft Edge
- No command sandbox on native Windows (S-034): known gap, accepted at T1 (D-001).

## Version control (EN-08)
- Remote: private GitHub repository `fin-health-check` (approved D-001; created by the Owner 2026-11-19: https://github.com/proangocwork-coder/fin-health-check) · Messages: Conventional Commits
- Branching (G3, 2026-11-19, RECOMMEND): T1, one person → commit straight to `main`, one commit per verified task (`feat:`, `fix:`, `test:`, `docs:`); no pull requests. Version scheme: 0.x until the Owner accepts at T-013.

## Conventions (G3, 2026-11-19)
- Layout: `index.html` (app) · `src/` calculation files, plain scripts, no UI code, no network calls · `tests/` test files `*.test.js` and `harness.js` · `tests.html` (runs all tests in a browser) · `tools/` helper commands · `data/` the Owner's own company files, never committed.
- Plain JavaScript as classic scripts (pages opened from a file cannot load modules, D-003). Each `src` file attaches to the global `FHC` object and also exports itself for Node.
- No external libraries or downloads in the app or the tests.
- Verify command: personal machine `node --test` (Node.js 24); company laptop `tools\verify-browser.cmd` (Microsoft Edge, headless). Both run the same test files; a task is verified only when the command run on that machine passes.
- Numbers: store in the unit entered plus the unit; compute in đồng; missing is `null`, never 0.

## Memory layout
Directory: project-memory/ (default) · Deviations: none
