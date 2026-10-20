// Run with a local app server: node tests/browser/gravity-practice.mjs
// PRACTICE_REAL=1 opts into a complete real 10-question practice (21 provider requests) (requires configured server).
// Override PANELS_URL and CHROME_PATH when needed. No external test dependencies.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
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
    for (let i = 0; i < 750; i++) {
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

  const real = process.env.PRACTICE_REAL === "1";
  const dictionaries = Object.fromEntries(
    ["es", "en", "fr"].map((locale) => [
      locale,
      JSON.parse(
        fs.readFileSync(
          new URL(`../../messages/${locale}.json`, import.meta.url),
          "utf8",
        ),
      ).Practice,
    ]),
  );
  const expected = (q) =>
    ({
      attraction: "attract",
      mutual: "equal",
      mass: "double",
      distance: "quarter",
      reasoning: "quarter",
      km: q.a * 1000,
      cm: q.a / 100,
      tonnes: q.a * 1000,
      square: q.a * q.a,
      power: q.a * 10 ** q.exponent,
      force:
        (6.6743e-11 * q.a * (q.difficulty === 3 ? 1000 : 1) * q.b) /
        (q.r * (q.difficulty >= 2 ? 1000 : 1)) ** 2,
    })[q.concept];
  const script = `(()=>{window.practiceReplies=[];window.practiceRequests=[];window.practiceHintCalls=0;const original=fetch;let history=[],question=null;const expected=${expected.toString()};window.fetch=async(url,options)=>{if(!String(url).includes('/api/practice'))return original(url,options);const request=JSON.parse(options.body);window.practiceRequests.push(request);let response;
      ${
        real
          ? "response=await original(url,options);"
          : `
      if(request.action==='start')history=[];
      const schedule=['attraction','attraction','km','square','distance','tonnes','power','mutual','force','reasoning'];
      if(request.action!=='answer')question={id:'q'+history.length,number:history.length+1,concept:schedule[history.length],difficulty:history.length>4?2:1,a:history.length===2?0.01:history.length===5?0.04:40,b:40,r:history.length>4?0.008:8,exponent:-9,scene:'laboratory',hint:'units',reinforcement:history.length===1};
      let feedback;
      if(request.action==='answer'){const value=expected(question),correct=question.number!==1;feedback={correct,expected:value,actual:request.answer.value,error:correct?null:'unknown',explanation:'Educational explanation',steps:['Review the relation.']};history.push({concept:question.concept,correct,usedHint:request.usedHint});}
      const report=history.length===10?{summary:'Summary of ten observed answers.',strengths:['Masses'],review:['Attraction'],recommendations:[{stage:'gravity-discovery',text:'Review attraction'},{stage:'gravity-understanding',text:'Review units'},{stage:'gravity-laboratory',text:'Experiment with masses'}]}:undefined;
      response=Response.json({token:'fixture',question,count:history.length,score:history.filter(h=>h.correct).length,hints:history.filter(h=>h.usedHint).length,history,...(feedback&&{feedback}),...(report&&{report})});`
      }
      const body=await response.clone().json();window.practiceReplies.push({status:response.status,body});if(response.ok)window.practiceView=body;return response;}})()`;
  await call("Page.addScriptToEvaluateOnNewDocument", { source: script });
  const clickText = async (text) => {
    await evaluate(
      `(()=>{const e=[...document.querySelectorAll('[data-practice] button')].find(b=>b.textContent.trim()===${q(text)});if(!e)throw Error('Missing '+${q(text)});e.click()})()`,
    );
  };
  const perform = async (text) => {
    let count = await evaluate("window.practiceReplies.length");
    await clickText(text);
    await waitFor(
      `window.practiceReplies.length>${count}&&document.querySelector('[data-practice]').getAttribute('aria-busy')==='false'`,
    );
    for (
      let retry = 0;
      retry < 3 &&
      (await evaluate("window.practiceReplies.at(-1).status!==200"));
      retry++
    ) {
      const status = await evaluate("window.practiceReplies.at(-1).status");
      console.log(
        "Retrying transient response",
        status,
        "with preserved session",
      );
      if (status === 429) {
        for (let i = 0; i < 62; i++) await delay(1000);
      } else await delay(1000);
      count = await evaluate("window.practiceReplies.length");
      await clickText(dictionaries.es.retry);
      await waitFor(
        `window.practiceReplies.length>${count}&&document.querySelector('[data-practice]').getAttribute('aria-busy')==='false'`,
      );
    }
    assert.equal(
      await evaluate("window.practiceReplies.at(-1).status"),
      200,
      JSON.stringify(await evaluate("window.practiceReplies.at(-1)")),
    );
  };
  const records = [];
  for (const locale of real ? ["es"] : ["es", "en", "fr"]) {
    const t = dictionaries[locale];
    await call("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await call("Page.navigate", {
      url:
        (process.env.PANELS_URL || "http://localhost:3100") +
        `/${locale}/gravity?practice=${Date.now()}#gravity-challenges`,
    });
    await waitFor(
      `!!document.querySelector('[data-practice]')&&!document.querySelector('#gravity-challenges').hidden`,
    );
    await delay(500);
    assert.equal(
      await evaluate(
        `document.querySelector('#global-tutor-trigger')?.getClientRects().length??0`,
      ),
      0,
    );
    assert.equal(await evaluate(`window.practiceRequests.length`), 0);
    assert.equal(
      await evaluate(
        `document.querySelectorAll('#gravity-challenges [data-understanding-simulation],[data-challenge-step]').length`,
      ),
      0,
    );
    await perform(t.start);
    for (let n = 1; n <= 5; n++) {
      const current = await evaluate("window.practiceView");
      assert.equal(current.question.number, n);
      assert.equal(current.feedback, undefined);
      assert.equal(current.question.expected, undefined);
      const question = current.question;
      records.push({
        locale,
        number: n,
        concept: question.concept,
        difficulty: question.difficulty,
        reinforcement: question.reinforcement,
      });
      if (n === 1) {
        const calls = await evaluate("window.practiceRequests.length");
        await clickText(t.hint);
        await clickText(t.hideHint);
        assert.equal(await evaluate("window.practiceRequests.length"), calls);
      }
      if (n === 2) assert.equal(question.reinforcement, true);
      if (n === 3) {
        await click("[data-stage-tag=gravity-understanding]");
        await click("[data-stage-tag=gravity-challenges]");
        assert.equal(
          await evaluate("window.practiceView.question.id"),
          question.id,
        );
      }
      if (n === 4 || n === 9) {
        for (const [width, height] of [
          [320, 600],
          [375, 667],
          [768, 800],
          [1280, 800],
        ]) {
          await call("Emulation.setDeviceMetricsOverride", {
            width,
            height,
            deviceScaleFactor: 1,
            mobile: false,
          });
          await delay(100);
          assert.ok(
            await evaluate("document.documentElement.scrollWidth<=innerWidth"),
          );
          assert.equal(
            await evaluate(
              `/\b(IA|AI|OpenAI)\b/.test(document.querySelector('[data-practice]').innerText)`,
            ),
            false,
          );
          if (locale === "es") {
            const { data } = await call("Page.captureScreenshot", {
              format: "png",
            });
            fs.writeFileSync(
              join(tmpdir(), `practice-${n}-${width}.png`),
              Buffer.from(data, "base64"),
            );
          }
        }
      }
      const result = expected(question);
      if (typeof result === "string")
        await click(
          `[data-practice] input[value=${n === 1 ? "repel" : result}]`,
        );
      else {
        const scientific = ["force", "power"].includes(question.concept);
        const exponent = scientific
          ? Math.floor(Math.log10(Math.abs(result)))
          : 0;
        const coefficient = scientific ? result / 10 ** exponent : result;
        await evaluate(
          `document.querySelector('[data-practice] input:not([type=number])').focus()`,
        );
        await call("Input.insertText", { text: String(coefficient) });
        await press("Tab");
        if (scientific) {
          assert.equal(
            await evaluate(
              `document.querySelector('[data-practice] input[type=number]').value`,
            ),
            "",
          );
          await evaluate(
            `document.querySelector('[data-practice] input[type=number]').focus()`,
          );
          await call("Input.insertText", { text: String(exponent) });
        }
      }
      await perform(t.check);
      const checked = await evaluate("window.practiceView");
      assert.equal(checked.count, n);
      assert.equal(checked.feedback.correct, n !== 1);
      console.log(
        "PASS",
        locale,
        "question",
        n,
        question.concept,
        checked.feedback.correct ? "correct" : "reinforcement needed",
      );
      if (n < 10) await perform(t.next);
    }
    assert.ok(
      await evaluate(`!!document.querySelector('[data-practice-report]')`),
    );
    assert.equal(await evaluate("window.practiceView.score"), 9);
    assert.equal(await evaluate("window.practiceView.hints"), 1);
    assert.equal(await evaluate("window.practiceView.history.length"), 10);
    const link = await evaluate(
      `document.querySelector('[data-practice-report] a').getAttribute('href')`,
    );
    await click("[data-practice-report] a");
    assert.equal(await evaluate("location.hash"), link);
    await click("[data-stage-tag=gravity-challenges]");
    assert.ok(
      await evaluate(`!!document.querySelector('[data-practice-report]')`),
    );
    if (real)
      console.log(
        "REAL REPORT",
        JSON.stringify(await evaluate("window.practiceView.report")),
      );
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    join(
      tmpdir(),
      real ? "practice-real-results.json" : "practice-mock-results.json",
    ),
    JSON.stringify(records, null, 2),
  );
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
