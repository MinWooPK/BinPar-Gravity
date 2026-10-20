import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import ts from "typescript";

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
const files = new Set(walk("src").filter((file) => /\.tsx?$/.test(file)));
const modules = new Map(
  [...files].map((file) => {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const dependencies = source.statements
      .filter(ts.isImportDeclaration)
      .flatMap((node) => {
        const clause = node.importClause;
        if (
          clause?.isTypeOnly ||
          (clause?.namedBindings &&
            ts.isNamedImports(clause.namedBindings) &&
            !clause.name &&
            clause.namedBindings.elements.every((item) => item.isTypeOnly))
        )
          return [];
        const specifier = node.moduleSpecifier.text;
        const root = specifier.startsWith("@/")
          ? `src/${specifier.slice(2)}`
          : specifier.startsWith(".")
            ? normalize(join(dirname(file), specifier))
            : null;
        const target =
          root &&
          [
            root,
            `${root}.ts`,
            `${root}.tsx`,
            `${root}/index.ts`,
            `${root}/index.tsx`,
          ].find((path) => files.has(path));
        return [{ specifier, target }];
      });
    const client = source.statements.some(
      (node) =>
        ts.isExpressionStatement(node) &&
        ts.isStringLiteral(node.expression) &&
        node.expression.text === "use client",
    );
    return [file, { dependencies, client }];
  }),
);

test("domain and application stay independent of presentation and server adapters", () => {
  for (const [file, { dependencies }] of modules) {
    if (!/\/(domain|application)\//.test(file)) continue;
    for (const { specifier, target } of dependencies) {
      assert.ok(
        !/^(react|next|openai)(\/|$)/.test(specifier),
        `${file}: ${specifier}`,
      );
      assert.ok(
        !/\/(presentation|infrastructure|app)\//.test(target ?? ""),
        `${file}: ${target}`,
      );
    }
  }
});

test("features do not depend on App Router entry points", () => {
  for (const [file, { dependencies }] of modules) {
    if (!file.startsWith("src/features/")) continue;
    assert.ok(
      dependencies.every(({ target }) => !target?.startsWith("src/app/")),
      file,
    );
  }
});

test("runtime imports are acyclic", () => {
  const visited = new Set();
  const active = new Set();
  const visit = (file, parents = []) => {
    assert.ok(!active.has(file), [...parents, file].join(" → "));
    if (visited.has(file)) return;
    active.add(file);
    for (const { target } of modules.get(file).dependencies)
      if (target) visit(target, [...parents, file]);
    active.delete(file);
    visited.add(file);
  };
  for (const file of modules.keys()) visit(file);
});

test("client entry points cannot reach server-only modules or infrastructure", () => {
  for (const [entry, { client }] of modules) {
    if (!client) continue;
    const visited = new Set();
    const visit = (file) => {
      if (visited.has(file)) return;
      visited.add(file);
      assert.ok(!file.includes("/infrastructure/"), `${entry} → ${file}`);
      for (const { specifier, target } of modules.get(file).dependencies) {
        assert.notEqual(specifier, "server-only", `${entry} → ${file}`);
        if (target) visit(target);
      }
    };
    visit(entry);
  }
});

test("Three Body numerical modules have no dependency on the AI tutor", () => {
  const visit = (file, visited = new Set()) => {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(!file.startsWith("src/features/ai/"), file);
    for (const { target } of modules.get(file).dependencies)
      if (target) visit(target, visited);
  };
  for (const file of files)
    if (/^src\/features\/three-body\/(domain|data|application)\//.test(file))
      visit(file);
});
