import test from "node:test";
import assert from "node:assert/strict";
import { createGridSimulator, PLAN_LIBRARY } from "../src/grid-core.mjs";

function simulate(simulator, operations) {
  return simulator.simulateRestorationPlan({
    objectives: ["restore_critical_loads", "maximize_reserve"],
    operations,
    expectedStateVersion: simulator.getState().stateVersion
  });
}

test("plans, detects a human priority change, and completes an approved idempotent execution", () => {
  let clock = 1_800_000_000_000;
  const simulator = createGridSimulator({ now: () => clock, randomId: () => "private-grant" });

  const coverage = simulate(simulator, PLAN_LIBRARY.coverage);
  const resilient = simulate(simulator, PLAN_LIBRARY.resilient);
  assert.equal(coverage.ok, true);
  assert.equal(coverage.data.metrics.valid, false);
  assert.deepEqual(coverage.data.metrics.violations, ["reserve_below_minimum"]);
  assert.equal(resilient.data.metrics.valid, true);

  const comparison = simulator.comparePlans({ candidateIds: [coverage.data.id, resilient.data.id] });
  assert.equal(comparison.data.recommendedCandidateId, resilient.data.id);

  const firstDraft = simulator.setDraftPlan({ candidateId: resilient.data.id, expectedStateVersion: 1 });
  assert.equal(firstDraft.ok, true);
  assert.equal(firstDraft.stateVersion, 2);

  simulator.setPriority("water", "critical");
  const stale = simulator.validateDraftPlan({ draftId: firstDraft.data.id, expectedStateVersion: 2 });
  assert.equal(stale.ok, false);
  assert.equal(stale.error.code, "stale_state");
  assert.equal(stale.error.currentStateVersion, 3);

  const critical = simulate(simulator, PLAN_LIBRARY.critical);
  assert.equal(critical.data.metrics.valid, true);
  assert.deepEqual(critical.data.metrics.missingCritical, []);
  const revisedDraft = simulator.setDraftPlan({ candidateId: critical.data.id, expectedStateVersion: 3 });
  assert.equal(revisedDraft.stateVersion, 4);
  assert.equal(simulator.validateDraftPlan({ draftId: revisedDraft.data.id, expectedStateVersion: 4 }).ok, true);

  const prepared = simulator.prepareSimulatedExecution({ draftId: revisedDraft.data.id, expectedStateVersion: 4 });
  assert.equal(prepared.data.approvalRequired, true);
  assert.equal(simulator.getState().approval, null);

  const blocked = simulator.executeApprovedSimulation({ draftId: revisedDraft.data.id, idempotencyKey: "run-once-042" });
  assert.equal(blocked.error.code, "approval_required");
  assert.equal(simulator.getState().phase, "approval_ready");

  const approval = simulator.authorizePrepared();
  assert.equal(approval.data.authorized, true);
  const executed = simulator.executeApprovedSimulation({ draftId: revisedDraft.data.id, idempotencyKey: "run-once-042" });
  assert.equal(executed.ok, true);
  assert.equal(executed.data.idempotentReplay, false);
  assert.equal(simulator.getState().phase, "completed");
  assert.equal(simulator.getState().approval.consumed, true);
  assert.deepEqual(simulator.getState().executed, { hospital: true, shelter: true, water: true, homes: false });

  const replay = simulator.executeApprovedSimulation({ draftId: revisedDraft.data.id, idempotencyKey: "run-once-042" });
  assert.equal(replay.data.idempotentReplay, true);
  assert.equal(replay.data.receiptId, executed.data.receiptId);
  assert.equal(Object.keys(simulator.getState().receipts).length, 1);

  const receipt = simulator.getExecutionReceipt({ receiptId: executed.data.receiptId });
  assert.equal(receipt.data.approval.actor, "human");
  assert.equal(receipt.data.synthetic, true);
  assert.equal(receipt.data.finalMetrics.reserve, 26);

  clock += 61_000;
});

test("fails closed on unsafe switching, bad order, and stale state", () => {
  const simulator = createGridSimulator({ now: () => 1_800_000_000_000 });
  const unsafe = simulate(simulator, ["OPEN_S3", "START_G1", "CLOSE_S3", "CLOSE_HOSPITAL"]);
  assert.equal(unsafe.ok, false);
  assert.equal(unsafe.error.code, "fault_energization");
  assert.equal(Object.keys(simulator.getState().candidates).length, 0);

  const badOrder = simulate(simulator, ["START_G1", "OPEN_S3", "CLOSE_HOSPITAL"]);
  assert.equal(badOrder.error.code, "invalid_sequence");

  const loadBeforeGeneration = simulate(simulator, ["OPEN_S3", "CLOSE_HOSPITAL", "START_G1"]);
  assert.equal(loadBeforeGeneration.error.code, "invalid_sequence");

  const duplicateOperation = simulate(simulator, ["OPEN_S3", "START_G1", "CLOSE_HOSPITAL", "CLOSE_HOSPITAL"]);
  assert.equal(duplicateOperation.error.code, "invalid_sequence");

  simulator.setPriority("water", "critical");
  const stale = simulator.simulateRestorationPlan({ objectives: [], operations: PLAN_LIBRARY.critical, expectedStateVersion: 1 });
  assert.equal(stale.error.code, "stale_state");
});

test("a state change revokes an exact page-held approval", () => {
  const simulator = createGridSimulator({ now: () => 1_800_000_000_000, randomId: () => "never-exposed" });
  const candidate = simulate(simulator, PLAN_LIBRARY.resilient);
  const draft = simulator.setDraftPlan({ candidateId: candidate.data.id, expectedStateVersion: 1 });
  simulator.prepareSimulatedExecution({ draftId: draft.data.id, expectedStateVersion: 2 });
  simulator.authorizePrepared();
  assert.ok(simulator.getState().approval);

  simulator.setPriority("water", "critical");
  assert.equal(simulator.getState().approval, null);
  const blocked = simulator.executeApprovedSimulation({ draftId: draft.data.id, idempotencyKey: "revoked-approval" });
  assert.equal(blocked.error.code, "approval_required");
});
