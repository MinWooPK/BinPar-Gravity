import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const directory = mkdtempSync(join(tmpdir(), "tutor-request-tests-"));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "src/features/gravity/application/tutorRequest.ts",
  "--outDir", directory,
  "--module", "commonjs",
  "--target", "es2017",
  "--strict",
  "--skipLibCheck",
]);
const require = createRequire(import.meta.url);
const { isTutorRequest } = require(join(directory, "application/tutorRequest.js"));
const { challenges } = require(join(directory, "domain/gravitation.js"));
const locales = ["es", "en", "fr"];
const validRequest = () => ({
  locale: "es",
  mode: "explain",
  parameters: { mass1: 40e12, mass2: 40e12, distance: 8000 },
});

test("accepts every configured locale and tutor mode", () => {
  for (const locale of locales) {
    for (const mode of ["explain", "simplify", "example"]) {
      assert.equal(isTutorRequest({ ...validRequest(), locale, mode }, locales), true);
    }
  }
  assert.equal(isTutorRequest(validRequest(), ["en"]), false);
  assert.equal(isTutorRequest({ ...validRequest(), locale: "en" }, ["en"]), true);
});

test("rejects malformed requests, unsupported locales and unknown modes", () => {
  for (const value of [undefined, null, false, 1, "request", [], {}]) {
    assert.equal(isTutorRequest(value, locales), false);
  }
  for (const locale of [undefined, null, 1, ["es"], "de", "ES", " es"]) {
    assert.equal(isTutorRequest({ ...validRequest(), locale }, locales), false);
  }
  for (const mode of [undefined, null, 1, "", "EXPLAIN", "explain ", "other", {}]) {
    assert.equal(isTutorRequest({ ...validRequest(), mode }, locales), false);
  }
});

test("accepts inclusive mass and distance limits without normalizing values", () => {
  for (const key of ["mass1", "mass2"]) {
    for (const value of [1e13, 1e14]) {
      const request = validRequest();
      request.parameters[key] = value;
      assert.equal(isTutorRequest(request, locales), true);
      assert.equal(request.parameters[key], value);
    }
  }
  for (const distance of [5000, 20000]) {
    const request = validRequest();
    request.parameters.distance = distance;
    assert.equal(isTutorRequest(request, locales), true);
  }
});

test("rejects missing, non-finite, coerced and out-of-range physical parameters", () => {
  for (const parameters of [undefined, null, [], "parameters", {}]) {
    assert.equal(isTutorRequest({ ...validRequest(), parameters }, locales), false);
  }
  for (const key of ["mass1", "mass2", "distance"]) {
    const [minimum, maximum] = key === "distance" ? [5000, 20000] : [1e13, 1e14];
    for (const value of [undefined, null, false, `${minimum}`, [minimum], NaN, Infinity, -Infinity, minimum - 1, maximum + 1]) {
      const request = validRequest();
      request.parameters[key] = value;
      assert.equal(isTutorRequest(request, locales), false, `${key}: ${String(value)}`);
    }
  }
});

test("accepts optional attempts for every existing challenge and prediction", () => {
  assert.equal(isTutorRequest({ ...validRequest(), attempt: undefined }, locales), true);
  for (const { id: challenge } of challenges) {
    for (const prediction of ["same", "double", "four", "quarter"]) {
      const attempt = { challenge, prediction };
      assert.equal(isTutorRequest({ ...validRequest(), attempt }, locales), true);
    }
  }
});

test("rejects malformed attempts and requires an exact challenge identifier", () => {
  for (const attempt of [null, false, "attempt", [], {}, { challenge: "oneMass" }, { prediction: "same" }]) {
    assert.equal(isTutorRequest({ ...validRequest(), attempt }, locales), false);
  }
  for (const challenge of ["unknown", "ONEMASS", ["oneMass"], undefined, null]) {
    const attempt = { challenge, prediction: "same" };
    assert.equal(isTutorRequest({ ...validRequest(), attempt }, locales), false);
  }
  for (const prediction of [undefined, null, 1, "other", "SAME", "same "]) {
    const attempt = { challenge: "oneMass", prediction };
    assert.equal(isTutorRequest({ ...validRequest(), attempt }, locales), false);
  }
});

test("preserves the existing string coercion for modes and predictions", () => {
  const request = {
    ...validRequest(),
    mode: ["simplify"],
    attempt: { challenge: "oneMass", prediction: ["double"] },
  };
  const before = JSON.stringify(request);
  assert.equal(isTutorRequest(request, locales), true);
  assert.equal(JSON.stringify(request), before);
  assert.equal(isTutorRequest({ ...request, mode: ["explain", "example"] }, locales), false);
});

test("allows existing extra fields and validates without mutating the payload", () => {
  const request = {
    ...validRequest(),
    parameters: Object.freeze({ ...validRequest().parameters, label: "experiment" }),
    attempt: Object.freeze({ challenge: "distance", prediction: "quarter", label: "prediction" }),
    extra: "retained",
  };
  const before = JSON.stringify(request);
  Object.freeze(request);
  assert.equal(isTutorRequest(request, locales), true);
  assert.equal(JSON.stringify(request), before);
});
