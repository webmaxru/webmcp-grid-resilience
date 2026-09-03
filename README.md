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

The integration uses `const modelContext = document.modelContext || navigator.modelContext`, awaits every `registerTool` inside `try`/`catch`, passes an `AbortController` signal for registration lifecycle, accepts per-call execution signals, validates JSON-schema constraints again at runtime, and returns only after the shared UI state is current. Calls that complete a domain operation record visible activity, while malformed or rejected inputs fail before ledger mutation; because successful reads are still observable and simulations create candidates, none is advertised as read-only.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm start
```

Open [http://localhost:4173](http://localhost:4173). The complete human workflow works in any modern browser. For challenge testing, native WebMCP requires the ChatGPT desktop in-app browser or Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled. The public app is HTTPS and loopback localhost is treated as trustworthy; WebMCP is not available in workers or headless execution.

Run the deterministic suite:

```bash
npm test
```

No package installation, API key, account, backend, build step, or network data is required.

## Golden demo

Three prompts and two human clicks, in this order:

1. Ask the agent to restore the critical loads without energizing the fault, hold 25% reserve, compare a maximum-coverage option against a safer one, preview the better plan, prepare the exact sequence, and then attempt execution. The coverage plan is blocked at 18% reserve, the resilient plan previews at 27%, and the execution attempt returns `approval_required`.
2. In the page, change **Water pump** from Normal to Critical. The state version advances, the draft goes stale, and any approval is revoked.
3. Ask the agent to revalidate and re-plan. It receives `stale_state`, re-reads your priority, and prepares a critical-services plan at 26% reserve.
4. Press **Authorize this simulation** in the page. The grant is page-held, bound to the exact draft hash, and valid for 60 seconds.
5. Ask the agent to execute once, retry the same idempotency key, and read the receipt: three loads restored, S3 still open, one receipt (`R-104`), no second execution.

Exact prompts and evidence requirements are in [`demo/demo-script.md`](demo/demo-script.md). The implementation rationale is in [`docs/technical-spec.md`](docs/technical-spec.md).

For the public video upload, use the exact-master sidecar captions at `demo/demo-captions.srt`. They are generated against the finished video timing and should not be manually retimed or burned into the product screenshots.

## Repository map

```text
index.html                  accessible single-page simulator
styles.css                 responsive visual design
src/grid-core.mjs          versioned domain, approval, idempotency, receipts
src/webmcp.mjs             nine tool schemas and lifecycle registration
src/app.mjs                shared UI and WebMCP wiring
test/                      deterministic domain and fake-modelContext tests
demo/                      script, transcript, shot list, evidence checklist
submission-assets/         tracked Devpost screenshots and accessible social card
devpost-submission.md      ready-to-paste submission copy
RULES-VALIDATION.md        requirements and honest blockers
```

The intended gallery order, captions, and alt text are documented in [`submission-assets/README.md`](submission-assets/README.md).

## Deployment

The project is deployed without a build at [https://webmaxru.github.io/webmcp-grid-resilience/](https://webmaxru.github.io/webmcp-grid-resilience/), with public source at [github.com/webmaxru/webmcp-grid-resilience](https://github.com/webmaxru/webmcp-grid-resilience). The live app must remain free, publicly accessible, and unrestricted through September 21, 2026 at 5:00 pm PT.

## Challenge provenance

Repository history starts with the initial app build on September 2, 2026. This is a new challenge project, not a WebMCP layer added to a pre-existing application. It remains substantially distinct from PlateWeave: this repository models safety-gated infrastructure restoration, versioned switching plans, and one-time execution receipts rather than laboratory spatial allocation and CSV export.

## License and security

[MIT](LICENSE). See [SECURITY.md](SECURITY.md) for limitations and disclosure guidance.
