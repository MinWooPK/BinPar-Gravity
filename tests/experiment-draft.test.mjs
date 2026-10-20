import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const directory = mkdtempSync(join(tmpdir(), "manual-experiment-"));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "src/features/three-body/application/experimentDraft.ts",
  "src/features/three-body/application/experimentConfiguration.ts",
  "--outDir", directory, "--rootDir", "src", "--module", "commonjs",
  "--target", "es2022", "--strict", "--skipLibCheck",
]);
const require = createRequire(import.meta.url);
const load = name => require(join(directory, "features/three-body/application", `${name}.js`));
const { createExperimentDraftState: initial, experimentDraftReducer: reduce, parseExperimentDraft: parse } = load("experimentDraft");
const { experimentConfigurationError: error } = load("experimentConfiguration");

test("manual draft retains edits and partial numbers when selecting another body", () => {
  let state = initial();
  state = reduce(state, { type: "body", index: 1, key: "mass", value: "3" });
  state = reduce(state, { type: "body", index: 1, key: "vx", value: "0.5" });
  state = reduce(state, { type: "common", key: "gravity", value: "1e" });
  const draft = state.draft, revision = state.revision;
  state = reduce(state, { type: "select", index: 2 });
  assert.strictEqual(state.draft, draft);
  assert.equal(state.revision, revision, "Selection does not invalidate the simulation");
  assert.equal(error(parse(state.draft)), "invalidNumber");
  state = reduce(state, { type: "common", key: "gravity", value: "2" });
  assert.equal(error(parse(state.draft)), null);
  assert.equal(parse(state.draft).bodies[1].mass, 3);
  assert.equal(parse(state.draft).bodies[1].vx, 0.5);
});

test("manual validation retains duration, mass and close-encounter protections", () => {
  const base = initial();
  for (const [action, expected] of [
    [{ type: "common", key: "duration", value: "101" }, "invalidDurationLimit"],
    [{ type: "common", key: "gravity", value: "0" }, "invalidGravity"],
    [{ type: "body", index: 0, key: "mass", value: "-1" }, "invalidMass"],
    [{ type: "body", index: 0, key: "x", value: "text" }, "invalidNumber"],
  ]) assert.equal(error(parse(reduce(base, action).draft)), expected);
  let overlap = reduce(base, { type: "body", index: 1, key: "x", value: "1" });
  overlap = reduce(overlap, { type: "body", index: 1, key: "y", value: "0" });
  assert.equal(error(parse(overlap.draft)), "tooClose");
});

test("reset restores manual defaults and obsolete AI actions cannot mutate the draft", () => {
  const base = initial();
  assert.strictEqual(reduce(base, { type: "proposal", expectedRevision: 0, proposal: {} }), base);
  const changed = reduce(base, { type: "common", key: "duration", value: "20" });
  const reset = reduce(changed, { type: "reset" });
  assert.deepEqual(reset.draft, base.draft);
  assert.equal(reset.selectedBody, 0);
  assert.ok(reset.revision > changed.revision);
});
