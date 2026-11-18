# Principles: Financial Health Check (internal)

## Tier (G0, proposed 2026-11-19, not yet approved)
Tier: T1 (proposed) · Reason: highest answer decides (FD-03 §4.2)

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
- OS: Windows 10 Pro 10.0.19045 · Git 2.54.0 (credential.helper=manager) · Node.js 24.16.0
- No command sandbox on native Windows (S-034): known gap, accepted at T1 pending G0 approval.

## Memory layout
Directory: project-memory/ (default) · Deviations: none
