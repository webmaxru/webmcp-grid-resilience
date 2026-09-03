# Submission information

## Project name

**Islanding — Restore Critical Power W/o Energizing the Fault**

## Tagline

A human sets safety priorities; an AI agent explores restoration plans; the page enforces exact approval before a synthetic switch is touched.

## Links

- Repository: `https://github.com/webmaxru/webmcp-grid-resilience`
- Live app: `https://webmaxru.github.io/webmcp-grid-resilience/`
- Challenge browser: ChatGPT desktop in-app browser, or Google Chrome 149+ with `chrome://flags/#enable-webmcp-testing`
- Judge access: keep the live app free and unrestricted through September 21, 2026 at 5:00 pm PT
- Public YouTube demo: https://youtu.be/SdDKlUeFK2Y
- Caption source: `demo/demo-captions.srt`, generated against the exact final master

## YouTube title and description

**Title**

`Islanding: A Storm Took Down the Grid. Can AI Restore It Safely? | WebMCP`

**Description**

```text
A storm has taken down part of a power grid. Restoring everything quickly is easy; restoring the right loads without energizing a fault or exhausting reserve is the real problem.

In this 2:18 Codex demo, Islanding exposes nine WebMCP tools over a shared grid digital twin. Codex reads the incident, simulates competing switching plans, explains their trade-offs, and then recovers when the operator changes a critical-load priority. The page invalidates stale work and will not execute even a synthetic sequence until the human approves the exact current draft. The result is visible, attributable restoration with the fault still isolated.

This is a deterministic training prototype using synthetic infrastructure data. It does not control a real grid.

Try it: https://webmaxru.github.io/webmcp-grid-resilience/
Source: https://github.com/webmaxru/webmcp-grid-resilience

Built for the WebMCP Challenge.

#WebMCP #AIAgents #GridResilience #Codex
```

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

Every `registerTool` is awaited inside `try`/`catch`, has a JSON Schema and explicit description, and is tied to an `AbortController` lifecycle. Inputs are validated again at runtime so malformed, extra, stale, and unsafe requests receive corrective structured errors before mutation. Each execute callback accepts the browser's independent cancellation signal. Calls that complete a domain operation write to the visible activity ledger, and simulations create candidates, so none is incorrectly marked read-only. Tool inputs never supply safety outcomes; the deterministic page engine derives them.

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
- OpenAI Codex desktop in-app Browser with native site tools: **passed on the public deployment on 2026-09-02**. Exactly nine tools were discovered; successful calls included incident/topology reads, two simulations, comparison, and visible draft preview.

## AI tools used

- OpenAI Codex for research synthesis, implementation, tests, documentation, and submission preparation.
- `webmcp` skill from `webmaxru/web-ai-agent-skills` for current API, compatibility, lifecycle, and validation guidance.

## Built with

WebMCP, JavaScript, HTML, CSS, SVG, Node.js test runner, GitHub, GitHub Pages.

---

## Testing Instructions

Open https://webmaxru.github.io/webmcp-grid-resilience/ in a WebMCP-capable browser. No login, API key, account, installation, or payment is required. Use ChatGPT's desktop in-app browser, or Google Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and the browser restarted. The recorded native-client evidence is from OpenAI Codex desktop; the deterministic fake-client tests are separate evidence, not a substitute for a native browser test.

1. Press **Reset incident** to start with faulted feeder F1, hospital and shelter critical, and 55% battery reserve.
2. Ask the agent: "Feeder F1 just faulted. Use this page's tools: restore my critical loads without energizing the fault and keep battery reserve at or above 25%. Compare a maximum-coverage option against a safer one, put the better plan in preview, prepare the exact switching sequence, then try to execute it so I can see what the page does before I approve anything."
3. Check that the coverage plan is blocked at 18% reserve, the resilient plan is valid at 27%, and execution before human approval returns `approval_required` without executing.
4. In the page, change **Water pump** from Normal to Critical. Ask the agent: "I just marked the water pump critical in the page. Revalidate, re-plan around that, and prepare the exact sequence again." The old draft should fail as `stale_state`, and the revised plan should serve hospital, shelter, and water with 26% reserve.
5. Review the exact operations, then click **Authorize this simulation** yourself. Within 60 seconds, ask the agent: "Approved in the page. Execute it once, then retry with the same idempotency key, and show me the receipt."
6. Verify hospital, shelter, and water are restored, S3 remains open, and the repeated call returns the original receipt with no second execution. This is synthetic training only; no real equipment is connected.

Without a native agent, use the page's normal controls to simulate candidates, place one in preview, prepare the exact review, authorize it, and execute the approved draft. This fallback demonstrates the human interface, not native WebMCP-client execution.

For local code verification, use Node.js 20 or newer: run `npm test` for the automated suite, or `npm start` and open `http://localhost:4173`. No dependency installation is required.

## Screenshot Shot List

Four existing 1920 x 1080 PNG frames are available locally. They were referenced during preparation; none was uploaded to Devpost during this stage. Use captions that identify the app as a synthetic training simulator.

| Order | Existing file | Caption / purpose |
|---|---|---|
| 1 | `submission-assets/screenshots/01-overview.png` | Initial outage, faulted F1, S3 open, 55% battery, and nine WebMCP tools ready. |
| 2 | `submission-assets/screenshots/02-agent-tool-workflow.png` | Agent comparison of a blocked 18% reserve plan and a valid 27% reserve plan, with shared visible preview. |
| 3 | `submission-assets/screenshots/03-visible-approval.png` | Exact switching review and visible human authorization boundary. |
| 4 | `submission-assets/screenshots/04-confirmed-receipt.png` | Receipt R-104: hospital, shelter, and water restored, 26% reserve, and idempotent replay. |

The overview and receipt frames were visually inspected on 2026-09-03. They include the Codex/browser split view. For a small project thumbnail, an app-focused crop would be more legible; the full frames remain useful workflow evidence. No crop or upload was performed.

## Demo Video Outline

Existing video: https://youtu.be/SdDKlUeFK2Y. Project documentation records a 2:18 narrated final video. The older 2:35 script and shot-list timings are planning material, not the final video's duration.

- Establish the synthetic storm outage and why semantic grid state matters.
- Show WebMCP reading state, comparing reserve-constrained alternatives, and previewing an exact draft.
- Demonstrate pre-approval rejection, then the human's water-priority change and stale-state recovery.
- Show the human authorization click, one execution, and an idempotent retry returning the original receipt.
- Close on the restored critical loads, isolated fault, and prototype limitation.

## Known Limitations

- Deterministic synthetic training prototype, not a power-flow solver or operational grid-control system.
- No live utility data, equipment connection, backend, authentication, or persistence; page state disappears on reload.
- Human approval proves a local page action, not authenticated identity or cryptographic authorization.
- The visible activity ledger is demo evidence, not an immutable audit log.
- Native WebMCP support depends on the client/browser. The prior recorded native run and today's automated tests are distinct forms of evidence.
- Benefits such as faster exploration are design goals illustrated by the demo, not measured comparative performance claims.

## Submission Readiness Notes

Local preparation notes below are not intended for the public Devpost project description.

- On 2026-09-03, `npm test` passed all 7 tests with no failures. The logged `NotAllowedError: Denied for test` is an intentional negative registration test.
- On 2026-09-03, the live app returned HTTP 200, and GitHub's unauthenticated API reported a public repository with an MIT license.
- Final recheck on 2026-09-03: YouTube's watch-page metadata reports playable status OK, duration 138 seconds (2:18), two audio formats, `isPrivate: false`, and `isUnlisted: false`. The prior Unlisted visibility issue is resolved. Full narration was not listened to during this metadata check; narration evidence remains the existing project documentation.
- The participant approved the shorter title "Islanding — Restore Critical Power W/o Energizing the Fault", which is within Devpost's 60-character limit. Other project documents retain the longer descriptive title; no application or repository title was changed.
- Final local secret scan and recheck on 2026-09-03 passed: no high-confidence secret patterns, generic credential assignments, or risky credential-looking files were found. Live form requirements were rechecked and all required answers are prepared. Readiness is ready; explicit approval for Devpost writes is still pending.
- Existing user changes were preserved: `SUBMISSION.md` is locally deleted, while this file is the provided draft. Older README/rules-validation references to `SUBMISSION.md` were not edited.
- No Devpost project, submission, or asset was created or changed during preparation.

## TODO Official Form Fields

Mapped from the live WebMCP Challenge submission form on 2026-09-03. The participant supplied all personal answers below. These mappings are form-answer preparation, not public-description copy.

| Field ID | Official form field | Prepared answer / remaining input |
|---|---|---|
| 28249 | Submitter Type | Individual — participant answer. |
| 28250 | Country of residence of yourself and team members if applicable | Norway — participant answer. |
| 28251 | If submitting on behalf of an organization, what is the organization name? | Not applicable: Individual. Omit this optional answer. |
| 28252 | App Status | New — confirmed by the participant. Initial repository build: September 2, 2026. |
| 28253 | If Existing, explain what you updated during the submission period. (We recommend explaining this in your text description, too!) | Not applicable: New project. Omit this optional answer. |
| 28254 | Live URL that judges can access using ChatGPT’s in-app browser or Google Chrome with WebMCP enabled | https://webmaxru.github.io/webmcp-grid-resilience/ |
| 28255 | If applicable, testing instructions for application - If you have credentials for your URL, you can put them here. | Use Testing Instructions above. No credentials required. |
| 28256 | URL to your PUBLIC Code Repo (on Github, Gitlab, or Bitbucket) | https://github.com/webmaxru/webmcp-grid-resilience |
| 28257 | Which agent(s) or client(s) did you test your WebMCP tools with? | OpenAI Codex desktop in-app Browser on the public deployment; deterministic fake ModelContext harness for automated contract tests. See Agents/clients tested above for the recorded scope. |
| 28258 | Which AI tools have you leveraged while working on this project? | OpenAI Codex; the webmcp skill from webmaxru/web-ai-agent-skills. See AI tools used above. |
| 28259 | Describe the level of learning you/your team derived from the project | Significant — participant answer. |
| 28260 | Did you gain AI value that you can use in your career? | Yes — participant answer. |

The current form does not request a Codex session ID. No session identifiers or private session contents were collected.
