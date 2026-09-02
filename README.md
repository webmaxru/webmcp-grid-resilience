# Islanding — WebMCP Grid Resilience Lab

Islanding is a deterministic, synthetic microgrid-restoration training simulator. It shows what becomes possible when an AI agent can use semantic website tools instead of guessing at switches in an SVG diagram.

An operator sets safety priorities in the normal UI. A WebMCP-capable agent reads exact topology and transient state, simulates alternatives, compares trade-offs, places a plan in visible preview, detects human changes, and prepares an exact switching sequence. Execution remains blocked until the human authorizes that exact draft using a normal page button. The private page-held grant is consumed once and the app produces an attributable receipt.

> **Safety boundary:** This is a mocked design prototype for training and WebMCP evaluation. It does not connect to utility equipment, issue real switching commands, or claim operational certification.

## Why WebMCP

A browser agent cannot safely infer feeder identity, interlocks, reserve constraints, and changing priorities from pixels or DOM coordinates. Islanding exposes nine imperative tools from the top-level document, all backed by the same deterministic engine as the visible human UI:

| Tool | Purpose |
|---|---|
| `get_incident_state` | Read fault, resources, priorities, phase, and version |
| `get_topology` | Read stable node/switch IDs and safety constraints |
| `simulate_restoration_plan` | Compute a candidate without execution |
| `compare_plans` | Rank two candidates by derived outcomes |
| `set_draft_plan` | Put one valid candidate into visible preview |
| `validate_draft_plan` | Fail closed when human state has changed |
| `prepare_simulated_execution` | Populate the exact human review |
| `execute_approved_simulation` | Consume page-held approval and execute once |
| `get_execution_receipt` | Read attributable outcome evidence |

The integration uses `const modelContext = document.modelContext || navigator.modelContext`, awaits every `registerTool`, passes an `AbortController` signal for registration lifecycle, accepts per-call execution signals, uses JSON schemas and read-only annotations, and validates domain rules in code.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm start
```

Open [http://localhost:4173](http://localhost:4173). The complete human workflow works in any modern browser. Native WebMCP discovery requires the supported Codex desktop/browser preview and site tools enabled.

Run the deterministic suite:

```bash
npm test
```

No package installation, API key, account, backend, build step, or network data is required.

## Golden demo

1. Ask the agent to restore hospital and shelter, isolate the fault, keep 25% reserve, compare two plans, and preview the best without execution.
2. In the page, change **Water pump** from Normal to Critical.
3. Ask the agent to revalidate. Its old version fails stale; it re-reads and prepares a revised critical-services plan.
4. Ask it to prepare execution. An attempted execute remains blocked with `approval_required`.
5. Press **Authorize this simulation** in the page, then ask the agent to execute once and retrieve the receipt.
6. Retry with the same idempotency key: the original receipt returns and no operation repeats.

Exact prompts and evidence requirements are in [`demo/demo-script.md`](demo/demo-script.md). The implementation rationale is in [`docs/technical-spec.md`](docs/technical-spec.md).

## Repository map

```text
index.html                  accessible single-page simulator
styles.css                 responsive visual design
src/grid-core.mjs          versioned domain, approval, idempotency, receipts
src/webmcp.mjs             nine tool schemas and lifecycle registration
src/app.mjs                shared UI and WebMCP wiring
test/                      deterministic domain and fake-modelContext tests
demo/                      script, transcript, shot list, evidence checklist
devpost-submission.md      ready-to-paste submission copy
RULES-VALIDATION.md        requirements and honest blockers
```

## Deployment

The project is static and can be hosted on GitHub Pages without a build. The live URL is recorded in `RULES-VALIDATION.md` once deployment is confirmed. Keep it accessible for the full judging period.

## License and security

[MIT](LICENSE). See [SECURITY.md](SECURITY.md) for limitations and disclosure guidance.
