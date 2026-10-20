// Run against the local app: node tests/browser/three-body-no-ai.mjs
// Override TUTOR_URL (origin) and CHROME_PATH when needed.
// Chrome intercepts every /api/ai request: no real model calls or credentials.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const executable = process.env.CHROME_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync);
assert.ok(executable, 'Set CHROME_PATH to Chrome/Chromium');
const directory = mkdtempSync(join(tmpdir(), 'three-body-no-ai-'));
const chrome = spawn(executable, ['--headless=new', '--remote-debugging-pipe',
  '--no-first-run', '--no-default-browser-check', `--user-data-dir=${directory}`, 'about:blank'],
{ stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
const pending = new Map(), errors = [], requests = [];
let sequence = 0, buffer = '';
chrome.stdio[3].on('error', () => {});
chrome.stdio[4].on('data', data => {
  buffer += data.toString();
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const raw = buffer.slice(0, end); buffer = buffer.slice(end + 1);
    if (!raw) continue;
    const message = JSON.parse(raw), request = pending.get(message.id);
    if (request) {
      clearTimeout(request.timeout); pending.delete(message.id);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    else if (message.method === 'Fetch.requestPaused') {
      try {
        requests.push(JSON.parse(message.params.request.postData));
        void send('Fetch.fulfillRequest', {
          requestId: message.params.requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
          body: Buffer.from(JSON.stringify({ text: `Mock orbit reply ${requests.length}`, proposal: null })).toString('base64'),
        }, message.sessionId).catch(error => errors.push(error.message));
      } catch (error) { errors.push(error.message); }
    }
  }
});
chrome.on('exit', () => { for (const request of pending.values()) request.reject(new Error('Chrome exited')); });
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timeout = setTimeout(() => { pending.delete(id); reject(new Error('Timed out: ' + method)); }, 20000);
  pending.set(id, { resolve, reject, timeout });
  chrome.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
});
try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.experimentResults=[];
    const NativeWorker=window.Worker;
    window.Worker=class extends NativeWorker {
      constructor(...args){super(...args);this.addEventListener('message',event=>{if(event.data?.result?.periodicity)window.experimentResults.push(event.data.result.periodicity)})}
    };
  ` });
  await call('Page.enable'); await call('Runtime.enable'); await call('Page.bringToFront');
  await call('Emulation.setFocusEmulationEnabled', { enabled: true });
  await call('Fetch.enable', { patterns: [{ urlPattern: '*/api/ai*', requestStage: 'Request' }] });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const waitFor = async expression => {
    for (let i = 0; i < 1200; i++) {
      if (await evaluate(expression)) return;
      await delay(50);
    }
    const state = await evaluate("({url:location.href,ready:document.readyState,open:document.querySelector('#global-tutor-dialog')?.open,busy:document.querySelector('#global-tutor-dialog [role=log]')?.getAttribute('aria-busy')})");
    throw new Error('Not ready: ' + expression + '\n' + JSON.stringify({ state, requests: requests.length, errors }));
  };
  const click = selector => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||e.closest('[inert],[hidden]'))throw Error('Unavailable '+${JSON.stringify(selector)});e.click()})()`);
  const cases = [
    ['lagrange', 'Lagrange'], ['figura-de-ocho', 'Figura de ocho'],
    ['butterfly-i', 'Butterfly I'], ['goggles', 'Goggles'],
    ['moth-i', 'Moth I'], ['yin-yang-i', 'Yin-Yang I'],
  ];
  for (const locale of ['es', 'en', 'fr']) {
    const messages = JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), 'utf8'));
    await call('Emulation.setDeviceMetricsOverride', { width: locale === 'fr' ? 375 : 1280, height: 850, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: (process.env.TUTOR_URL || 'http://localhost:3000') + `/${locale}/three-body/lagrange` });
    await waitFor("document.readyState==='complete'&&!!document.querySelector('#orbit-solution-title')");
    await delay(500);
    const noAI = async () => assert.equal(await evaluate("!!document.querySelector('#global-tutor-trigger,#global-tutor-dialog,[data-explain-topic],[data-tutor-proposal]')"), false);
    for (const [index, [slug, name]] of cases.entries()) {
      await waitFor(`location.pathname==='/${locale}/three-body/${slug}'&&document.querySelector('#orbit-solution-title')?.textContent.trim().startsWith(${JSON.stringify(name)})`);
      await noAI();
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
      if (index < cases.length - 1) await click('.next-orbit a');
    }
    await click(`a[href="/${locale}/three-body#gallery"]`);
    await waitFor("document.querySelector('[data-active-stage]')?.dataset.activeStage==='gallery'");
    await noAI();
    for (const stage of ['discover','understand','experiment']) {
      await click(`button[aria-controls="three-body-${stage}"]`);
      await waitFor(`document.querySelector('[data-active-stage]')?.dataset.activeStage==='${stage}'`);
      await noAI();
    }
    await evaluate(`[...document.querySelectorAll('#three-body-experiment button')].find(b=>b.textContent.includes(${JSON.stringify(messages.ThreeBody.experiment.runSimulation)})).click()`);
    await waitFor("window.experimentResults?.at(-1)?.detected===true");
    assert.equal(await evaluate("document.querySelector('#three-body-experiment input[type=range]').disabled"),false);
    await noAI();
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
    console.log(`PASS ${locale}: six orbital details, four stages, manual Worker simulation and periodicity without AI`);
  }
  assert.equal(requests.length, 0, 'No AI requests from Three Body');
  assert.deepEqual(errors, []);
  const exited = once(chrome, 'exit'); await send('Browser.close'); await exited;
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome.exitCode === null && chrome.signalCode === null) { chrome.kill(); await once(chrome, 'exit'); }
  await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
