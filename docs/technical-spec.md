# Technical specification

## Product thesis

An AI agent and a human operator can safely co-operate on a live visual digital twin when WebMCP supplies semantic actions and the page owns state, validation, and consent.

The minimum product is one seeded outage. Main feeder F1 is faulted; S3 must remain open. Solar, generator, and battery can restore hospital, shelter, water pump, and homes. Hospital and shelter begin critical. A coverage candidate restores more load but violates the 25% battery floor; a resilient candidate restores the two initial critical loads with 27% reserve. If the human marks the water pump critical, the old draft becomes stale and a revised candidate restores all three critical services with 26% reserve.

## Shared state machine

```text
incident_loaded → candidates_ready → draft_ready → approval_ready
       ↑                                  │              │
       └──── human priority edit ─────────┘              │ page click
                                                        ↓
                                                   authorized → completed
```

Every domain-changing action increments `stateVersion`. A mutating tool must provide its expected version and fails with `stale_state` on mismatch. Simulated candidates are derived from a source version. A draft stores a stable hash across operations, priorities, and reserve target.

Preparation exposes exact operations but creates no grant. The human button creates a 60-second internal grant bound to draft ID, hash, and state version. The execution tool accepts only the draft ID and an idempotency key. It cannot receive or mint approval. Any priority change clears the grant. Execution consumes it and creates one receipt; a retry with the same key returns that receipt.

## Tool-result envelope

Every tool returns:

```json
{
  "ok": true,
  "data": {},
  "stateVersion": 4,
  "uiChanged": true,
  "validNextActions": ["prepare_simulated_execution"],
  "error": null
}
```

Known errors are `stale_state`, `invalid_sequence`, `fault_energization`, `reserve_below_minimum`, `approval_required`, `approval_expired`, and idempotency/input errors. Error messages tell the agent how to retry without relaxing policy.

## WebMCP architecture

- `src/grid-core.mjs` is the only business-rule authority.
- `src/app.mjs` routes human UI through that same engine and renders after every mutation.
- `src/webmcp.mjs` wraps the engine in nine typed imperative tools.
- Registration occurs from the top-level page with `document.modelContext` and the older `navigator.modelContext` fallback.
- `registerTool` is awaited and receives a registration-lifecycle signal.
- Each callback accepts its independent execution signal and checks cancellation before and after work.
- Tool results are returned only after synchronous UI rendering.
- The no-WebMCP path stays fully usable for judges and accessibility review.

## What WebMCP unlocks

The semantic tool path is materially different from browser automation. Stable IDs replace coordinates; safety outcomes come from the page engine; tools report live version preconditions; the agent can compose read, compute, preview, and prepare actions; and visible human approval cannot be bypassed by more prompting.

## Explicit cuts

No live utility APIs, optimization solver, authentication, backend, database, real switching, or claim of operational safety. Those exclusions keep the demo honest, deterministic, and judgeable in under three minutes.
