# Demo script — 2:35 target

This is the recording control sheet. Keep the final public YouTube video below 3:00 and include audible narration. Record at 1080p with browser zoom around 90–100%. Never claim native WebMCP passed unless the Site tools history is visible in the captured run.

## Preflight

1. Open the deployed HTTPS app in the OpenAI Codex desktop built-in browser with site tools enabled.
2. Reset incident. Confirm hospital and shelter are critical, water is normal, state is v1, and no receipt exists.
3. Confirm all nine tools appear in Available site tools.
4. Keep the app, Codex conversation, and Recently used tools easy to reveal.
5. Have `npm test` already completed successfully in a terminal tab.

## Recording sequence

### 0:00–0:15 — Hook

Show the dark topology and faulted F1. Say: “A browser agent sees an SVG. It does not inherently know which switch isolates a fault or what closing it would do. Islanding exposes that live domain state through WebMCP.”

### 0:15–0:48 — Semantic plan and visible comparison

Human prompt:

> Use the site tools on this page. Restore the hospital and shelter without energizing the fault, keep at least 25% battery reserve, compare two plans, and put the better plan in preview. Do not execute anything.

Expected route: `get_incident_state` → `get_topology` → `simulate_restoration_plan` twice → `compare_plans` → `set_draft_plan` → `validate_draft_plan`.

Show the blocked coverage candidate, valid resilient candidate, amber topology preview, and agent-attributed ledger events.

### 0:48–1:18 — Real human-agent collaboration

Click **Water pump → Critical** in the normal UI. Prompt:

> I changed the water pump to critical in the page. Revalidate and update the plan so all three critical loads are restored while preserving the fault and reserve constraints.

Show the stale old draft and revised critical-services preview with 26% reserve. Emphasize that the human UI edit, not a new hidden prompt parameter, changed the shared state.

### 1:18–1:55 — Trust boundary

Prompt:

> Prepare the exact simulated switching sequence, but do not execute unless I approve that exact draft in the page.

Reveal the review drawer. If useful, ask “Execute now” once before clicking approval and show `approval_required`. Explain that no approval token is exposed to the model.

Press **Authorize this simulation**. Then prompt:

> I approved the exact draft. Execute it once and summarize the receipt.

Show hospital, shelter, and water turning green in order, S3 remaining open, the consumed approval, and receipt R-104.

### 1:55–2:15 — Reliability evidence

Show the tool history and ledger. Retry with the same idempotency key and show it returns the original receipt. Briefly reveal the successful automated tests.

### 2:15–2:35 — Close

Say: “The operator contributes priorities and exact consent; the agent contributes constrained exploration; the page owns safety and truth. This is synthetic training, not operational grid software—but the WebMCP pattern applies to consequential professional workflows.”

End on the restored topology and repository URL.
