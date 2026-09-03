import { createGridSimulator, PLAN_LIBRARY } from "./grid-core.mjs";
import { createGridToolDefinitions, registerWebMcpTools } from "./webmcp.mjs";

const simulator = createGridSimulator();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

function render() {
  const state = simulator.getState();
  document.body.dataset.phase = state.phase;
  $("#version").textContent = `v${state.stateVersion}`;
  $("#phase").textContent = state.phase.replaceAll("_", " ");
  $("#reserve").textContent = `${state.battery.stateOfChargePercent}%`;
  $("#critical-count").textContent = Object.values(state.priorities).filter((value) => value === "critical").length;

  for (const [loadId, priority] of Object.entries(state.priorities)) {
    const button = $(`[data-priority="${loadId}"]`);
    button.textContent = priority === "critical" ? "Critical" : "Normal";
    button.dataset.active = priority === "critical";
    button.setAttribute("aria-pressed", priority === "critical");
  }

  for (const [loadId, restored] of Object.entries(state.executed)) {
    const node = $(`[data-node="${loadId}"]`);
    node?.classList.toggle("energized", restored);
    node?.classList.toggle("preview", !restored && Boolean(state.draft?.candidate.metrics.restored.includes(loadId)));
  }

  const candidates = Object.values(state.candidates);
  $("#candidates").innerHTML = candidates.length
    ? candidates.map((candidate) => `
      <article class="candidate ${candidate.metrics.valid ? "valid" : "blocked"}">
        <div><span class="eyebrow">${escapeHtml(candidate.id)}</span><strong>${escapeHtml(candidate.label)}</strong></div>
        <span class="verdict">${candidate.metrics.valid ? "Valid" : "Blocked"}</span>
        <dl><div><dt>Restored</dt><dd>${candidate.metrics.restoredKw} kW</dd></div><div><dt>Reserve</dt><dd>${candidate.metrics.reserve}%</dd></div><div><dt>Ops</dt><dd>${candidate.operations.length}</dd></div></dl>
        <p>${candidate.metrics.valid ? `Restores ${candidate.metrics.restored.map((id) => escapeHtml(id)).join(", ")}.` : `Violation: ${candidate.metrics.violations.map(escapeHtml).join(", ")}.`}</p>
        ${candidate.metrics.valid ? `<button type="button" class="secondary preview-candidate" data-candidate="${escapeHtml(candidate.id)}">Place in preview</button>` : ""}
      </article>`).join("")
    : `<div class="empty"><strong>No candidates yet</strong><span>Use the two human demo buttons or ask an agent through WebMCP.</span></div>`;

  $("#draft").innerHTML = state.draft
    ? `<div class="draft-head"><div><span class="eyebrow">${escapeHtml(state.draft.id)} · hash ${escapeHtml(state.draft.hash)}</span><strong>${escapeHtml(state.draft.candidate.label)}</strong></div><span class="verdict ${state.draft.stale ? "danger" : ""}">${state.draft.stale ? "Stale" : "Preview"}</span></div>
       <ol>${state.draft.candidate.operations.map((operation) => `<li>${escapeHtml(operation.replaceAll("_", " "))}</li>`).join("")}</ol>`
    : `<div class="empty"><strong>No draft selected</strong><span>A draft is a reversible preview, never an execution.</span></div>`;

  const approvalButton = $("#authorize");
  approvalButton.disabled = !state.prepared || state.prepared.status !== "waiting_for_human";
  $("#approval-state").textContent = state.prepared
    ? state.prepared.status.replaceAll("_", " ")
    : "not prepared";
  $("#review-ops").innerHTML = state.prepared
    ? state.prepared.operations.map((operation) => `<li>${escapeHtml(operation.replaceAll("_", " "))}</li>`).join("")
    : "<li>Agent or operator must prepare a validated draft.</li>";

  const receipts = Object.values(state.receipts);
  $("#receipt").innerHTML = receipts.length
    ? `<strong>${escapeHtml(receipts.at(-1).id)} · executed once</strong><span>${receipts.at(-1).finalMetrics.restored.map((id) => escapeHtml(id)).join(", ")} restored · ${receipts.at(-1).finalMetrics.reserve}% reserve</span><code>${escapeHtml(receipts.at(-1).approvedDraftHash)}</code>`
    : `<strong>No execution receipt</strong><span>Consequential simulation stays blocked until human approval.</span>`;

  $("#ledger").innerHTML = state.ledger.length
    ? state.ledger.map((entry) => `<li><span class="actor ${entry.actor}">${escapeHtml(entry.actor)}</span><div><strong>${escapeHtml(entry.tool.replaceAll("_", " "))}</strong><small>${escapeHtml(entry.summary)} · v${entry.before}→v${entry.after}</small></div></li>`).join("")
    : `<li class="empty">No activity yet.</li>`;

  $$(".preview-candidate").forEach((button) => button.addEventListener("click", () => {
    simulator.setDraftPlan({ candidateId: button.dataset.candidate, expectedStateVersion: simulator.getState().stateVersion }, "human");
    render();
  }));
}

async function simulatePreset(operations) {
  const result = simulator.simulateRestorationPlan({
    objectives: ["restore_critical_loads", "maximize_reserve"],
    operations,
    expectedStateVersion: simulator.getState().stateVersion
  }, "human");
  render();
  return result;
}

$$("[data-priority]").forEach((button) => button.addEventListener("click", () => {
  const current = simulator.getState().priorities[button.dataset.priority];
  simulator.setPriority(button.dataset.priority, current === "critical" ? "normal" : "critical", "human");
  render();
}));

$("#plan-a").addEventListener("click", () => simulatePreset(PLAN_LIBRARY.coverage));
$("#plan-b").addEventListener("click", () => simulatePreset(PLAN_LIBRARY.resilient));
$("#plan-c").addEventListener("click", () => simulatePreset(PLAN_LIBRARY.critical));
$("#authorize").addEventListener("click", () => {
  simulator.authorizePrepared("human");
  render();
});
$("#prepare-human").addEventListener("click", () => {
  const state = simulator.getState();
  if (state.draft) simulator.prepareSimulatedExecution({ draftId: state.draft.id, expectedStateVersion: state.stateVersion }, "human");
  render();
});
$("#execute-human").addEventListener("click", () => {
  const state = simulator.getState();
  if (state.draft) simulator.executeApprovedSimulation({ draftId: state.draft.id, idempotencyKey: `human-${state.draft.hash}` }, "human");
  render();
});
$("#reset").addEventListener("click", () => {
  simulator.reset("human");
  render();
});

render();

const tools = createGridToolDefinitions(simulator, render);
const modelContext = document.modelContext || navigator.modelContext;

if (modelContext) {
  try {
    const registration = await registerWebMcpTools(tools, modelContext);
    $("#tool-status").dataset.status = registration.errors.length ? "error" : "ready";
    $("#tool-status").innerHTML = registration.errors.length
      ? `<span class="status-dot"></span><strong>${registration.registeredNames.length}/9 WebMCP tools ready</strong><span>${registration.errors.length} registration error${registration.errors.length === 1 ? "" : "s"}</span>`
      : `<span class="status-dot"></span><strong>${registration.registeredNames.length} WebMCP tools ready</strong>`;
    window.addEventListener("pagehide", () => registration.dispose(), { once: true });
  } catch (error) {
    $("#tool-status").dataset.status = "error";
    $("#tool-status").textContent = `WebMCP registration failed: ${error.message}`;
  }
} else {
  $("#tool-status").dataset.status = "preview";
  $("#tool-status").innerHTML = `<span class="status-dot"></span><strong>Human demo ready</strong><span>WebMCP needs the supported Codex/Chrome preview.</span>`;
}

window.gridDemo = { simulator, tools };
