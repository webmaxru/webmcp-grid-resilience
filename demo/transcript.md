# Voiceover transcript

Spoken text only, in delivery order. Approximately 395 words, roughly 2:33 of speech at a natural pace, leaving margin under the 3:00 limit. Timing, prompts, and on-screen actions live in `demo-script.md`; nothing in this file should be read as a cue. The one line added below (marked) exists to carry the opening full-page scan in `demo-script.md` — it does not change the pacing notes that follow.

---

A storm takes out a feeder, and a neighborhood goes dark. Here's the whole board before anyone touches it — a hospital burning through its backup, a shelter filling with people, and a water pump that dies the moment the battery does. The operator has minutes to choose a switching sequence — and the wrong switch energizes a live fault.

Ask a chatbot, and you get confident prose about a grid it has never seen. Point a screen-clicking agent at this diagram, and it's guessing which circle isolates the fault. So this page stops being a picture. It publishes its own domain as nine WebMCP tools, running on the same engine as the human controls.

One request. Restore the critical loads, keep the fault isolated, hold twenty-five percent battery reserve, and show me what happens if it tries to execute without me.

It reads the incident and the interlocks by name, not by pixel. Then it puts the tempting plan next to the safe one. The bigger plan restores more kilowatts — and the page blocks it, because reserve collapses to eighteen percent. That's not the model's opinion. Those are the page's rules. The safer plan lands in preview: amber, reversible, nothing actually switched. Then it attempts execution, and the page stops it cold.

Here's where this becomes collaboration instead of automation. I don't rewrite the prompt. I use the website. Water pump: critical. That one click advances the shared state, marks the plan stale, and revokes any approval. The agent gets a structured error instead of a silent wrong answer, and re-plans around my judgment — all three critical services, twenty-six percent reserve.

It can stage the exact switching sequence. It can never approve it. Authorization is a button on the page that mints a short-lived grant bound to this exact plan, and that secret never touches model context.

Approved. One execution. Hospital, shelter, and water come up, the fault stays isolated, and the receipt records who approved what — down to the plan hash and the state versions on either side. Retry with the same key, and it refuses to run twice.

This is a training simulator, not utility software. But the pattern is the point. Agents don't earn trust by clicking more carefully. They earn it when the page gives them a language to speak — and keeps the last word.

---

## Delivery notes

- Open low and urgent, not announcer-bright. Start talking the instant the recording starts — the first sentence plays under the fresh-session/sidebar beat, and "Here's the whole board before anyone touches it" is the cue that carries into the full-page scan, so it should land right as the scan begins, not before it. The first three sentences carry the stakes; let the silence after "energizes a live fault" land before the second paragraph.
- Lift energy on "So this page stops being a picture" — that is the thesis.
- "That's not the model's opinion. Those are the page's rules." — slow down, separate the two sentences clearly.
- "Water pump: critical." — say it on the click, then pause while the state version changes.
- "It can stage the exact switching sequence. It can never approve it." — the strongest beat in the piece. Land it flat and certain; no rising inflection.
- Final line: pause before "and keeps the last word," then stop. No sign-off, no feature summary, no URL read-out — the end card carries those.
- If a take runs long, cut the second sentence of paragraph two before cutting anything else. Never trim the safety-boundary paragraph to save time.
