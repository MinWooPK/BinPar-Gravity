// Run with a local app server: node tests/browser/gravity-inline-formula.mjs
// Override PANELS_URL and CHROME_PATH when needed. No external test dependencies.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { checkGravityRangeWarning } from "./check-gravity-range-warning.mjs";
const chromePath =
  process.env.CHROME_PATH ||
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find(existsSync);
assert.ok(chromePath, "Set CHROME_PATH to a Chrome/Chromium executable");
const profile = mkdtempSync(join(tmpdir(), "gravity-chrome-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--remote-debugging-pipe",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] },
);
let sequence = 0,
  buffer = "";
const pending = new Map();
const errors = [];
chrome.stdio[4].on("data", (data) => {
  buffer += data.toString();
  let end;
  while ((end = buffer.indexOf("\0")) >= 0) {
    const raw = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    if (!raw) continue;
    const message = JSON.parse(raw);
    if (message.id) {
      const call = pending.get(message.id);
      if (call) {
        clearTimeout(call.timeout);
        pending.delete(message.id);
        if (message.error) call.reject(message.error);
        else call.resolve(message.result);
      }
    } else if (message.method === "Runtime.exceptionThrown")
      errors.push(message.params.exceptionDetails.text);
    else if (
      message.method === "Runtime.consoleAPICalled" &&
      message.params.type === "error"
    )
      errors.push(
        message.params.args.map((a) => a.value ?? a.description).join(" "),
      );
  }
});
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timed out: ${method}`));
    }, 20000);
    pending.set(id, { resolve, reject, timeout });
    chrome.stdio[3].write(
      JSON.stringify({
        id,
        method,
        params,
        ...(sessionId ? { sessionId } : {}),
      }) + "\0",
    );
  });
}
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const { targetId } = await send("Target.createTarget", {
    url: "about:blank",
  });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  const call = (method, params) => send(method, params, sessionId);
  await call("Page.enable");
  await call("Runtime.enable");
  await call("Page.bringToFront");
  const evaluate = async (expression) => {
    const r = await call("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    }).catch((error) => {
      throw Error(`${expression}: ${JSON.stringify(error)}`);
    });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const waitFor = async (expression, label = expression) => {
    for (let i = 0; i < 180; i++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    throw Error("Not ready: " + label);
  };
  const q = JSON.stringify;
  const press = async (key, modifiers = 0) => {
    const codes = {
      Enter: 13,
      ArrowDown: 40,
      ArrowUp: 38,
      ArrowRight: 39,
      ArrowLeft: 37,
      Home: 36,
      End: 35,
      Escape: 27,
      Tab: 9,
    };
    const p = { key, code: key, windowsVirtualKeyCode: codes[key], modifiers };
    await call("Input.dispatchKeyEvent", {
      type: "keyDown",
      ...p,
      ...(key === "Enter" ? { text: "\r" } : {}),
    });
    await call("Input.dispatchKeyEvent", { type: "keyUp", ...p });
    await delay(80);
  };
  const click = async (selector) => {
    await evaluate(
      `(()=>{const e=document.querySelector(${q(selector)});if(!e)throw Error('Missing '+${q(selector)});e.click()})()`,
    );
    await delay(80);
  };

  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `(()=>{window.aiCalls=0;const original=fetch;window.fetch=(url,...args)=>{if(String(url).includes('/api/ai')){window.aiCalls++;return Promise.resolve(Response.json({text:'Test reply'}));}return original(url,...args)}})()`,
  });
  const root = "#gravity-laboratory";
  const tab = (view) => `${root} [data-content-tab=${view === "formula" ? "calculator" : view}]`;
  const values = () =>
    evaluate(
      `[...document.querySelectorAll('${root} input[type=range]')].map(e=>Number(e.value))`,
    );
  const input = async (name, text) => {
    const selector = `${root} input[name=${name}]`;
    await evaluate(
      `document.querySelector(${q(selector)}).focus();document.querySelector(${q(selector)}).select()`,
    );
    await call("Input.insertText", { text });
    await press("Tab");
  };
  for (const locale of ["es", "en", "fr"]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await call("Page.navigate", {
      url:
        (process.env.PANELS_URL || "http://localhost:3100") +
        `/${locale}/gravity?inline=${Date.now()}#gravity-laboratory`,
    });
    await waitFor(
      `!!document.querySelector('${tab("experiment")}')&&!document.querySelector('${root}').hidden`,
    );
    await delay(500);
    assert.equal(
      await evaluate(
        `document.querySelector('${tab("experiment")}').getAttribute('aria-selected')`,
      ),
      "true",
    );
    await evaluate(`document.querySelector('${tab("experiment")}').focus()`);
    await press("ArrowRight");
    assert.equal(
      await evaluate(`document.activeElement.dataset.contentTab`),
      "calculator",
    );
    assert.equal(
      await evaluate(`document.querySelectorAll('dialog[open]').length`),
      0,
    );
    await input("mass1", "80");
    await input("mass2", "40");
    await input("distance", "12");
    assert.deepEqual(await values(), [80, 40, 12]);
    await click(tab("experiment"));
    await evaluate(
      `document.querySelector('${root} input[type=range]').focus()`,
    );
    await press("ArrowLeft");
    await click(tab("formula"));
    assert.equal(
      await evaluate(
        `document.querySelector('${root} input[name=mass1]').value`,
      ),
      "79",
    );
    await input("mass1", "7e");
    await click(tab("experiment"));
    await click(tab("formula"));
    assert.equal(
      await evaluate(
        `document.querySelector('${root} input[name=mass1]').value`,
      ),
      "7e",
    );
    assert.deepEqual(await values(), [79, 40, 12]);
    await input("mass1", "80");
    // A solved out-of-range edit preserves physics and announces a stable warning.
    const warning = `${root} [data-formula-range-warning]`;
    await input("mass1", "101");
    assert.ok(await evaluate(`!!document.querySelector('${warning}')`));
    assert.deepEqual(await values(), [80, 40, 12]);
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('${warning} dd')].map(e=>e.textContent.trim())`), ["80 kg", "40 kg", "12 m"]);
    const rangeStatus = await evaluate(`document.getElementById(document.querySelector('${root} input[name=mass1]').getAttribute('aria-describedby').split(' ')[1]).textContent`);
    await input("mass1", "102");
    assert.equal(await evaluate(`document.getElementById(document.querySelector('${root} input[name=mass1]').getAttribute('aria-describedby').split(' ')[1]).textContent`), rangeStatus);
    await input("mass2", "");
    assert.equal(await evaluate(`!!document.querySelector('${warning}')`), false);
    await input("mass2", "abc");
    assert.equal(await evaluate(`!!document.querySelector('${warning}')`), false);
    assert.equal(await evaluate(`document.querySelector('${root} input[name=mass2]').getAttribute('aria-invalid')`), "true");
    await input("mass2", "40");
    assert.ok(await evaluate(`!!document.querySelector('${warning}')`));
    await input("mass1", "80");
    assert.equal(await evaluate(`!!document.querySelector('${warning}')`), false);
    await click(`${root} [data-unknown-variable=mass2]`);
    await click(tab("experiment"));
    await click(tab("formula"));
    assert.equal(
      await evaluate(
        `document.querySelector('${root} [data-unknown-variable=mass2]').getAttribute('aria-pressed')`,
      ),
      "true",
    );
    await click(`${root} [data-unknown-variable=force]`);
    await evaluate(
      `void(window.savedFormula=document.querySelector('${root} input[name=mass1]'))`,
    );
    for (const [width, height] of [
      [1440, 900],
      [1280, 800],
      [1440, 768],
      [375, 667],
      [320, 600],
    ]) {
      await call("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      if (width < 768) await click(`${root} [data-panel-select=right]`);
      for (const view of ["experiment", "formula"]) {
        await click(tab(view));
        await delay(250);
        assert.equal(
          await evaluate(
            `window.savedFormula===document.querySelector('${root} input[name=mass1]')`,
          ),
          true,
        );
        const metrics = await evaluate(
          `(()=>{const p=document.getElementById(document.querySelector('${tab(view)}').getAttribute('aria-controls')),r=p.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,content:p.scrollWidth-p.clientWidth,width:r.width,hidden:[...p.parentElement.querySelectorAll('[role=tabpanel]')].filter(e=>e!==p).every(e=>e.inert&&getComputedStyle(e).display==='none'),simulation:document.querySelector('${root} [data-understanding-simulation]').getBoundingClientRect().width}})()`,
        );
        assert.ok(
          metrics.overflow <= 0 && metrics.content <= 1,
          JSON.stringify({ locale, width, view, metrics }),
        );
        assert.equal(metrics.hidden, true);
        if (width >= 768) assert.ok(metrics.simulation > 100);
        if (locale === "es" && (width === 1280 || width === 375)) {
          const { data } = await call("Page.captureScreenshot", {
            format: "png",
          });
          fs.writeFileSync(
            join(tmpdir(), `inline-${view}-${width}.png`),
            Buffer.from(data, "base64"),
          );
        }
      }
    }
    await call("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    assert.equal(await evaluate(`document.querySelectorAll('${root} [data-panel-toggle=right]').length`), 0);
    await click(`${root} [data-panel-toggle=left]`);
    await click(`${root} [data-panel-toggle=left]`);
    assert.equal(
      await evaluate(
        `document.querySelector('${tab("formula")}').getAttribute('aria-selected')`,
      ),
      "true",
    );
    await click("[data-stage-tag=gravity-understanding]");
    assert.equal(
      await evaluate(
        `document.querySelectorAll('#gravity-understanding a[href="#gravity-laboratory"]').length`,
      ),
      0,
    );
    assert.ok(
      await evaluate(
        `!!document.querySelector('#gravity-understanding [data-explain-topic=formula]')`,
      ),
    );
    assert.equal(
      await evaluate(
        `document.querySelector('#gravity-understanding input[name=mass1]').value`,
      ),
      "80",
    );
    await click("[data-stage-tag=gravity-laboratory]");
    assert.equal(
      await evaluate(
        `document.querySelector('${tab("formula")}').getAttribute('aria-selected')`,
      ),
      "true",
    );
    for (const stage of ["gravity-understanding", "gravity-laboratory"]) {
      await click(`[data-stage-tag=${stage}]`);
      await click(`#${stage} [data-content-tab=calculator]`);
      await checkGravityRangeWarning({
        call, evaluate, locale, root: `#${stage}`, presentation: stage,
        physicalValues: values,
        input: async (selector, text) => {
          await evaluate(`document.querySelector(${q(selector)}).focus();document.querySelector(${q(selector)}).select()`);
          await call("Input.insertText", { text });
          await press("Tab");
        },
      });
    }
    await click("[data-stage-tag=gravity-challenges]");
    assert.ok(await evaluate(`!!document.querySelector('[data-practice]')`));
    assert.equal(await evaluate("window.aiCalls"), 0);
    console.log(
      "PASS",
      locale,
      "inline formula, bidirectional sync, invalid draft, unknown, mounted state, keyboard, five viewports, stage02 and adaptive stage04",
    );
  }
  assert.deepEqual(errors, []);
  await send("Browser.close");
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
    chrome.kill();
  })
  .finally(() => {
    for (const { timeout } of pending.values()) clearTimeout(timeout);
    setTimeout(() => {
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {
        /* Chrome may still be releasing its temporary profile. */
      }
    }, 500);
  });
