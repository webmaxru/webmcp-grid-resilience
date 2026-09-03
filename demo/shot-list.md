# Shot list and evidence checklist

Finished-edit timecodes. Target 2:35, hard ceiling 2:40 (never submit above 3:00). Pair this with `demo-script.md` for prompts, the Area map, and the full scroll/cursor choreography, and `transcript.md` for narration.

## Area quick-reference

Six named beats, six on-page destinations (full detail in `demo-script.md`'s Area map): **incident/topology** = `topbar` badge + `incident-strip` + `topology-panel` (top-left) · **human judgment** = `priorities` aside, Water pump (top-right, same screen as topology) · **candidate plans** = `candidates-panel` + `draft-panel` (one scroll down) · **authorization** = `approval-panel` (one more scroll down) · **execution** = `topology-panel` (scroll up) then `approval-panel`/`evidence-panel` (scroll back down) · **receipt** = `evidence-panel` (same screen as approval).

## Shots

| Time | Frame | Operator action | Evidence that must be legible | Post |
|---|---|---|---|---|
| 0:00 | Codex app chrome | **Start a brand-new session on camera, then immediately collapse the sidebar** | Nothing personal, no prior conversations, no other projects — even for one frame | 1× — recorded, not preflight |
| 0:03 | Cut to in-app Browser, top of page | Begin one smooth, continuous scroll downward; no clicks | Faulted `GRID · F1`, `S3 OPEN`, four dark loads, red fault line, `priorities` aside, `Synthetic training only` | 1× — this is the hook, voiced throughout |
| 0:08 | Bottom of page | Hold ~1 s | `approval-panel`, `evidence-panel`, footer disclaimer all visible together | 1× |
| 0:11 | Scroll back to top | Same smooth speed as the descent | Topology and incident strip back in frame | 1× |
| 0:13 | Push to S3 interlock | Hover S3 once with cursor/halo, no click | "Must remain open while feeder F1 is faulted" | 1× |
| 0:20 | Header badge | None | **9 WebMCP tools ready**, `v1`, Battery `55%`, Critical loads `2` | 1× |
| 0:26 | Codex composer | Paste and send **Prompt 1** | The full prompt readable for at least 2 s before sending | 1× |
| 0:30 | Scroll to `incident-strip` | Cursor halo rests on the Phase/State/Battery/Critical-loads row | `get_incident_state` named in the reply; Phase, State `v1`, Battery `55%`, Critical loads `2` | ⏩ 1.5–2× latency only |
| 0:34 | Scroll to `topology-panel` | Cursor halo on the SVG diagram / S3 node | `get_topology` named in the reply; diagram, S3, fault line | ⏩ latency only |
| 0:40 | Scroll down one screen to `candidates-panel` | Cursor halo tracks each card as it renders | Two `simulate_restoration_plan` calls named; Coverage 95 kW / **18%** / **Blocked**, Resilient 65 kW / **27%** / **Valid** | 1× on the render, ⏩ on the gap before it |
| 0:50 | `draft-panel` (same screen, right column) | Cursor halo on the preview list | Switching preview, ordered operations | 1× |
| 0:58 | Scroll down to `approval-panel` | Cursor halo on the review list | Ordered operations, draft ID and hash, status `waiting for human` | 1× |
| 1:02 | Blocked execution | None | `approval_required` in the reply; topology unchanged | 1× |
| 1:06 | Scroll up to `priorities` (no scroll needed from topology — same screen) | Cursor/halo moves to **Water pump** | Button still Normal, about to be clicked | 1× |
| 1:08 | Load priorities | **Click Water pump → Critical** | Button flips to Critical, Critical loads `3`, State increments to `v3` | 1× |
| 1:14 | Scroll to `draft-panel` | None | Draft badge **Stale** | 1× |
| 1:16 | `approval-panel` | None | Review reads `revoked by state change` | 1× |
| 1:20 | Codex composer | Paste and send **Prompt 2** | Prompt readable | ⏩ latency only |
| 1:24 | Stale recovery, reply text | None | Structured `stale_state` error, then a re-read and re-simulation named on screen | ⏩ up to 2× |
| 1:30 | Scroll to `candidates-panel`/`draft-panel` | Cursor halo on the new card | New Valid candidate, 90 kW / **26%**; water joins hospital and shelter in amber | 1× |
| 1:34 | Scroll to `approval-panel` | None | Fresh `waiting for human` review | 1× |
| 1:38 | Composer loaded, not sent | Paste **Prompt 3**, do not send | Prompt visible in the composer | 1× |
| 1:44 | Human authorization | Cursor/halo moves to and **clicks Authorize this simulation** | Status changes to `authorized`; the click is unmistakably human | 1× — never speed up |
| 1:48 | Send | Send Prompt 3 | — | ⏩ latency only |
| 1:54 | **Scroll up** to `topology-panel` | Cursor halo tracks the nodes as they change | Hospital, shelter, water turn green in order; **S3 OPEN unchanged** | 1× — never speed up |
| 2:00 | **Scroll down** to `evidence-panel` | None | Phase `completed`; receipt `R-104`, approved draft hash, `26%` reserve; ledger rows with both `human` and `agent` actors | 1× |
| 2:08 | Idempotent replay | None | Second call with the same key returns the same receipt; still one receipt on the page | ⏩ latency only |
| 2:14 | Scroll up to `topology-panel` (closing frame) | None | Restored topology with S3 open, footer disclaimer visible | 1× |
| 2:33 | End card | None | Live URL and repository URL, ~2 s | 1× |

Optional B-roll if runtime allows: a terminal showing `npm test` green (5/5). Cut it first if the edit runs long — it is the least load-bearing shot.

## Capture checklist

- [ ] Fresh Codex session started **on camera**, sidebar collapsed within the first ~3 seconds of the recording
- [ ] Full-page scan (top → bottom → top) captured smoothly at 1× with the opening voiceover playing over it, not before it
- [ ] 1920×1080 or 2560×1440 canvas, browser zoom unchanged mid-take
- [ ] A visible cursor or cursor halo rests on the exact card/control/diagram being discussed for every scroll destination, before the voiceover names it
- [ ] **If the system cursor does not render on capture:** a high-contrast overlay cursor with a click halo is composited in post, synchronized to the actual recorded interaction coordinates — never used to imply an unrecorded state change
- [ ] No passwords, tokens, email addresses, bookmarks, or unrelated tabs
- [ ] WebMCP tool names readable in the Codex reply at least once
- [ ] State version readable before and after the human priority edit
- [ ] `approval_required` visible before any authorization
- [ ] Human authorization click captured in real time, at 1×
- [ ] No edit implies the agent performed the human-only click
- [ ] The up-scroll to topology and back down to the receipt after execution is smooth and keeps the changing area in frame, not mid-transition
- [ ] S3 visibly remains open after execution
- [ ] Receipt hash and `26%` reserve legible
- [ ] Narration audible, matches what is actually on screen, and claims nothing beyond it
- [ ] Speed-ups applied only to the marked latency gaps — never to the scan, a scroll, a state transition, the human click, or the authorization beat
- [ ] Final runtime 2:25–2:40, hard ceiling 2:40, under 3:00
- [ ] Uploaded Public on YouTube (not Unlisted) with audio
- [ ] Live URL and repository verified reachable on the day of submission

## Honesty guardrails

- Every number spoken must be visible in the same or an adjacent shot.
- If a beat is not captured natively, it is not narrated as if it were. Update `RULES-VALIDATION.md` to match whatever the final take actually shows.
- Silent raw footage does not satisfy the challenge's public-video-with-audio requirement; record or overdub the narration from `transcript.md`.
- The cursor overlay (when used) is a visual pointer only — it must never make a page state look changed when it wasn't actually captured that way.
