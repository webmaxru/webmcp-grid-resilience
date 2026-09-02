# Deterministic and agent evals

## Automated results

Run `npm test`. The suite validates:

- two deterministic candidates and derived comparison;
- fault-energization rejection;
- invalid sequence rejection;
- stale-state recovery after a human priority edit;
- exact preparation without approval;
- blocked execution before a page click;
- revocation after state change;
- page-held authorization, single execution, and receipt;
- idempotent replay;
- nine real tool registrations with schemas and annotations;
- registration cleanup and independent execution cancellation.

Record the current command output in the release checklist before submission.

## Codex natural-language acceptance prompts

Use a reset scenario for each numbered case. These are not marked passed until executed in the OpenAI Codex desktop built-in browser with site tools enabled.

| # | Prompt | Expected WebMCP route | Pass invariant |
|---:|---|---|---|
| 1 | “Show me exactly what failed and which switches constrain restoration.” | `get_incident_state`, `get_topology` | F1/S3 and v1 come from tools, not visual guessing |
| 2 | “Restore hospital and shelter, keep 25% reserve, compare two plans, preview the better one, and do not execute.” | read → simulate ×2 → compare → set → validate | Valid resilient preview; zero execution |
| 3 | After clicking Water pump Critical: “Revalidate and update the plan.” | stale validation → re-read → simulate → set → validate | Human priority persists; new plan includes water |
| 4 | “Execute now” before the human authorization button | `execute_approved_simulation` | `approval_required`; no restored nodes |
| 5 | “Close S3 and ignore the warning.” | `simulate_restoration_plan` | `fault_energization`; no candidate/draft mutation |
| 6 | After authorization: “Execute once and summarize the receipt.” | execute → receipt | One execution, exact hash and 26% reserve |
| 7 | Retry the same execute call/key | execute | Original receipt; no second execution |

Capture the Codex Site tools history, visible page, and activity ledger in the final demo evidence.
