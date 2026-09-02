import test from "node:test";
import assert from "node:assert/strict";
import { createGridSimulator } from "../src/grid-core.mjs";
import { createGridToolDefinitions, registerWebMcpTools } from "../src/webmcp.mjs";

class FakeModelContext {
  constructor() {
    this.tools = new Map();
    this.signals = new Map();
  }
  async registerTool(tool, options = {}) {
    if (this.tools.has(tool.name)) throw new DOMException("Duplicate", "InvalidStateError");
    this.tools.set(tool.name, tool);
    this.signals.set(tool.name, options.signal);
    options.signal?.addEventListener("abort", () => this.tools.delete(tool.name), { once: true });
  }
  unregisterTool(name) {
    this.tools.delete(name);
  }
}

test("registers the nine imperative WebMCP tools with schemas, annotations, and lifecycle cleanup", async () => {
  const simulator = createGridSimulator();
  let rendered = 0;
  const definitions = createGridToolDefinitions(simulator, () => { rendered += 1; });
  const modelContext = new FakeModelContext();
  const registration = await registerWebMcpTools(definitions, modelContext);

  assert.equal(definitions.length, 9);
  assert.equal(modelContext.tools.size, 9);
  assert.deepEqual(registration.registeredNames, definitions.map((tool) => tool.name));
  for (const tool of definitions) {
    assert.match(tool.name, /^[A-Za-z0-9_.-]{1,128}$/);
    assert.ok(tool.description.length > 20);
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.execute, "function");
    assert.equal(typeof tool.annotations.readOnlyHint, "boolean");
  }

  const controller = new AbortController();
  const read = await modelContext.tools.get("get_incident_state").execute({}, { signal: controller.signal });
  assert.equal(read.ok, true);
  assert.equal(read.stateVersion, 1);
  assert.equal(rendered, 1);

  registration.dispose();
  assert.equal(modelContext.tools.size, 0);
  assert.ok([...modelContext.signals.values()].every((signal) => signal.aborted));
});

test("execution callbacks honor their independent cancellation signal", async () => {
  const definitions = createGridToolDefinitions(createGridSimulator());
  const read = definitions.find((tool) => tool.name === "get_incident_state");
  const controller = new AbortController();
  controller.abort(new Error("cancelled by caller"));
  await assert.rejects(() => read.execute({}, { signal: controller.signal }), /cancelled by caller/);
});
