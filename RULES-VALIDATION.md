# WebMCP Challenge rules validation

Checked against the official [challenge page](https://webmcp.devpost.com/) and [resources](https://webmcp.devpost.com/resources). Deadline supplied by the organizer flow: **September 3, 2026 at 20:00 UTC**. Re-check Devpost immediately before submitting in case organizer details change.

## Submission compliance

| Requirement | Evidence | Status |
|---|---|---|
| Unique project that uses WebMCP | Nine imperative page-hosted tools; top-level registration in `src/app.mjs`; schemas and lifecycle in `src/webmcp.mjs` | **Implemented** |
| Multiple submissions must be unique and substantially different | This project is a safety-gated infrastructure digital twin. Unlike the separate microplate app (laboratory spatial allocation) and provenance app (evidence-chain research), its core mechanic is versioned restoration planning plus human authorization of a synthetic switching sequence. It shares no domain model, workflow, or consequence with those projects. | **Distinct** |
| Working live URL, free and unrestricted through judging | GitHub Pages: `https://webmaxru.github.io/webmcp-grid-resilience/`; anonymous HTTPS request returned HTTP 200 with the expected title on 2026-09-02. Keep it free, public, and unrestricted through September 21, 2026 at 5:00 pm PT. | **Pass; ongoing availability required** |
| Project description explains WebMCP fit, improved UX, new capability, and implementation | Complete copy in `devpost-submission.md` | **Ready** |
| Public YouTube demo under 3 minutes with audio | Published [2:18 narrated demo](https://youtu.be/SdDKlUeFK2Y); the exact-master caption source remains at `demo/demo-captions.srt`. | **Pass** |
| Public source repository with complete source | `https://github.com/webmaxru/webmcp-grid-resilience`; GitHub API confirmed `isPrivate: false` on 2026-09-02. | **Pass** |
| Open-source license visibly present | Root `LICENSE` is MIT and linked in README | **Pass** |
| Required field: agents/clients tested | Deterministic fake `modelContext`: passed. OpenAI Codex desktop in-app Browser: nine tools discovered from the public deployment and six native calls completed, including simulation, comparison, and visible draft mutation. | **Pass** |
| Required field: AI tools used | OpenAI Codex and installed `webmcp` implementation skill are disclosed in submission copy | **Ready** |
| Source and app remain accessible through judging | Public repository and HTTPS GitHub Pages deployment are active; keep the live app free and unrestricted through September 21, 2026 at 5:00 pm PT | **Pass; ongoing availability required** |

Repository visibility and Pages deployment were changed only after the owner explicitly requested both actions.

## Local implementation validation

| Check | Command/evidence | Expected |
|---|---|---|
| Domain and safety tests | `npm test` | All tests pass |
| Static server | `npm start` | HTTP 200 on `/`, `/src/app.mjs`, `/src/webmcp.mjs` |
| Tool inventory | `test/webmcp.test.mjs` | Exactly 9 names; all schemas/annotations; cleanup signal |
| Unsafe S3 request | Automated + `evals.md` case 5 | `fault_energization`, no write |
| Pre-approval execution | Automated + `evals.md` case 4 | `approval_required`, no write |
| Approval revocation | Automated | Human state edit clears page grant |
| Idempotent execution | Automated | One receipt for repeated key |
| Responsive/accessibility baseline | Keyboard controls, labels, reduced motion, mobile CSS | Manual screenshot/keyboard check |
| Codex desktop native discovery | Public deployment, nine discovered tools, native `get_incident_state`, `get_topology`, two `simulate_restoration_plan`, `compare_plans`, and `set_draft_plan` calls | **Pass (2026-09-02)** |

### Native Codex attempt (2026-09-02)

Codex's in-app Browser binding was selected and made visible, but two fresh localhost tab attempts timed out while waiting for the Browser webview to attach. A direct Codex-panel browser open also failed to attach. Therefore no native site-tool call, discovery result, or Recently Used trace is claimed; the deterministic fake-`modelContext` tests remain test-harness evidence only.

### Native Codex retry (2026-09-02)

After publishing the HTTPS GitHub Pages deployment, the in-app Browser discovered exactly nine page tools. Native calls read the incident and constraints, simulated a valid 27% reserve plan and an invalid 18% coverage plan, compared them, and placed the valid plan into visible preview. The page advanced from state version 1 to 2 and its activity ledger recorded the agent calls. This supersedes the failed localhost attempt above.

## Judging criteria — equal-weight evidence

### 1. WebMCP leverage

- WebMCP is the semantic control plane, not a chat wrapper: exact topology, state versions, plan simulation, comparison, preview, validation, preparation, execution, and receipts are tools.
- Agent and human use one page-owned engine and visible state.
- Stable IDs and derived outcomes replace brittle SVG clicking.
- Schemas, annotations, stale preconditions, lifecycle cleanup, page-held consent, idempotency, and structured corrective errors are implemented and tested.

### 2. Execution

- One coherent incident runs from read to receipt with no account, backend, build, data, or dependency setup.
- Normal human controls remain usable without WebMCP.
- Responsive single-screen UI exposes candidates, exact operations, approval, and ledger.
- Automated tests cover the most consequential paths.

### 3. Potential impact

- Demonstrates an agent-native pattern for professional digital twins: human judgment and consent plus machine-speed constrained exploration.
- Critical-load restoration is legible in seconds while remaining explicitly synthetic.
- The version/approval/receipt pattern generalizes to maintenance, emergency planning, and infrastructure training.

### 4. Creativity and ambition

- A live microgrid topology visibly changes from outage to restored critical services.
- The dramatic mid-demo human edit proves shared-state collaboration rather than a canned agent script.
- The approval secret never enters model context, showing a practical trust boundary despite the minimal implementation.

## Final go/no-go checklist

- [x] Core static app and normal human workflow
- [x] Real imperative WebMCP registrations
- [x] Mocked deterministic data and business validation
- [x] Automated state-machine and fake-client tests
- [x] MIT license and source documentation
- [x] Devpost copy, transcript, script, and shot list
- [x] Native Codex desktop run captured with Site tools history
- [x] Public live URL returns HTTP 200 and stays available
- [x] Repository deliberately changed from private to public
- [x] Public [2:18 YouTube video](https://youtu.be/SdDKlUeFK2Y), under 3:00, with audible narration
- [ ] Final Devpost form fields and URLs verified

Submission evidence is complete; only entrant-specific Devpost fields and final submission remain.
