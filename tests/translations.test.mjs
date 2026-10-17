import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dictionaries = ["es", "en", "fr"].map((locale) => ({
  locale,
  messages: JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")),
}));

const keys = (object, prefix = "") => Object.entries(object).flatMap(([key, value]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return typeof value === "object" && value !== null ? keys(value, path) : [path];
}).sort();

test("all locales contain the same translation keys", () => {
  for (const { locale, messages } of dictionaries) {
    assert.deepEqual(keys(messages), keys(dictionaries[0].messages), locale);
  }
});

test("the gravity experiment has all its directly referenced messages", () => {
  const source = ["GravityExperiment", "GravitySlider", "GravityFormula", "GravityFormulaLegend", "GravityLab", "GravityScreen"].map((component) => readFileSync(new URL(`../src/features/gravity/components/${component}.tsx`, import.meta.url), "utf8")).join("\n");
  const usedKeys = [...source.matchAll(/\bt\("([^"]+)"\)/g)].map((match) => match[1]);
  usedKeys.push("firstMass", "secondMass", "centreDistance");
  for (const { locale, messages } of dictionaries) {
    for (const key of usedKeys) {
      assert.equal(typeof messages.Gravity[key], "string", `${locale}: Gravity.${key}`);
      assert.ok(messages.Gravity[key].trim().length > 0, `${locale}: Gravity.${key}`);
    }
  }
});

test("orbit animation controls and descriptions are translated in every locale", () => {
  const files = [
    "../src/features/three-body/components/OrbitAnimation.tsx",
    "../src/features/three-body/components/OrbitPlayer.tsx",
    "../src/features/three-body/components/OrbitGallery.tsx",
  ];
  const usedKeys = files.flatMap((file) => [...readFileSync(new URL(file, import.meta.url), "utf8").matchAll(/\bt\("([^"]+)"/g)].map((match) => match[1]));
  usedKeys.push("animationPlay", "animationPause", "animationPlayAll", "animationPauseAll");
  for (const { locale, messages } of dictionaries) {
    for (const key of usedKeys) {
      assert.equal(typeof messages.ThreeBody[key], "string", `${locale}: ThreeBody.${key}`);
      assert.ok(messages.ThreeBody[key].trim(), `${locale}: ThreeBody.${key}`);
    }
  }
});
