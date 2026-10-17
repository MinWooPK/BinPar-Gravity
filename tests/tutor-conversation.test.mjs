import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const directory = mkdtempSync(join(tmpdir(), "tutor-conversation-tests-"));
after(() => rmSync(directory, { recursive: true, force: true }));
execFileSync(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "src/features/ai/components/conversation.ts",
  "--outDir", directory, "--rootDir", "src", "--module", "commonjs",
  "--target", "es2022", "--lib", "es2022,dom", "--strict", "--skipLibCheck",
]);
const require = createRequire(import.meta.url);
const { requestHistory } = require(join(directory, "features/ai/components/conversation.js"));
const {
  TUTOR_MAX_MESSAGES,
  TUTOR_MAX_MESSAGE_LENGTH,
  TUTOR_MAX_TOTAL_MESSAGE_LENGTH,
} = require(join(directory, "features/ai/application/tutor.js"));
const dialogue = (length, contentLength = 20) => Array.from({ length }, (_, index) => ({
  role: index % 2 === 0 ? "user" : "assistant",
  content: `${index}:`.padEnd(contentLength, "x"),
}));

test("conversation budget preserves a short complete dialogue with a final user question", () => {
  const messages = dialogue(5);
  const selected = requestHistory(messages);
  assert.deepEqual(selected, messages);
  assert.equal(selected[0].role, "user");
  assert.equal(selected.at(-1).role, "user");
  assert.deepEqual(requestHistory([]), []);
});

test("conversation budget keeps the newest turns within the twelve-message limit", () => {
  const messages = dialogue(31);
  const selected = requestHistory(messages);
  assert.ok(selected.length <= TUTOR_MAX_MESSAGES);
  assert.equal(selected[0].role, "user");
  assert.equal(selected.at(-1).role, "user");
  assert.deepEqual(selected, messages.slice(-selected.length));
  assert.deepEqual(selected.at(-1), messages.at(-1));

  const repeatedQuestions = Array.from({ length: 15 }, (_, index) => ({ role: "user", content: `Question ${index}` }));
  assert.deepEqual(requestHistory(repeatedQuestions), repeatedQuestions.slice(-TUTOR_MAX_MESSAGES));
});

test("conversation budget trims orphaned assistant turns without discarding the latest question", () => {
  const messages = [
    { role: "assistant", content: "A reply whose old question was removed." },
    { role: "assistant", content: "Another orphaned reply." },
    { role: "user", content: "Why does gravity act at a distance?" },
    { role: "assistant", content: "A previous explanation." },
    { role: "user", content: "Can you give an example?" },
  ];
  assert.deepEqual(requestHistory(messages), messages.slice(2));
  assert.deepEqual(requestHistory(messages.slice(0, 2)), []);
});

test("conversation budget truncates each message and the newest question at 1200 characters", () => {
  const messages = [
    { role: "user", content: "First question" },
    { role: "assistant", content: "a".repeat(1700) },
    { role: "user", content: "u".repeat(1400) },
  ];
  const selected = requestHistory(messages);
  assert.equal(selected.length, 3);
  assert.equal(selected[1].content, messages[1].content.slice(0, TUTOR_MAX_MESSAGE_LENGTH));
  assert.equal(selected.at(-1).content, messages.at(-1).content.slice(0, TUTOR_MAX_MESSAGE_LENGTH));
  assert.ok(selected.every(({ content }) => content.length <= TUTOR_MAX_MESSAGE_LENGTH));
  assert.equal(selected.at(-1).role, "user");
});

test("conversation total budget retains the newest contiguous exchange at the exact 6000-character boundary", () => {
  const messages = dialogue(9, TUTOR_MAX_MESSAGE_LENGTH);
  const selected = requestHistory(messages);
  assert.equal(selected.reduce((sum, { content }) => sum + content.length, 0), TUTOR_MAX_TOTAL_MESSAGE_LENGTH);
  assert.deepEqual(selected, messages.slice(-5));
  assert.equal(selected[0].role, "user");
  assert.deepEqual(selected.at(-1), messages.at(-1));
});

test("conversation budget does not mutate caller messages or expose its metadata to the model", () => {
  const messages = dialogue(17, 1500).map((message, id) => Object.freeze({ ...message, id, localOnly: true }));
  Object.freeze(messages);
  const snapshot = JSON.stringify(messages);
  const selected = requestHistory(messages);
  assert.equal(JSON.stringify(messages), snapshot);
  assert.ok(selected.length > 0);
  for (const message of selected) {
    assert.deepEqual(Object.keys(message).sort(), ["content", "role"]);
    assert.equal(messages.some((source) => source === message), false);
  }
  selected.at(-1).content = "Local replacement";
  assert.equal(JSON.stringify(messages), snapshot);
});
