export const OPERATION_IDS = [
  "OPEN_S3",
  "START_G1",
  "CLOSE_HOSPITAL",
  "CLOSE_SHELTER",
  "CLOSE_WATER",
  "CLOSE_HOMES",
  "CLOSE_S3"
];

export const PLAN_LIBRARY = {
  coverage: ["OPEN_S3", "START_G1", "CLOSE_HOSPITAL", "CLOSE_SHELTER", "CLOSE_HOMES"],
  resilient: ["OPEN_S3", "START_G1", "CLOSE_HOSPITAL", "CLOSE_SHELTER"],
  critical: ["OPEN_S3", "START_G1", "CLOSE_HOSPITAL", "CLOSE_SHELTER", "CLOSE_WATER"]
};

const LOADS = {
  hospital: { label: "Hospital", kw: 45, operation: "CLOSE_HOSPITAL" },
  shelter: { label: "Shelter", kw: 20, operation: "CLOSE_SHELTER" },
  water: { label: "Water pump", kw: 25, operation: "CLOSE_WATER" },
  homes: { label: "Homes", kw: 30, operation: "CLOSE_HOMES" }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function stableHash(value) {
  const input = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function initialState() {
  return {
    stateVersion: 1,
    incidentId: "STORM-042",
    phase: "incident_loaded",
    minimumReserve: 25,
    priorities: { hospital: "critical", shelter: "critical", water: "normal", homes: "normal" },
    fault: { feederId: "F1", isolatedBy: "S3", status: "faulted" },
    generation: { solarKw: 35, generatorKw: 80, generatorStatus: "standby" },
    battery: { capacityKwh: 60, stateOfChargePercent: 55 },
    candidates: {},
    draft: null,
    prepared: null,
    approval: null,
    executed: { hospital: false, shelter: false, water: false, homes: false },
    receipts: {},
    idempotency: {},
    ledger: []
  };
}

export function createGridSimulator({ now = () => Date.now(), randomId } = {}) {
  let state = initialState();
  const makeId = randomId || (() => globalThis.crypto?.randomUUID?.() || `local-${now()}`);

  function envelope({ ok = true, data = null, uiChanged = false, validNextActions = [], error = null } = {}) {
    return { ok, data: clone(data), stateVersion: state.stateVersion, uiChanged, validNextActions, error };
  }

  function addLedger(tool, actor, summary, before = state.stateVersion) {
    state.ledger.unshift({
      id: `L-${state.ledger.length + 1}`,
      at: new Date(now()).toISOString(),
      tool,
      actor,
      summary,
      before,
      after: state.stateVersion
    });
    state.ledger = state.ledger.slice(0, 30);
  }

  function stale(expectedStateVersion) {
    return envelope({
      ok: false,
      validNextActions: ["get_incident_state", "simulate_restoration_plan"],
      error: {
        code: "stale_state",
        message: `Expected state v${expectedStateVersion}; current state is v${state.stateVersion}. Re-read the incident before retrying.`,
        currentStateVersion: state.stateVersion
      }
    });
  }

  function checkVersion(expectedStateVersion) {
    return Number(expectedStateVersion) === state.stateVersion ? null : stale(expectedStateVersion);
  }

  function metricsFor(operations) {
    const restored = Object.entries(LOADS)
      .filter(([, load]) => operations.includes(load.operation))
      .map(([id]) => id);
    const critical = Object.entries(state.priorities).filter(([, priority]) => priority === "critical").map(([id]) => id);
    const missingCritical = critical.filter((id) => !restored.includes(id));
    const reserve = restored.includes("homes") ? 18 : restored.includes("water") ? 26 : 27;
    const restoredKw = restored.reduce((total, id) => total + LOADS[id].kw, 0);
    const faultIsolated = operations.includes("OPEN_S3") && !operations.includes("CLOSE_S3");
    const violations = [];
    if (!faultIsolated) violations.push("fault_energization");
    if (reserve < state.minimumReserve) violations.push("reserve_below_minimum");
    if (missingCritical.length) violations.push("critical_load_missing");
    return { restored, critical, missingCritical, reserve, restoredKw, faultIsolated, violations, valid: violations.length === 0 };
  }

  function getIncidentState(actor = "agent") {
    addLedger("get_incident_state", actor, "Read incident, priorities, and version");
    return envelope({
      data: {
        incidentId: state.incidentId,
        fault: state.fault,
        generation: state.generation,
        battery: state.battery,
        priorities: state.priorities,
        minimumReserve: state.minimumReserve,
        phase: state.phase
      },
      validNextActions: ["get_topology", "simulate_restoration_plan"]
    });
  }

  function getTopology({ detailLevel = "constraints" } = {}, actor = "agent") {
    addLedger("get_topology", actor, `Read ${detailLevel} topology`);
    return envelope({
      data: {
        detailLevel,
        nodes: [
          { id: "GRID", kind: "source", label: "Main grid", status: "faulted" },
          { id: "SOLAR", kind: "source", label: "Solar", availableKw: 35 },
          { id: "G1", kind: "generator", label: "Generator", availableKw: 80 },
          { id: "BAT", kind: "storage", label: "Battery", chargePercent: 55 },
          ...Object.entries(LOADS).map(([id, load]) => ({ id: id.toUpperCase(), kind: "load", label: load.label, demandKw: load.kw }))
        ],
        switches: [
          { id: "S1", role: "generator_tie", status: "open" },
          { id: "S2", role: "load_bus", status: "open" },
          { id: "S3", role: "fault_isolator", status: "open", constraint: "must_remain_open" }
        ],
        constraints: ["Never close S3 while F1 is faulted", "Restore every critical load", `Keep battery reserve at or above ${state.minimumReserve}%`]
      },
      validNextActions: ["simulate_restoration_plan"]
    });
  }

  function simulateRestorationPlan({ objectives = [], operations, expectedStateVersion } = {}, actor = "agent") {
    const versionError = checkVersion(expectedStateVersion);
    if (versionError) {
      addLedger("simulate_restoration_plan", actor, "Rejected stale simulation");
      return versionError;
    }
    if (!Array.isArray(operations) || operations.length < 1 || operations.some((operation) => !OPERATION_IDS.includes(operation))) {
      return envelope({ ok: false, error: { code: "invalid_sequence", message: "Use a non-empty sequence of documented operation IDs." } });
    }
    if (operations.includes("CLOSE_S3")) {
      addLedger("simulate_restoration_plan", actor, "Rejected unsafe S3 close");
      return envelope({
        ok: false,
        error: { code: "fault_energization", message: "CLOSE_S3 would energize faulted feeder F1. S3 must remain open." },
        validNextActions: ["get_topology", "simulate_restoration_plan"]
      });
    }
    if (operations[0] !== "OPEN_S3" || !operations.includes("START_G1")) {
      return envelope({ ok: false, error: { code: "invalid_sequence", message: "The sequence must isolate S3 first and start G1 before restoring loads." } });
    }
    const metrics = metricsFor(operations);
    const id = `C-${stableHash({ version: state.stateVersion, operations })}`;
    const label = operations.includes("CLOSE_HOMES") ? "Coverage plan" : operations.includes("CLOSE_WATER") ? "Critical-services plan" : "Resilient plan";
    const candidate = {
      id,
      label,
      sourceVersion: state.stateVersion,
      objectives,
      operations: [...operations],
      metrics,
      score: (metrics.valid ? 1000 : 0) + metrics.restoredKw + metrics.reserve - operations.length * 2
    };
    state.candidates[id] = candidate;
    addLedger("simulate_restoration_plan", actor, `Computed ${label}: ${metrics.valid ? "valid" : metrics.violations.join(", ")}`);
    return envelope({ data: candidate, uiChanged: true, validNextActions: ["simulate_restoration_plan", "compare_plans"] });
  }

  function comparePlans({ candidateIds } = {}, actor = "agent") {
    if (!Array.isArray(candidateIds) || candidateIds.length !== 2 || candidateIds.some((id) => !state.candidates[id])) {
      return envelope({ ok: false, error: { code: "unknown_candidate", message: "Provide exactly two candidate IDs returned by simulation." } });
    }
    const ranked = candidateIds.map((id) => state.candidates[id]).sort((left, right) => right.score - left.score);
    addLedger("compare_plans", actor, `Compared ${candidateIds.join(" and ")}`);
    return envelope({
      data: {
        recommendedCandidateId: ranked[0].id,
        ranked: ranked.map(({ id, label, score, metrics }) => ({ id, label, score, metrics })),
        rationale: ranked[0].metrics.valid
          ? `${ranked[0].label} satisfies every current constraint and ranks highest on reserve, critical-load coverage, and switching effort.`
          : "Neither candidate satisfies every current constraint; recompute before drafting."
      },
      uiChanged: true,
      validNextActions: ranked[0].metrics.valid ? ["set_draft_plan"] : ["simulate_restoration_plan"]
    });
  }

  function setDraftPlan({ candidateId, expectedStateVersion } = {}, actor = "agent") {
    const versionError = checkVersion(expectedStateVersion);
    if (versionError) return versionError;
    const candidate = state.candidates[candidateId];
    if (!candidate) return envelope({ ok: false, error: { code: "unknown_candidate", message: "Simulate this candidate first." } });
    if (candidate.sourceVersion !== state.stateVersion) return stale(candidate.sourceVersion);
    if (!candidate.metrics.valid) {
      return envelope({ ok: false, error: { code: candidate.metrics.violations[0], message: "Only a candidate satisfying all current constraints can become the draft." } });
    }
    const before = state.stateVersion;
    state.stateVersion += 1;
    state.phase = "draft_ready";
    state.approval = null;
    state.prepared = null;
    state.draft = {
      id: `D-${candidate.id.slice(2)}`,
      hash: stableHash({ candidateId, operations: candidate.operations, priorities: state.priorities, minimumReserve: state.minimumReserve }),
      stateVersion: state.stateVersion,
      candidate: clone(candidate)
    };
    addLedger("set_draft_plan", actor, `Previewed ${candidate.label}`, before);
    return envelope({ data: state.draft, uiChanged: true, validNextActions: ["validate_draft_plan", "prepare_simulated_execution"] });
  }

  function validateDraftPlan({ draftId, expectedStateVersion } = {}, actor = "agent") {
    const versionError = checkVersion(expectedStateVersion);
    if (versionError) {
      addLedger("validate_draft_plan", actor, "Rejected stale draft validation");
      return versionError;
    }
    if (!state.draft || state.draft.id !== draftId) return envelope({ ok: false, error: { code: "unknown_draft", message: "Select a current candidate as the draft first." } });
    if (state.draft.stateVersion !== state.stateVersion) return stale(state.draft.stateVersion);
    const metrics = metricsFor(state.draft.candidate.operations);
    addLedger("validate_draft_plan", actor, `Validated ${draftId}: ${metrics.valid ? "ready" : "blocked"}`);
    return envelope({
      ok: metrics.valid,
      data: { draftId, draftHash: state.draft.hash, metrics, approvalReady: metrics.valid },
      error: metrics.valid ? null : { code: metrics.violations[0], message: "Draft no longer satisfies current constraints." },
      validNextActions: metrics.valid ? ["prepare_simulated_execution"] : ["simulate_restoration_plan"]
    });
  }

  function prepareSimulatedExecution({ draftId, expectedStateVersion } = {}, actor = "agent") {
    const versionError = checkVersion(expectedStateVersion);
    if (versionError) return versionError;
    const validation = validateDraftPlan({ draftId, expectedStateVersion }, actor);
    if (!validation.ok) return validation;
    state.prepared = {
      draftId,
      draftHash: state.draft.hash,
      stateVersion: state.stateVersion,
      operations: [...state.draft.candidate.operations],
      status: "waiting_for_human"
    };
    state.approval = null;
    state.phase = "approval_ready";
    addLedger("prepare_simulated_execution", actor, `Prepared exact draft ${draftId} for human review`);
    return envelope({
      data: { ...state.prepared, approvalRequired: true },
      uiChanged: true,
      validNextActions: ["human_must_authorize_in_page"]
    });
  }

  function authorizePrepared(actor = "human") {
    if (!state.prepared || !state.draft || state.prepared.draftHash !== state.draft.hash || state.prepared.stateVersion !== state.stateVersion) {
      return envelope({ ok: false, error: { code: "stale_state", message: "Prepare the current exact draft before authorizing." } });
    }
    state.approval = {
      secret: makeId(),
      draftId: state.draft.id,
      draftHash: state.draft.hash,
      stateVersion: state.stateVersion,
      expiresAt: now() + 60_000,
      consumed: false
    };
    state.prepared.status = "authorized";
    state.phase = "authorized";
    addLedger("authorize_exact_draft", actor, `Authorized ${state.draft.id} for 60 seconds`);
    return envelope({ data: { authorized: true, expiresAt: state.approval.expiresAt }, uiChanged: true, validNextActions: ["execute_approved_simulation"] });
  }

  function executeApprovedSimulation({ draftId, idempotencyKey } = {}, actor = "agent") {
    if (typeof idempotencyKey !== "string" || idempotencyKey.length < 6) {
      return envelope({ ok: false, error: { code: "invalid_idempotency_key", message: "Provide a stable idempotency key of at least six characters." } });
    }
    if (state.idempotency[idempotencyKey]) {
      const receipt = state.receipts[state.idempotency[idempotencyKey]];
      addLedger("execute_approved_simulation", actor, `Idempotent replay returned ${receipt.id}`);
      return envelope({ data: { receiptId: receipt.id, idempotentReplay: true, finalMetrics: receipt.finalMetrics }, validNextActions: ["get_execution_receipt"] });
    }
    if (!state.draft || state.draft.id !== draftId || !state.approval || state.approval.consumed) {
      addLedger("execute_approved_simulation", actor, "Blocked execution without page approval");
      return envelope({ ok: false, error: { code: "approval_required", message: "The human must authorize this exact draft using the visible page button." }, validNextActions: ["prepare_simulated_execution", "human_must_authorize_in_page"] });
    }
    if (state.approval.expiresAt <= now()) {
      state.approval = null;
      state.prepared.status = "expired";
      return envelope({ ok: false, error: { code: "approval_expired", message: "The page-held approval expired. Ask the human to review and authorize again." } });
    }
    if (state.approval.draftId !== draftId || state.approval.draftHash !== state.draft.hash || state.approval.stateVersion !== state.stateVersion) {
      return envelope({ ok: false, error: { code: "stale_state", message: "The approved draft no longer matches page state." } });
    }
    const before = state.stateVersion;
    const metrics = metricsFor(state.draft.candidate.operations);
    for (const load of metrics.restored) state.executed[load] = true;
    state.generation.generatorStatus = "running";
    state.battery.stateOfChargePercent = metrics.reserve;
    state.approval.consumed = true;
    state.prepared.status = "executed";
    state.stateVersion += 1;
    state.phase = "completed";
    const receiptId = `R-${String(Object.keys(state.receipts).length + 104).padStart(3, "0")}`;
    const receipt = {
      id: receiptId,
      incidentId: state.incidentId,
      approvedDraftId: state.draft.id,
      approvedDraftHash: state.draft.hash,
      operations: [...state.draft.candidate.operations],
      finalMetrics: metrics,
      stateVersionBefore: before,
      stateVersionAfter: state.stateVersion,
      approval: { actor: "human", consumed: true },
      synthetic: true
    };
    state.receipts[receiptId] = receipt;
    state.idempotency[idempotencyKey] = receiptId;
    addLedger("execute_approved_simulation", actor, `Executed exact approved draft once; receipt ${receiptId}`, before);
    return envelope({ data: { receiptId, idempotentReplay: false, finalMetrics: metrics }, uiChanged: true, validNextActions: ["get_execution_receipt"] });
  }

  function getExecutionReceipt({ receiptId } = {}, actor = "agent") {
    const receipt = state.receipts[receiptId];
    if (!receipt) return envelope({ ok: false, error: { code: "unknown_receipt", message: "Use the receipt ID returned by execution." } });
    addLedger("get_execution_receipt", actor, `Read ${receiptId}`);
    return envelope({ data: receipt, validNextActions: ["reset_training_scenario"] });
  }

  function setPriority(loadId, priority, actor = "human") {
    if (!LOADS[loadId] || !["critical", "normal"].includes(priority)) {
      return envelope({ ok: false, error: { code: "invalid_priority", message: "Choose a known load and critical or normal." } });
    }
    const before = state.stateVersion;
    state.priorities[loadId] = priority;
    state.stateVersion += 1;
    state.draft && (state.draft.stale = true);
    state.approval = null;
    if (state.prepared) state.prepared.status = "revoked_by_state_change";
    state.phase = "incident_loaded";
    addLedger("set_load_priority", actor, `${LOADS[loadId].label} is now ${priority}; drafts and approvals invalidated`, before);
    return envelope({ data: { loadId, priority }, uiChanged: true, validNextActions: ["validate_draft_plan", "get_incident_state"] });
  }

  function reset(actor = "human") {
    state = initialState();
    addLedger("reset_training_scenario", actor, "Restored deterministic seed incident");
    return envelope({ data: { reset: true }, uiChanged: true, validNextActions: ["get_incident_state"] });
  }

  return {
    getState: () => clone(state),
    getIncidentState,
    getTopology,
    simulateRestorationPlan,
    comparePlans,
    setDraftPlan,
    validateDraftPlan,
    prepareSimulatedExecution,
    authorizePrepared,
    executeApprovedSimulation,
    getExecutionReceipt,
    setPriority,
    reset
  };
}
