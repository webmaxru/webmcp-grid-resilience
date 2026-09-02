import { OPERATION_IDS } from "./grid-core.mjs";

const versionSchema = {
  expectedStateVersion: {
    type: "integer",
    minimum: 1,
    description: "Exact stateVersion returned by the latest page read. The tool fails closed when stale."
  }
};

export function createGridToolDefinitions(simulator, onUiChange = () => {}) {
  const run = (method) => async (input = {}, options = {}) => {
    options.signal?.throwIfAborted?.();
    const result = method(input, "agent");
    onUiChange();
    options.signal?.throwIfAborted?.();
    return result;
  };

  return [
    {
      name: "get_incident_state",
      title: "Read incident state",
      description: "Read the seeded outage, human-set load priorities, generation, battery reserve target, phase, and current state version before planning.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: run(() => simulator.getIncidentState("agent"))
    },
    {
      name: "get_topology",
      title: "Read microgrid topology",
      description: "Read stable semantic node and switch IDs plus safety constraints. Use this instead of guessing from SVG positions.",
      inputSchema: {
        type: "object",
        properties: {
          detailLevel: { type: "string", enum: ["summary", "constraints"], description: "Choose constraints when planning switch operations." }
        },
        required: ["detailLevel"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: run((input) => simulator.getTopology(input, "agent"))
    },
    {
      name: "simulate_restoration_plan",
      title: "Simulate a restoration plan",
      description: "Evaluate one ordered synthetic switching plan against the fault, current critical loads, and reserve target. This computes a candidate only and never executes grid state.",
      inputSchema: {
        type: "object",
        properties: {
          objectives: {
            type: "array",
            items: { type: "string", enum: ["restore_critical_loads", "maximize_reserve", "maximize_total_load", "minimize_operations"] },
            description: "Planning objectives to record with this candidate."
          },
          operations: {
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: { type: "string", enum: OPERATION_IDS },
            description: "Ordered semantic operations. OPEN_S3 must be first and CLOSE_S3 is forbidden while feeder F1 is faulted."
          },
          ...versionSchema
        },
        required: ["objectives", "operations", "expectedStateVersion"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: run((input) => simulator.simulateRestorationPlan(input, "agent"))
    },
    {
      name: "compare_plans",
      title: "Compare restoration plans",
      description: "Compare exactly two previously simulated candidate IDs using derived safety, reserve, critical-load coverage, total load, and switching effort.",
      inputSchema: {
        type: "object",
        properties: {
          candidateIds: { type: "array", minItems: 2, maxItems: 2, uniqueItems: true, items: { type: "string" }, description: "Two candidate IDs returned by simulate_restoration_plan." }
        },
        required: ["candidateIds"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: run((input) => simulator.comparePlans(input, "agent"))
    },
    {
      name: "set_draft_plan",
      title: "Preview a candidate",
      description: "Place one valid current candidate into the visible draft preview. This is reversible and does not execute switching operations.",
      inputSchema: {
        type: "object",
        properties: {
          candidateId: { type: "string", description: "Valid candidate ID returned by simulation." },
          ...versionSchema
        },
        required: ["candidateId", "expectedStateVersion"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false },
      execute: run((input) => simulator.setDraftPlan(input, "agent"))
    },
    {
      name: "validate_draft_plan",
      title: "Validate the current draft",
      description: "Validate the exact visible draft against the current version, human priorities, fault isolation, and reserve target. Returns stale_state when the human changed the page.",
      inputSchema: {
        type: "object",
        properties: {
          draftId: { type: "string", description: "Draft ID returned by set_draft_plan." },
          ...versionSchema
        },
        required: ["draftId", "expectedStateVersion"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: run((input) => simulator.validateDraftPlan(input, "agent"))
    },
    {
      name: "prepare_simulated_execution",
      title: "Prepare exact switching review",
      description: "Populate the visible review drawer with the exact current synthetic operations. This does not authorize or execute them; a human page click remains required.",
      inputSchema: {
        type: "object",
        properties: {
          draftId: { type: "string", description: "Current validated draft ID." },
          ...versionSchema
        },
        required: ["draftId", "expectedStateVersion"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false },
      execute: run((input) => simulator.prepareSimulatedExecution(input, "agent"))
    },
    {
      name: "execute_approved_simulation",
      title: "Execute an approved simulation",
      description: "Execute the exact prepared synthetic draft once, only after the human used the visible page authorization. The page checks and consumes its private approval grant.",
      inputSchema: {
        type: "object",
        properties: {
          draftId: { type: "string", description: "Exact draft ID shown in the approval drawer." },
          idempotencyKey: { type: "string", minLength: 6, maxLength: 80, description: "Stable unique key; retries return the first receipt without duplicate execution." }
        },
        required: ["draftId", "idempotencyKey"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false },
      execute: run((input) => simulator.executeApprovedSimulation(input, "agent"))
    },
    {
      name: "get_execution_receipt",
      title: "Read execution receipt",
      description: "Read the attributable synthetic execution receipt, including exact approved draft hash, operations, before/after versions, and final metrics.",
      inputSchema: {
        type: "object",
        properties: { receiptId: { type: "string", description: "Receipt ID returned by approved execution." } },
        required: ["receiptId"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: run((input) => simulator.getExecutionReceipt(input, "agent"))
    }
  ];
}

export async function registerWebMcpTools(tools, modelContext) {
  if (!modelContext) throw new Error("WebMCP is unavailable in this browser context.");
  const controller = new AbortController();
  const registeredNames = [];

  for (const tool of tools) {
    try {
      await modelContext.registerTool(tool, { signal: controller.signal });
      registeredNames.push(tool.name);
    } catch (error) {
      console.error(`Failed to register WebMCP tool "${tool.name}":`, error);
    }
  }

  return {
    registeredNames,
    dispose() {
      for (const name of [...registeredNames].reverse()) {
        try {
          modelContext.unregisterTool?.(name);
        } catch {
          // Ignore already-cleaned registrations during the browser transition window.
        }
      }
      controller.abort();
    }
  };
}
