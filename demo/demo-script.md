# Demo script — target finished runtime 2:35 (hard ceiling 2:40)

Recording control sheet for the public judging video. Hard rules: under 3:00, audible narration, working software on screen, and a clearly explained WebMCP mechanism. Everything below is claimable from the shipped build — do not add capability language the app does not have.

**Design intent:** a visibly fresh Codex session with the sidebar gone before the first real beat, a full-page scan that still plays as a hook because the opening voiceover never stops, one hero prompt that produces the strongest end-to-end WebMCP run, one human page edit that proves shared state, one human-only approval that proves the trust boundary, and a closing line about the pattern rather than a feature recap. The finished cut must land under 2:40 — hold times are the first thing to cut, never the human click or the state transitions.

## Area map — where every beat lives on the page

The app is one scrolling page in the in-app Browser. Use these anchors for every scroll instruction below; they are the only camera destinations this demo needs.

| Area (as named in feedback) | On-page panel(s) | Position |
|---|---|---|
| Incident / topology | `topbar` badge + `incident-strip` + `topology-panel` (SVG diagram, S3 interlock callout) | Top of page, left column |
| Human judgment | `priorities` aside (Load priorities, **Water pump** button) | Top of page, right column — same screen as topology, no scroll needed between them |
| Candidate plans | `candidates-panel` (Candidate comparison cards) + `draft-panel` (Switching preview, Prepare exact review) | Middle of page — left/right columns, one scroll down from the top |
| Authorization | `approval-panel` (Exact execution review, Authorize / Execute buttons) | Bottom of page, left column — one more scroll down from candidates |
| Execution | `topology-panel` (nodes turn green, S3 stays open) **and** `approval-panel` (phase → `completed`) | Requires a scroll back up to topology, then back down to approval — see 1:34–2:04 below |
| Receipt | `evidence-panel` (Receipt & activity ledger) | Bottom of page, right column — same screen as approval, no scroll needed between them |

## Facts this demo is allowed to claim

Verified in `src/grid-core.mjs`, `src/webmcp.mjs`, and `npm test` (5/5 passing).

| Beat | Exact on-screen truth |
|---|---|
| Tool count | Header badge reads **9 WebMCP tools ready** |
| Coverage plan | 95 kW restored, reserve falls to **18%**, verdict **Blocked** (`reserve_below_minimum`) |
| Resilient plan | 65 kW restored, reserve **27%**, verdict **Valid** |
| Critical-services plan | 90 kW restored, reserve **26%**, verdict **Valid** |
| Human edit | Water pump → Critical bumps state version, marks the draft **Stale**, sets review to **revoked by state change** |
| Blocked execution | `approval_required`; topology unchanged |
| Approval | Page-held grant bound to the draft hash and version, **valid for 60 seconds**, never returned to the model |
| Execution | Hospital, shelter, water energize; **S3 stays open**; receipt **R-104** |
| Replay | Same idempotency key returns the same receipt, `idempotentReplay: true` |
| Versions | v1 → draft v2 → human edit v3 → new draft v4 → executed v5 |

Never say "grid," "utility," or "deployment" without the word synthetic or training nearby. The footer disclaimer must be legible at least once.

## Preflight (operator actions, not voiceover — done before pressing record)

The fresh session and the sidebar collapse are no longer preflight — they are now the first two things the camera sees (0:00–0:03 below). Everything in this list still happens **before** you press record.

1. In the Codex in-app Browser tab you will show on camera, open the deployed HTTPS app: `https://webmaxru.github.io/webmcp-grid-resilience/`. Site tools must be enabled.
2. Press **Reset incident**. Confirm: phase `incident loaded`, State `v1`, Battery `55%`, Critical loads `2`, no receipt, empty candidate panel, and the header badge **9 WebMCP tools ready**. Leave the page scrolled to the very top — this is the frame the scan (0:03–0:13) starts from.
3. Confirm the Codex app is signed in and that starting a **new session** and **collapsing the sidebar** are each a single, fast, reliable action (one click or one shortcut) — you have only a couple of seconds on camera for both, and no prior conversation, other projects, or account details may be visible even for a frame.
4. Size the window so the topology, the candidate panel, the approval panel, and the Codex reply are all readable at 1080p without zooming mid-take.
5. Have the three prompts below on the clipboard, in order. Paste them; do not type live.
6. **Cursor check:** confirm whether your screen-recording/automation setup renders a visible system cursor and click state during Codex-driven and human-driven actions alike. If it does not (common with automated in-app Browser drivers), plan on the post-production cursor overlay described in **Post-production notes** below — do not skip cursor visibility, and do not fake it live by moving a mouse that isn't actually driving the action.
7. Optional B-roll tab: a terminal with `npm test` already green.

## Recording sequence

Timecodes are the **finished** edit after post speed-ups. "Scroll to …" instructions target the panels named in the **Area map** above; execute each scroll just *before* the tool call or click it serves, and hold that panel steady in frame — not mid-transition — while the voiceover discusses it. Every scroll should carry a visible cursor or cursor halo resting on the exact card/control/diagram being discussed (see the fallback in **Post-production notes** if the live cursor isn't rendering).

---

### 0:00–0:03 — Session start, sidebar gone

**On screen:** the Codex app chrome, not the site yet.
**Action:** start a **brand-new session** (no prior transcript visible even for a frame), then immediately collapse/hide the sidebar. Both actions happen on camera, back to back, inside ~3 seconds — this replaces the old off-camera preflight step.
**Narration:** the voiceover has already started — "A storm takes out a feeder, and a neighborhood goes dark." — playing over this beat, not waiting for it.

### 0:03–0:13 — Full-page scan (still the hook)

**On screen:** cut to the Codex in-app Browser, already on the app, scrolled to the very top: `topbar` badge, `incident-strip`, faulted `GRID · F1`, `S3 OPEN`, four dark loads, red fault line, `priorities` aside beside the topology.
**Action:** one smooth, continuous scroll from the top down through `candidates-panel`/`draft-panel` to the bottom (`approval-panel`/`evidence-panel`, footer disclaimer), hold ~1 second at the bottom, then scroll back to the top at the same smooth speed. No clicks, no cursor emphasis — this is an establishing pass, not an interaction.
**Narration continues over the scan, uninterrupted:** "Here's the whole board before anyone touches it — a hospital burning through its backup, a shelter filling with people, and a water pump that dies the moment the battery does. The operator has minutes to choose a switching sequence — and the wrong switch energizes a live fault." The scan is timed so this line lands by the time the page reaches the bottom and starts back up; do not let the frame go silent — the scan is the hook, not a pause before it.

**⏩ Speed up in post:** none. This whole segment plays at 1× — it is voiced, not a silent tour, and it is the first-10-seconds hook the challenge needs.

### 0:13–0:26 — Why the normal workflow fails

**On screen:** back at the top; slow push toward the S3 interlock callout in `topology-panel`, then a beat on the header badge **9 WebMCP tools ready**.
**Action:** hover the S3 node once, cursor/halo resting visibly on it so the interlock caption is unmistakable. Do not click.
**Narration:** a chatbot can only produce plausible prose about a grid it cannot see; a pixel-clicking agent is guessing which circle isolates a fault. This page instead publishes its domain as nine tools over the same engine the human UI uses.

### 0:26–1:06 — Hero prompt and the agent's constrained search

**Action:** click the Codex composer, paste **Prompt 1**, send.

> **Prompt 1 (hero)**
>
> Feeder F1 just faulted. Use this page's tools: restore my critical loads without energizing the fault and keep battery reserve at or above 25%. Compare a maximum-coverage option against a safer one, put the better plan in preview, prepare the exact switching sequence, then try to execute it so I can see what the page does before I approve anything.

**Expected route:** `get_incident_state` → `get_topology` → `simulate_restoration_plan` ×2 → `compare_plans` → `set_draft_plan` → `validate_draft_plan` → `prepare_simulated_execution` → `execute_approved_simulation` (blocked).

**Scroll choreography — move the Browser just before each event lands, and hold a cursor halo over the area named while the voiceover explains it:**

| Tool call / state change | Scroll to (Area map) | Keep in frame |
|---|---|---|
| `get_incident_state` | `incident-strip` (top) | Phase, State `v1`, Battery `55%`, Critical loads `2` |
| `get_topology` | `topology-panel` | The SVG diagram, S3 node, fault line |
| `simulate_restoration_plan` ×2 → `compare_plans` | scroll down one screen to `candidates-panel` | Both cards rendering — Coverage 18%/Blocked, Resilient 27%/Valid |
| `set_draft_plan` | `draft-panel` (same screen, right column) | Switching preview populating with the ordered operations |
| `validate_draft_plan` → `prepare_simulated_execution` | scroll down to `approval-panel` | Review list filling in, status moving to `waiting for human` |
| `execute_approved_simulation` (blocked) | stay on `approval-panel` | Status flips to `approval_required`; topology (off-screen) unchanged |

**⏩ Speed up in post:** every gap between the send and the first tool call, and any pause longer than ~1.5 s between tool calls. Target 1.5–2× on model latency only; never speed up a scroll, a panel state change, or the moment a card renders.

**Narration:** it reads real IDs and constraints, tests the tempting plan against the safe one, and the page — not the model — rejects the one that drops reserve to 18%. Preview is amber and reversible. Then the execution attempt hits the wall.

### 1:06–1:34 — The human changes the world, in the page

**Action:** scroll back up to `priorities` (top-right, beside `topology-panel` — no scroll needed between the two). Cursor/halo moves to **Water pump** and clicks it so it flips Normal → Critical. Hold the frame long enough for State to increment, Critical loads to read `3`, the draft badge (scroll down one screen to `draft-panel` to show it) to read **Stale**, and `approval-panel`'s review to read `revoked by state change`. Then paste **Prompt 2** and send.

> **Prompt 2**
>
> I just marked the water pump critical in the page. Revalidate, re-plan around that, and prepare the exact sequence again.

**Expected route:** `validate_draft_plan` → `stale_state` → `get_incident_state` → `simulate_restoration_plan` → `set_draft_plan` → `validate_draft_plan` → `prepare_simulated_execution`.

**Scroll choreography:** the stale error and re-read surface in the Codex reply (composer stays in frame); as `set_draft_plan` fires, scroll to `candidates-panel`/`draft-panel` to hold the new Valid card and updated preview in frame; as `prepare_simulated_execution` fires, scroll to `approval-panel` for the fresh `waiting for human` review. Cursor halo tracks each panel as it's named in narration.

**On screen:** the structured stale-state error in the reply, then a new Valid candidate at 90 kW / 26% reserve, water joining hospital and shelter in amber (visible if the topology is caught mid-scroll; not required to hold), and a fresh `waiting for human` review.

**⏩ Speed up in post:** model latency only. If the agent first retries a stale candidate ID and self-corrects, keep it — it is good evidence — but accelerate it to ~2×.

**Narration:** no prompt rewriting; a normal UI click changed shared state, invalidated the plan, and revoked any approval. The agent re-planned around human judgment.

### 1:34–2:04 — The boundary the agent cannot cross

**On screen:** already on `approval-panel` from the prior beat — no scroll needed to start this section.
**Action, in this exact order — the grant expires after 60 seconds:**
1. Paste **Prompt 3** into the composer but **do not send**.
2. Cursor/halo moves to **Authorize this simulation** and clicks it. Let the status change to `authorized` on camera.
3. Send Prompt 3.

> **Prompt 3**
>
> Approved in the page. Execute it once, then retry with the same idempotency key, and show me the receipt.

**Expected route:** `execute_approved_simulation` → `execute_approved_simulation` (same key, `idempotentReplay: true`) → `get_execution_receipt`.

**Scroll choreography:** the moment `execute_approved_simulation` returns success, scroll **up** to `topology-panel` and hold — hospital, shelter, and water turn green in order while **S3 OPEN stays open**, cursor halo resting on the switching nodes as narration names them. As soon as that reads, scroll back **down** to `evidence-panel` for the receipt and ledger, and stay there through the replay call.

**On screen:** hospital, shelter, and water turn green; **S3 OPEN stays open**; phase `completed`; receipt **R-104** with the approved draft hash and 26% reserve; the ledger showing `human` and `agent` actors side by side.

**⏩ Speed up in post:** the authorization click and the execution render (both the topology change and the up/down scroll that reveals it) play at 1× — this is the money shot. Model latency around it, and the idempotent-replay round trip, at 1.5–2×.

**Narration:** the agent can stage the exact sequence but never authorize it; approval is a page button that mints a short-lived grant bound to this draft hash, and that secret never enters model context. One execution, one receipt, and a retry that refuses to run twice.

### 2:04–2:35 — Close on the pattern

**On screen:** restored topology with S3 still open (scroll up to `topology-panel` one last time), footer disclaimer visible, then a 2-second end card with the live URL and repository URL.
**Action:** none.
**Narration:** end on the closing line in `transcript.md`. Do not summarize features.

---

## Post-production notes

- Accelerate only the marked latency gaps. Keep every state transition, the human click, the authorization beat, and the 0:03–0:13 full-page scan at 1×.
- **Cursor fallback (required if the system cursor doesn't render):** if Codex or the background automation driving the in-app Browser does not visibly render the system cursor and click states, overlay a high-contrast synthetic cursor in post, with a subtle expanding-ring click halo, keyframed to the exact recorded interaction coordinates (click positions, hover targets, scroll-triggered focus points) from the take. The overlay is a visual pointer only — it must never be used to imply a page state changed that didn't actually change on screen; every card, badge, and topology color shown must be the real, captured render, not a mocked-up frame.
- If total runtime lands above 2:40, cut in this order: (1) trim the 0:03–0:13 scan's bottom hold to ~0.5 s (never remove the scan itself or its voiceover), (2) shorten the S3 hover in 0:13–0:26, (3) trim the idempotent-replay call to the reply text only, (4) tighten the end card to 1.5 s. Do not shorten the human click, the authorization beat, or any panel state transition to hit the runtime.
- If runtime lands below 2:25, hold the post-execution topology longer rather than adding narration or re-extending the scan.
- Do not add captions that restate numbers already visible; keep the frame legible instead.
- Loudness: normalize narration around −16 LUFS. No music bed over the opening scan or the approval beat.

## Fallbacks

- **A tool call fails or the agent stalls:** reset the incident, restart the take. Do not stitch two different runs into one apparently continuous session.
- **Approval expires (60 s) before the execute call lands:** the page returns `approval_expired`. Re-prepare, re-authorize, and re-record the segment; do not present the expiry as the designed ending.
- **Native site tools do not attach:** the run is not claimable as native. Fall back to the human path (`Simulate coverage plan`, `Simulate critical-services plan`, `Place in preview`, `Prepare exact review`, `Authorize this simulation`, `Execute approved draft once`), and change the narration to describe the tool layer without implying a captured agent run. `RULES-VALIDATION.md` must stay honest about what was captured.
- **System cursor not visible in the raw capture:** apply the post-production cursor overlay described above rather than re-recording with an artificial on-screen mouse wiggle that doesn't match the real interaction — the overlay must be timed to the actual click/scroll coordinates from the take, not approximated live.
