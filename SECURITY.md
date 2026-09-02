# Security and limitations

## Scope

Islanding is a synthetic browser-only training prototype. All incident data, topology, outcomes, and receipts are mocked in memory. It has no authentication, persistence, telemetry, backend, utility connection, or real equipment-control capability.

Do not use this project for operational grid decisions, emergency response, safety certification, or control of physical infrastructure.

## Intentional safety properties

- Fault isolation, reserve, critical-load coverage, operation order, state version, approval binding, expiry, and idempotency are validated in the domain engine, not trusted from tool inputs.
- The human approval secret is generated and retained inside page state. It is not a WebMCP parameter or tool result.
- Any priority change revokes approval and makes an existing draft stale.
- `CLOSE_S3` fails closed while feeder F1 is faulted.
- Every UI/tool action is visible in the local activity ledger.
- Tool registration is scoped to the page lifecycle with an `AbortController`.

## Prototype limitations

- In-memory state disappears on reload.
- Approval is local proof of a page click, not identity or cryptographic authorization.
- The deterministic mock is not a power-flow solver and models no voltage, frequency, protection, or transient behavior.
- The UI ledger is evidence for the demo, not an immutable audit log.
- Native WebMCP remains browser-preview dependent.

## Reporting

Please report a vulnerability privately to the repository owner before publishing details. Include reproduction steps, browser version, and whether native WebMCP was enabled. Do not submit real infrastructure data.
