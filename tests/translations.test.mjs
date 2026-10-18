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
  const source = [
    "../src/features/gravity/presentation/components/experiment/GravityExperiment.tsx",
    "../src/features/gravity/presentation/components/experiment/GravitySlider.tsx",
    "../src/features/gravity/presentation/components/understanding/GravityFormula.tsx",
    "../src/features/gravity/presentation/components/understanding/GravityFormulaLegend.tsx",
    "../src/features/gravity/presentation/components/challenges/GravityLab.tsx",
    "../src/features/gravity/presentation/components/GravityScreen.tsx",
    "../src/features/gravity/presentation/components/discovery/GravityEducationalCard.tsx",
    "../src/features/gravity/presentation/components/discovery/GravityScienceCard.tsx"
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8")).join("\n");
  const usedKeys = [...source.matchAll(/\bt\("([^"]+)"\)/g)].map((match) => match[1]);
  usedKeys.push("firstMass", "secondMass", "centreDistance", "learningDiscover", "educationWhat", "educationHistory", "educationPrinciples", "educationExamples");
  for (const scientist of ["Galileo", "Kepler", "Newton"]) {
    usedKeys.push(`discoveryHistory${scientist}`, `discoveryHistory${scientist}Title`);
  }
  for (const { locale, messages } of dictionaries) {
    for (const key of usedKeys) {
      assert.equal(typeof messages.Gravity[key], "string", `${locale}: Gravity.${key}`);
      assert.ok(messages.Gravity[key].trim().length > 0, `${locale}: Gravity.${key}`);
    }
  }
});

test("orbit animation controls and descriptions are translated in every locale", () => {
  const files = [
    "../src/features/three-body/presentation/components/shared/OrbitAnimation.tsx",
    "../src/features/three-body/presentation/components/detail/OrbitPlayer.tsx",
    "../src/features/three-body/presentation/components/gallery/OrbitGallery.tsx",
  ];
  const usedKeys = files.flatMap((file) => [...readFileSync(new URL(file, import.meta.url), "utf8").matchAll(/\bt\("([^"]+)"/g)].map((match) => match[1]));
  usedKeys.push(
    "animationPlay",
    "animationPause",
    "animationPlayAll",
    "animationPauseAll",
    "galleryScience.equalMasses",
    "galleryScience.constant",
    "galleryScience.normalizedUnits",
  );
  for (const { locale, messages } of dictionaries) {
    for (const key of usedKeys) {
      const message = key.split(".").reduce((value, part) => value?.[part], messages.ThreeBody);
      assert.equal(typeof message, "string", `${locale}: ThreeBody.${key}`);
      assert.ok(message.trim(), `${locale}: ThreeBody.${key}`);
    }
  }
});

test("orbit detail information and accessible labels are translated with consistent parameters", () => {
  const files = [
    { path: "../src/app/[locale]/three-body/[slug]/page.tsx", prefix: "" },
    { path: "../src/features/three-body/presentation/components/detail/OrbitDetail.tsx", prefix: "" },
    { path: "../src/features/three-body/presentation/components/detail/OrbitDetailTabs.tsx", prefix: "detail." },
    { path: "../src/features/three-body/presentation/components/detail/OrbitPlayer.tsx", prefix: "" },
  ];
  const usedKeys = new Set(files.flatMap(({ path, prefix }) => (
    [...readFileSync(new URL(path, import.meta.url), "utf8").matchAll(/\bt\("([^"]+)"/g)]
      .map((match) => `${prefix}${match[1]}`)
  )));
  for (const key of [
    "detail.explanationTab", "detail.conditionsTab", "detail.navigationLabel",
    "galleryScience.equalMasses", "galleryScience.constant", "galleryScience.normalizedUnits",
    "categoryClassical", "categoryChoreography", "categoryPeriodic",
    "animationPlay", "animationPause",
  ]) usedKeys.add(key);
  const parameters = { orbitIndex: ["number", "total"], refinedConditions: ["publishedPeriod"] };

  for (const { locale, messages } of dictionaries) {
    for (const key of usedKeys) {
      const message = key.split(".").reduce((value, part) => value?.[part], messages.ThreeBody);
      assert.equal(typeof message, "string", `${locale}: ThreeBody.${key}`);
      assert.ok(message.trim(), `${locale}: ThreeBody.${key}`);
    }
    for (const [key, expected] of Object.entries(parameters)) {
      const message = messages.ThreeBody.detail[key];
      assert.deepEqual(
        [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort(),
        expected,
        `${locale}: ThreeBody.detail.${key} interpolation parameters`,
      );
    }
  }
});
