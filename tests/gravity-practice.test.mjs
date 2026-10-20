import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
const directory = mkdtempSync(join(tmpdir(), "practice-tests-"));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "src/features/gravity/application/practice/session.ts",
  "src/features/ai/infrastructure/requestGuard.ts",
  "src/features/gravity/infrastructure/practice/openaiPractice.ts",
  "src/features/gravity/infrastructure/practice/sessionToken.ts",
  "--outDir",
  directory,
  "--rootDir",
  "src",
  "--module",
  "commonjs",
  "--target",
  "es2022",
  "--lib",
  "es2022,dom",
  "--strict",
  "--skipLibCheck",
]);
const require = createRequire(import.meta.url),
  Module = require("node:module"),
  originalLoad = Module._load;
Module._load = function (name, ...args) {
  return name === "server-only" ? {} : originalLoad.call(this, name, ...args);
};
const load = (name) =>
  require(join(directory, "features/gravity", name + ".js"));
const {
  expectedAnswer,
  evaluateAnswer,
  withinTolerance,
  numericAnswer,
  parsePracticeNumber,
} = load("domain/practice/evaluation");
const { gravitationalForce } = load("domain/gravitation");
const { nextPlan, learningEvidence } = load("application/practice/adaptation");
const { parsePracticeRequest, isDefinition } = load(
  "application/practice/validation",
);
const { startPractice, nextQuestion, checkQuestion } = load(
  "application/practice/session",
);
const { sealSession, openSession } = load(
  "infrastructure/practice/sessionToken",
);
const { generateQuestion, explainAttempt, generateReport, hintsFor } = load(
  "infrastructure/practice/openaiPractice",
);
Module._load = originalLoad;
const q = (concept, extra = {}) => ({
  concept,
  difficulty: 1,
  a: 40,
  b: 40,
  r: 8,
  exponent: -9,
  scene: "objects",
  id: "question",
  number: 1,
  hint: "formula",
  reinforcement: false,
  ...extra,
});
const answer = (value, exponent = "") => ({
  value: String(value),
  exponent: String(exponent),
});
const attempt = (concept, correct = false) =>
  evaluateAnswer(
    q(concept),
    answer(correct ? expectedAnswer(q(concept)) : "0"),
    false,
  );

test("SI conversions, squared distance, powers and domain gravity are deterministic", () => {
  assert.equal(expectedAnswer(q("km", { a: 0.01 })), 10);
  assert.equal(expectedAnswer(q("cm", { a: 500 })), 5);
  assert.equal(expectedAnswer(q("tonnes", { a: 0.04 })), 40);
  assert.equal(expectedAnswer(q("square", { a: 8 })), 64);
  assert.ok(
    withinTolerance(
      expectedAnswer(q("power", { a: 1.33, exponent: -9 })),
      1.33e-9,
    ),
  );
  const force = q("force", { difficulty: 3, a: 0.04, r: 0.008 });
  assert.equal(
    expectedAnswer(force),
    gravitationalForce({ mass1: 40, mass2: 40, distance: 8 }),
  );
});
test("scientific editor supports comma, dot, negative exponents, finite values and rounding", () => {
  assert.ok(withinTolerance(numericAnswer(answer("1,33", -9), true), 1.33e-9));
  assert.equal(parsePracticeNumber("1.33e-9"), 1.33e-9);
  for (const value of [
    "",
    "NaN",
    "Infinity",
    "1,2.3",
    "1e999",
    "12 kg",
    "0x10",
  ])
    assert.equal(parsePracticeNumber(value), null);
  for (const exp of ["", "1.5", "31", "NaN"])
    assert.equal(numericAnswer(answer("1.3", exp), true), null);
  assert.ok(withinTolerance(1.67e-9, 1.668575e-9));
  assert.equal(withinTolerance(0, 1.668575e-9), false);
  assert.equal(
    evaluateAnswer(q("force"), answer("1,67", -9), false).correct,
    true,
  );
});
test("theory uses verified answers and detects distance versus mass confusion", () => {
  for (const [concept, correct] of [
    ["attraction", "attract"],
    ["mutual", "equal"],
    ["mass", "double"],
    ["distance", "quarter"],
    ["reasoning", "quarter"],
  ])
    assert.equal(
      evaluateAnswer(q(concept), answer(correct), false).correct,
      true,
    );
  assert.equal(
    evaluateAnswer(q("distance"), answer("half"), false).error,
    "distanceSquared",
  );
  assert.equal(
    evaluateAnswer(q("mass"), answer("four"), false).error,
    "massLinear",
  );
  assert.throws(() => evaluateAnswer(q("mass"), answer("invented"), false));
});
test("common numerical error matches are evidence, not inferred learner beliefs", () => {
  assert.equal(
    evaluateAnswer(q("km", { a: 0.01 }), answer("0,01"), false).error,
    "unconverted",
  );
  assert.equal(
    evaluateAnswer(q("tonnes", { a: 0.04 }), answer("0.04"), false).error,
    "unconverted",
  );
  assert.equal(
    evaluateAnswer(q("square", { a: 8 }), answer(8), false).error,
    "square",
  );
  assert.equal(
    evaluateAnswer(q("power", { a: 1.33 }), answer(1.33, 9), false).error,
    "exponentSign",
  );
  const force = q("force", { difficulty: 2, r: 0.008 });
  assert.equal(
    evaluateAnswer(
      force,
      answer(expectedAnswer(q("force", { r: 0.008 })), 0),
      false,
    ).error,
    "km",
  );
  assert.equal(
    evaluateAnswer(q("force"), answer(expectedAnswer(q("force")) * 8, 0), false)
      .error,
    "distanceSquared",
  );
  assert.equal(evaluateAnswer(q("force"), answer(5, 0), false).error, null);
});
test("difficulty changes gradually; errors produce simpler reinforcement within ten questions", () => {
  const incorrect = evaluateAnswer(
    q("distance", { difficulty: 3 }),
    answer("half"),
    true,
  );
  assert.deepEqual(nextPlan([incorrect]), {
    allowed: ["square"],
    difficulty: 2,
    reinforcement: true,
  });
  const correct = evaluateAnswer(q("square"), answer(1600), false);
  assert.equal(nextPlan([correct]).difficulty, 1);
  assert.equal(nextPlan([correct, correct]).difficulty, 2);
  const many = Array.from({ length: 8 }, () =>
    evaluateAnswer(q("attraction"), answer("repel"), false),
  );
  assert.deepEqual(nextPlan(many).allowed, ["km", "tonnes"]);
  assert.throws(() => nextPlan([...many, correct, correct]));
});
test("session checks exactly ten answers, counts hints and rejects duplicate correction or skipping", async () => {
  const generator = {
    question: async (history) =>
      q(nextPlan(history).allowed[0], {
        number: history.length + 1,
        difficulty: nextPlan(history).difficulty,
      }),
    explanation: async () => ({ explanation: "Explanation", steps: ["Step"] }),
    report: async (history) => {
      assert.equal(history.length, 10);
      return {
        summary: "Summary",
        strengths: [],
        review: [],
        recommendations: [{ stage: "gravity-understanding", text: "Units" }],
      };
    },
  };
  let session = await startPractice("es", generator);
  await assert.rejects(() => nextQuestion(session, generator));
  for (let n = 0; n < 5; n++) {
    const expected = expectedAnswer(session.question);
    const result = await checkQuestion(
      session,
      answer(expected, 0),
      n === 0,
      generator,
    );
    assert.equal(result.session.history.length, n + 1);
    assert.equal(!!result.report, n === 9);
    await assert.rejects(() =>
      checkQuestion(result.session, answer(expected, 0), false, generator),
    );
    session =
      n === 9 ? result.session : await nextQuestion(result.session, generator);
  }
  assert.equal(session.phase, "complete");
  assert.equal(learningEvidence(session.history).score, 10);
  assert.equal(learningEvidence(session.history).hints, 1);
  await assert.rejects(() => nextQuestion(session, generator));
});
test("request validation rejects client scores, solutions, arbitrary actions and oversized tokens", () => {
  assert.ok(parsePracticeRequest({ action: "start", locale: "fr" }));
  assert.ok(
    parsePracticeRequest({
      action: "answer",
      token: "opaque",
      answer: answer("1,67", -9),
      usedHint: true,
    }),
  );
  for (const value of [
    { action: "start", locale: "es", score: 10 },
    {
      action: "answer",
      token: "x",
      answer: answer(2),
      usedHint: true,
      correct: true,
    },
    { action: "next", token: "x".repeat(30001) },
    { action: "execute", token: "x" },
  ])
    assert.equal(parsePracticeRequest(value), null);
  assert.equal(isDefinition({ ...q("force"), answer: 4 }), false);
});
test("encrypted session rejects tampering and expiry and hides question history", () => {
  const old = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key-not-a-secret";
  try {
    const session = {
      locale: "es",
      expires: Date.now() + 60000,
      history: [attempt("square")],
      question: q("force"),
      phase: "question",
    };
    const token = sealSession(session);
    assert.deepEqual(openSession(token), session);
    assert.equal(
      Buffer.from(token, "base64url").includes(Buffer.from("expected")),
      false,
    );
    const bytes = Buffer.from(token, "base64url");
    bytes[40] ^= 1;
    assert.throws(
      () => openSession(bytes.toString("base64url")),
      /invalid_session/,
    );
    assert.throws(
      () => openSession(sealSession({ ...session, expires: 1 })),
      /invalid_session/,
    );
  } finally {
    if (old === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = old;
  }
});
test("structured generation, hints, feedback and report validate model output and propagate failures", async () => {
  const original = globalThis.fetch;
  let output;
  const payloads = [];
  globalThis.fetch = async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    return Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
    });
  };
  try {
    output = {
      definition: {
        concept: "attraction",
        difficulty: 1,
        a: 32,
        b: 45,
        r: 9,
        exponent: -9,
        scene: "workshop",
      },
      hint: "attraction",
    };
    const generated = await generateQuestion([], "fr");
    assert.equal(generated.number, 1);
    assert.equal(generated.a, 32);
    assert.ok(hintsFor(generated.concept).includes(generated.hint));
    assert.equal(generated.expected, undefined);
    assert.equal(payloads[0].text.format.strict, true);
    assert.equal(payloads[0].store, false);
    output = { ...output, answer: "attract" };
    await assert.rejects(() => generateQuestion([], "es"));
    output = {
      explanation: "Use the squared distance.",
      steps: ["Square the distance."],
    };
    assert.equal(
      (
        await explainAttempt(
          evaluateAnswer(q("distance"), answer("half"), true),
          "en",
        )
      ).steps.length,
      1,
    );
    output = {
      summary: "Based on these answers.",
      strengths: [],
      review: ["Squares"],
      recommendations: [
        { stage: "gravity-understanding", text: "Review units" },
      ],
    };
    assert.equal(
      (
        await generateReport(
          Array.from({ length: 10 }, () => attempt("square")),
          "en",
        )
      ).recommendations[0].stage,
      "gravity-understanding",
    );
    output.recommendations[0].stage = "fake-route";
    await assert.rejects(() =>
      generateReport(
        Array.from({ length: 10 }, () => attempt("square")),
        "en",
      ),
    );
    globalThis.fetch = async () =>
      Response.json({ error: "failed" }, { status: 500 });
    await assert.rejects(() => generateQuestion([], "es"));
  } finally {
    globalThis.fetch = original;
  }
});

test("failed generation or explanation preserves the original session for retry", async () => {
  const session = {
    locale: "es",
    expires: Date.now() + 60000,
    history: [],
    question: q("mass"),
    phase: "question",
  };
  const original = JSON.stringify(session);
  await assert.rejects(() =>
    checkQuestion(session, answer("double"), false, {
      explanation: async () => {
        throw Error("network");
      },
    }),
  );
  assert.equal(JSON.stringify(session), original);
});

test("practice API enforces origin, configuration, authenticated history and no premature answers", async () => {
  const ts = require("typescript");
  const file = join(directory, "practice-route.cjs");
  writeFileSync(
    file,
    ts.transpileModule(readFileSync("src/app/api/practice/route.ts", "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  );
  const oldLoad = Module._load;
  Module._load = function (name, ...args) {
    if (name === "server-only") return {};
    if (name.startsWith("@/"))
      return require(join(directory, name.slice(2) + ".js"));
    return oldLoad.call(this, name, ...args);
  };
  const { POST } = require(file);
  Module._load = oldLoad;
  const oldKey = process.env.OPENAI_API_KEY,
    oldModel = process.env.OPENAI_MODEL,
    oldFetch = globalThis.fetch;
  const req = (body, headers = {}) =>
    new Request("http://localhost/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  try {
    delete process.env.OPENAI_API_KEY;
    assert.equal(
      (await POST(req({ action: "start", locale: "es" }))).status,
      503,
    );
    assert.equal(
      (
        await POST(
          req(
            { action: "start", locale: "es" },
            { origin: "https://other.example" },
          ),
        )
      ).status,
      403,
    );
    assert.equal(
      (await POST(req({ action: "start", locale: "es", score: 10 }))).status,
      400,
    );
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "test-model";
    let output = {
      definition: {
        concept: "attraction",
        difficulty: 1,
        a: 20,
        b: 30,
        r: 8,
        exponent: -9,
        scene: "objects",
      },
      hint: "attraction",
    };
    globalThis.fetch = async () =>
      Response.json({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: JSON.stringify(output) }],
          },
        ],
      });
    const response = await POST(req({ action: "start", locale: "es" }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const started = await response.json();
    assert.equal(started.question.expected, undefined);
    assert.equal(started.feedback, undefined);
    assert.deepEqual(started.history, []);
    assert.equal(
      (
        await POST(
          req({
            action: "answer",
            token: "tampered",
            answer: answer("attract"),
            usedHint: false,
          }),
        )
      ).status,
      400,
    );
    assert.equal(
      (await POST(req({ action: "next", token: started.token }))).status,
      400,
    );
    output = {
      explanation: "Both bodies attract.",
      steps: ["Mass causes attraction."],
    };
    const checked = await (
      await POST(
        req({
          action: "answer",
          token: started.token,
          answer: answer("attract"),
          usedHint: true,
        }),
      )
    ).json();
    assert.equal(checked.score, 1);
    assert.equal(checked.hints, 1);
    assert.equal(checked.feedback.expected, "attract");
    assert.equal(
      (
        await POST(
          req({
            action: "answer",
            token: checked.token,
            answer: answer("attract"),
            usedHint: false,
          }),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await POST(
          req({
            action: "answer",
            token: started.token,
            answer: answer("attract"),
            usedHint: false,
            score: 10,
          }),
        )
      ).status,
      400,
    );
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = oldKey;
    if (oldModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = oldModel;
  }
});
