import { OPERATION_IDS } from "./grid-core.mjs";

const versionSchema = {
  expectedStateVersion: {
    type: "integer",
    minimum: 1,
    description: "Exact stateVersion returned by the latest page read. The tool fails closed when stale."
  }
};

function validateValue(value, schema, path) {
  if (schema.type === "string" && typeof value !== "string") return `${path} must be a string.`;
  if (schema.type === "integer" && !Number.isInteger(value)) return `${path} must be an integer.`;
  if (schema.type === "boolean" && typeof value !== "boolean") return `${path} must be a boolean.`;
  if (schema.type === "array" && !Array.isArray(value)) return `${path} must be an array.`;
  if (schema.enum && !schema.enum.includes(value)) return `${path} must be one of: ${schema.enum.join(", ")}.`;
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) return `${path} must contain at least ${schema.minLength} characters.`;
    if (schema.maxLength !== undefined && value.length > schema.maxLength) return `${path} must contain at most ${schema.maxLength} characters.`;
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) return `${path} has an invalid format.`;
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    return `${path} must be at least ${schema.minimum}.`;
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) return `${path} must contain at least ${schema.minItems} items.`;
    if (schema.maxItems !== undefined && value.length > schema.maxItems) return `${path} must contain at most ${schema.maxItems} items.`;
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      return `${path} must not contain duplicate items.`;
    }
    if (schema.items) {
      for (let index = 0; index < value.length; index += 1) {
        const error = validateValue(value[index], schema.items, `${path}[${index}]`);
        if (error) return error;
      }
    }
  }
  return null;
}

function validateInput(input, schema) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "Input must be an object.";
  const properties = schema.properties || {};
  for (const required of schema.required || []) {
    if (!Object.hasOwn(input, required)) return `${required} is required.`;
  }
  if (schema.additionalProperties === false) {
    const unexpected = Object.keys(input).find((key) => !Object.hasOwn(properties, key));
    if (unexpected) return `${unexpected} is not an accepted property.`;
  }
  for (const [key, value] of Object.entries(input)) {
    if (!Object.hasOwn(properties, key)) continue;
    const error = validateValue(value, properties[key], key);
    if (error) return error;
  }
  return null;
}

export function createGridToolDefinitions(simulator, onUiChange = () => {}) {
  const run = (method) => async (input = {}, options = {}) => {
    options.signal?.throwIfAborted?.();
    const result = method(input, "agent");
    onUiChange();
    options.signal?.throwIfAborted?.();
    return result;
  };

  const tools = [
    {
      name: "get_incident_state",
      title: "Read incident state",
      description: "Read the seeded outage, human-set load priorities, generation, battery reserve target, phase, and current state version before planning.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
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
      annotations: { readOnlyHint: false },
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
      annotations: { readOnlyHint: false },
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
      annotations: { readOnlyHint: false },
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
      annotations: { readOnlyHint: false },
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
      annotations: { readOnlyHint: false },
      execute: run((input) => simulator.getExecutionReceipt(input, "agent"))
    }
  ];

  return tools.map((tool) => {
    const execute = tool.execute;
    return {
      ...tool,
      async execute(input = {}, options = {}) {
        options.signal?.throwIfAborted?.();
        const validationError = validateInput(input, tool.inputSchema);
        if (validationError) {
          return {
            ok: false,
            data: null,
            stateVersion: simulator.getState().stateVersion,
            uiChanged: false,
            validNextActions: [],
            error: { code: "invalid_input", message: `Invalid tool input: ${validationError}` }
          };
        }
        return execute(input, options);
      }
    };
  });
}

export async function registerWebMcpTools(tools, modelContext) {
  if (!modelContext) throw new Error("WebMCP is unavailable in this browser context.");
  const controller = new AbortController();
  const registeredNames = [];
  const errors = [];

  for (const tool of tools) {
    try {
      await modelContext.registerTool(tool, { signal: controller.signal });
      registeredNames.push(tool.name);
    } catch (error) {
      errors.push({ name: tool.name, message: error instanceof Error ? error.message : String(error) });
      console.error(`Failed to register WebMCP tool "${tool.name}":`, error);
    }
  }

  return {
    registeredNames,
    errors,
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
