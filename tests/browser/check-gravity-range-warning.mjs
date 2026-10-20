import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Shared checks for the real inline calculators and the real formula drawer. */
export async function checkGravityRangeWarning({ call, evaluate, input: fill, root, physicalValues, locale, presentation }) {
  const input = async (selector, text) => {
    await fill(selector, text);
    await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
  };
  const messages = JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8")).Gravity;
  const warning = `${root} [data-formula-range-warning]`;
  const selector = name => `${root} input[name=${name}]`;
  const status = () => evaluate(`document.getElementById(document.querySelector(${JSON.stringify(selector("mass1"))}).getAttribute('aria-describedby').split(' ')[1]).textContent`);
  const exists = () => evaluate(`!!document.querySelector(${JSON.stringify(warning)})`);
  const setValues = async values => {
    for (const [index, name] of ["mass1", "mass2", "distance"].entries()) await input(selector(name), values[index]);
  };
  const warningValues = () => evaluate(`[...document.querySelectorAll(${JSON.stringify(`${warning} dd`)})].map(e=>e.textContent.trim())`);
  const reset = async () => {
    await evaluate(`document.querySelector(${JSON.stringify(selector("mass1"))}).closest('section').querySelector('button[aria-describedby$="-reset-hint"]').click()`);
    await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
  };
  await reset();
  assert.equal(await exists(), false, `${locale}/${presentation}: defaults have no warning`);
  assert.deepEqual(await physicalValues(), [40, 40, 8]);
  await input(selector("mass1"), "150");
  assert.equal(await exists(), true, JSON.stringify(await evaluate(`({value:document.querySelector(${JSON.stringify(selector("mass1"))}).value,active:document.activeElement?.outerHTML,dialog:document.querySelector('#gravity-formula-dialog')?.open})`)));
  assert.deepEqual(await physicalValues(), [40, 40, 8]);
  assert.deepEqual(await warningValues(), ["40 kg", "40 kg", "8 m"]);
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(`${warning} h4`)}).textContent.trim()`), messages.outsideLabRange);
  const announcement = await status();
  assert.ok(announcement.includes(messages.outsideLabRangeConsequence));
  // Watch actual live-region mutations, not just the final text.
  await evaluate(`(()=>{const input=document.querySelector(${JSON.stringify(selector("mass1"))});const status=document.getElementById(input.getAttribute('aria-describedby').split(' ')[1]);window.rangeAnnouncements=0;window.rangeObserver=new MutationObserver(()=>window.rangeAnnouncements++);window.rangeObserver.observe(status,{subtree:true,characterData:true,childList:true})})()`);
  await setValues(["5.972e24", "7.348e22", "384400000"]);
  assert.equal(await exists(), true);
  assert.equal(await status(), announcement);
  assert.equal(await evaluate("window.rangeAnnouncements"), 0);
  await evaluate("window.rangeObserver.disconnect()");
  assert.deepEqual(await physicalValues(), [40, 40, 8]);
  assert.deepEqual(await warningValues(), ["40 kg", "40 kg", "8 m"]);
  for (const [index, name] of ["mass1", "mass2", "distance"].entries()) {
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector(name))}).value`), ["5.972e24", "7.348e22", "384400000"][index]);
  }
  assert.ok(Number(await evaluate(`document.querySelector(${JSON.stringify(selector("force"))}).value`)) > 0);
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(warning)}).textContent.includes(${JSON.stringify(messages.outsideLabRangeConsequence)})`), true);
  const limits = await evaluate(`[...document.querySelectorAll(${JSON.stringify(`${warning} li`)})].map(e=>e.textContent)`);
  assert.deepEqual(limits, [messages.outsideLabMassLimits.replace("{min}", "10").replace("{max}", "100"), messages.outsideLabDistanceLimits.replace("{min}", "5").replace("{max}", "20")]);
  // Verify semantic names, live-region configuration and reduced motion.
  assert.equal(await evaluate(`(()=>{const warning=document.querySelector(${JSON.stringify(warning)});return document.getElementById(warning.getAttribute('aria-labelledby')).textContent.trim()})()`), messages.outsideLabRange);
  assert.equal(await evaluate(`document.getElementById(document.querySelector(${JSON.stringify(selector("mass1"))}).getAttribute('aria-describedby').split(' ')[1]).getAttribute('role')`), "status");
  await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  assert.equal(await evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(warning)})).animationName`), "none");
  await call("Emulation.setEmulatedMedia", { features: [] });
  for (const [width, height] of [[1440, 900], [820, 1180], [375, 812], [320, 640]]) {
    await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    if (presentation !== "drawer" && width < 1024) await evaluate(`document.querySelector(${JSON.stringify(`${root} [data-panel-select=right]`)}).click()`);
    await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
    await evaluate(`Promise.all(document.querySelector(${JSON.stringify(root)}).getAnimations({subtree:true}).filter(animation=>animation.effect.getComputedTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>{})))`);
    assert.equal(await evaluate("document.querySelectorAll('dialog[open]').length"), presentation === "drawer" ? 1 : 0);
    await evaluate(`document.querySelector(${JSON.stringify(warning)}).scrollIntoView({block:'center',behavior:'instant'})`);
    const metrics = await evaluate(`(()=>{const w=document.querySelector(${JSON.stringify(warning)}),r=w.getBoundingClientRect(),s=getComputedStyle(w),h=w.querySelector('h4');return {pageOverflow:document.documentElement.scrollWidth-innerWidth,cardOverflow:w.scrollWidth-w.clientWidth,left:r.left,right:r.right,width:r.width,height:r.height,headingWeight:Number(getComputedStyle(h).fontWeight),headingSize:parseFloat(getComputedStyle(h).fontSize),bodySize:parseFloat(s.fontSize),border:s.borderTopWidth,visible:w.checkVisibility(),inert:!!w.closest('[inert]')}})()`);
    assert.ok(metrics.visible && !metrics.inert && metrics.width > 0, JSON.stringify({ locale, presentation, width, metrics }));
    assert.ok(metrics.pageOverflow <= 1 && metrics.cardOverflow <= 1 && metrics.left >= 0 && metrics.right <= width + 1, JSON.stringify({ locale, presentation, width, metrics }));
    assert.ok(metrics.headingWeight >= 600 && metrics.headingSize > metrics.bodySize && parseFloat(metrics.border) >= 1);
    // Scrolling must make both the calculator fields and reset control reachable.
    assert.equal(await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector("mass1"))});e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&e.checkVisibility()})()`), true);
    assert.equal(await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector("mass1"))}).closest('section').querySelector('button[aria-describedby$="-reset-hint"]');e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&e.checkVisibility()})()`), true);
    await evaluate(`document.querySelector(${JSON.stringify(warning)}).scrollIntoView({block:'center',behavior:'instant'})`);
    if (width !== 320) {
      const rect = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(warning)}).getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
      const { data } = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: rect });
      writeFileSync(join(tmpdir(), `gravity-warning-${locale}-${presentation}-${width}.png`), Buffer.from(data, "base64"));
    }
  }
  await call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await setValues(["60", "50", "10"]);
  assert.equal(await exists(), false);
  assert.deepEqual(await physicalValues(), [60, 50, 10]);
  for (const invalid of ["-40", "abc", "7e", ""]) {
    await input(selector("mass1"), invalid);
    assert.equal(await exists(), false, `${locale}/${presentation}: ${JSON.stringify(invalid)} is not a range warning`);
    assert.deepEqual(await physicalValues(), [60, 50, 10]);
    if (invalid) {
      assert.equal(await status(), messages.invalidFormulaValue.replace("{symbol}", "m₁"));
      assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector("mass1"))}).getAttribute('aria-invalid')`), "true");
    }
  }
  await setValues(["1e308", "1e308", "8"]);
  assert.equal(await exists(), false, "Numerical overflow must keep its own error");
  assert.equal(await status(), messages.numericalError);
  await reset();
  assert.equal(await exists(), false);
  assert.deepEqual(await physicalValues(), [40, 40, 8]);
  console.log("PASS", locale, presentation, "range cases, astronomical values, recovery/reset, invalid inputs, stable announcements, reduced motion, desktop/tablet/mobile");
}
