# Devpost submission package

## Project title

**Islanding — Human-guided grid restoration with WebMCP**

## Tagline

A human sets safety priorities; an AI agent explores restoration plans; the page enforces exact approval before a synthetic switch is touched.

## Links

- Repository: `https://github.com/webmaxru/webmcp-grid-resilience`
- Live app: `https://webmaxru.github.io/webmcp-grid-resilience/`
- Public YouTube demo: **BLOCKER — add verified public URL, under 3 minutes with audio**

## Inspiration

A grid diagram is readable to an operator but dangerously ambiguous to a general browser agent. The same switch icon can hide a fault interlock, transient state, capacity limit, and sequence dependency. Clicking the right-looking SVG control is not the same as understanding whether a plan is safe.

We wanted to show WebMCP at its strongest: not as a faster form filler, but as the semantic control plane for a live professional digital twin. The human should contribute priorities and consent. The agent should contribute rapid constrained exploration. The page should remain the authority for rules, state, and consequences.

## What it does

Islanding opens on a seeded storm outage. Feeder F1 is faulted; hospital and shelter are critical; battery reserve must stay above 25%.

An agent uses nine page-hosted WebMCP tools to read exact incident state and topology, simulate two deterministic switching plans, compare their derived trade-offs, and put the best into visible preview. The operator then marks the water pump critical in the normal UI. That page edit increments the state version, invalidates the old draft, and revokes any approval. The agent sees a structured `stale_state`, re-reads the human choice, and computes a revised plan.

The agent can prepare the exact sequence but cannot approve it. A normal page button creates a short-lived internal grant bound to the current draft hash and version. The grant never enters model context. Only then can the agent execute the synthetic sequence once. Retrying the same idempotency key returns the original receipt, not a second execution.

The topology visibly restores hospital, shelter, and water pump while the fault stays isolated. The receipt records human approval, exact draft hash, operations, before/after state versions, and final reserve.

## How we used WebMCP

The top-level document registers nine imperative tools through `document.modelContext`, with the deprecated `navigator.modelContext` only as a compatibility fallback:

- semantic reads: incident state and topology;
- compute: plan simulation and comparison;
- reversible collaboration: draft preview and current-state validation;
- trust boundary: exact preparation, page-held human authorization, idempotent execution;
- evidence: attributable execution receipt.

Every `registerTool` is awaited, has a JSON Schema and explicit description, and is tied to an `AbortController` lifecycle. Read-only tools are annotated. Each execute callback accepts the browser's independent cancellation signal. Tool inputs never supply safety outcomes; the deterministic page engine derives them. Mutating actions use expected versions and fail closed with corrective structured errors.

Most importantly, the tools update the same visible UI a human uses. WebMCP does not create a hidden agent-only workflow.

## How it improves the user experience

Without WebMCP, an agent must interpret SVG positions and click tiny controls while guessing at hidden constraints. With WebMCP, it can say exactly which stable operation it wants to simulate and receive exact consequences. The operator sees both alternatives, the winning preview, the stale-state correction after their own edit, and the final receipt.

The result is faster than manual trial-and-error, more legible than autonomous clicking, and safer than giving the model a generic “execute” control.

## A new human-agent capability

Islanding demonstrates co-operation on live shared state. The human is not reduced to writing the perfect prompt, and the agent is not reduced to driving the mouse. The person expresses contextual judgment through the interface and explicitly authorizes one exact consequence. The agent performs repetitive search, comparison, validation, and documentation. The website arbitrates both.

That pattern can extend to infrastructure training, industrial digital twins, maintenance planning, emergency exercises, and other domains where consequential actions need semantic context and visible consent.

## How we built it

The project deliberately has no framework, build step, backend, account, credentials, or live data. HTML and CSS render an accessible responsive command center. Three JavaScript modules provide a versioned domain engine, WebMCP contracts/registration, and UI wiring. A Node static server runs it locally.

The mocked engine includes topology, priorities, deterministic candidate metrics, fault isolation, reserve rules, draft hashes, stale-state detection, 60-second page-held grants, approval revocation, idempotency, and receipts. Node's built-in test runner exercises the complete workflow and uses a fake `modelContext` to verify all registrations, schemas, annotations, lifecycle cleanup, and cancellation behavior.

## Challenges we ran into

The hardest design decision was consent. An imperative WebMCP execute callback should not pretend it can securely ask the model for human approval, nor should a secret token be handed back to the model. We split preparation from execution and made authorization an ordinary visible page action. The execution tool can only ask the page whether its private grant matches the exact draft and current version.

We also kept “simulation” honest. A tempting higher-coverage plan violates reserve; an unsafe S3 close energizes the fault; changing human priorities invalidates the previous plan. These are business-engine results, not claims generated by the agent.

## Accomplishments that we're proud of

- WebMCP is indispensable to the experience rather than bolted on.
- Human and agent paths use the same domain engine and visible state.
- The golden demo contains a genuine collaboration beat, a trust beat, and an attributable receipt.
- Unsafe, stale, unapproved, expired, and duplicate paths fail closed.
- The entire project remains tiny, deterministic, dependency-free, and easy for judges to run.

## What we learned

Semantic tools are only part of agent readiness. A useful site also needs explicit versions, composable state transitions, corrective errors, visible effects, and a clear boundary between what the model can request and what the human must authorize.

WebMCP turns the page from a picture an agent operates into a participant in the interaction. The most compelling agent experiences come from designing that shared contract alongside the human workflow.

## What's next

Next steps would add a real optimization solver behind the same interface, multiple training incidents, richer electrical constraints, immutable exported evidence, and authenticated instructor/operator roles. Any real infrastructure integration would require an entirely separate safety, security, regulatory, and operational program; this prototype intentionally makes no such claim.

## Agents/clients tested

- Deterministic fake `ModelContext` harness: **passed** registration and execution contract tests.
- Standard human browser path: **locally testable without WebMCP**.
- OpenAI Codex desktop built-in browser with native site tools: **acceptance script prepared; do not mark passed until recorded on a supported client**.

## AI tools used

- OpenAI Codex for research synthesis, implementation, tests, documentation, and submission preparation.
- `webmcp` skill from `webmaxru/web-ai-agent-skills` for current API, compatibility, lifecycle, and validation guidance.

## Built with

WebMCP, JavaScript, HTML, CSS, SVG, Node.js test runner, GitHub, GitHub Pages.
