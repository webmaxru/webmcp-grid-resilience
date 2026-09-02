# Voiceover transcript — approximately 2:30

This microgrid has lost its main feeder in a storm. A person can read the diagram, but a general browser agent only sees an SVG and controls. It does not inherently know that S3 isolates the fault, which loads are critical, or how a switching sequence changes battery reserve.

Islanding makes those semantics available as nine WebMCP tools. I ask the agent to restore the hospital and shelter, keep at least twenty-five percent reserve, compare two plans, and only preview the best.

The agent reads the exact incident version and topology. It simulates a coverage plan and a resilient plan through the page's own deterministic engine. The first restores more total load but violates the reserve floor. The second keeps the fault isolated and ends at twenty-seven percent. It appears here in amber as a reversible preview. No switching has run.

Now I use the normal website, not the chat, to mark the water pump critical. That human edit advances the shared state and invalidates the old draft. When the agent revalidates, the page returns a structured stale-state error. The agent re-reads my priority and prepares a new plan restoring all three critical services with twenty-six percent reserve.

This is the trust boundary. The agent can place the exact operations in this review, but it cannot authorize them. If it asks to execute now, the page returns approval required and nothing changes.

I inspect the sequence and press Authorize this simulation. The page creates a short-lived internal grant bound to this draft hash and version. That secret is never a tool input or result.

Now the agent executes the approved simulation once. The hospital, shelter, and water pump restore; S3 remains open; and receipt R-one-oh-four records the human approval, exact operations, versions, and outcome. A retry with the same idempotency key returns this receipt without executing twice.

The human contributes priorities and exact consent. The agent contributes rapid constrained exploration. The website owns rules, state, and visible evidence. This is a synthetic training prototype, not operational utility software—but it demonstrates how WebMCP can support consequential professional workflows without reducing collaboration to fragile screen clicking.
