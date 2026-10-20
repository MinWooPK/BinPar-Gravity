// Run against the local app: node tests/browser/orbit-tutor.mjs
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
const directory = mkdtempSync(join(tmpdir(), 'orbit-tutor-'));
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
  const count = () => evaluate("document.querySelectorAll('#global-tutor-dialog [data-role]').length");
  const help = '[data-explain-topic="orbit"]';
  const close = '[data-tutor-close]';
  const cases = [
    ['lagrange', 'Lagrange'], ['figura-de-ocho', 'Figura de ocho'],
    ['butterfly-i', 'Butterfly I'], ['goggles', 'Goggles'],
    ['moth-i', 'Moth I'], ['yin-yang-i', 'Yin-Yang I'],
  ];
  const ask = async selector => {
    const before = requests.length, messageCount = await count();
    await click(selector);
    await waitFor("document.querySelector('#global-tutor-dialog').open&&document.querySelector('#global-tutor-dialog [role=log]').getAttribute('aria-busy')==='false'");
    await waitFor(`document.querySelector('#global-tutor-dialog [data-role="assistant"]:last-of-type p')?.textContent==='Mock orbit reply ${before + 1}'`);
    await delay(150);
    assert.equal(requests.length, before + 1, 'Exactly one request per help click');
    assert.equal(await count(), Math.min(30, messageCount + 2), 'Global conversation retained');
    if (before > 0) assert.ok(requests.at(-1).messages.some(message => message.role === 'assistant' && message.content.includes(`Mock orbit reply ${before}`)), 'Prior reply stays in the history');
    await click(close); await waitFor("!document.querySelector('#global-tutor-dialog').open");
    await waitFor(`document.activeElement===document.querySelector(${JSON.stringify(selector)})`);
    return requests.at(-1);
  };
  for (const locale of ['es', 'en', 'fr']) {
    const messages = JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), 'utf8'));
    await call('Emulation.setDeviceMetricsOverride', { width: locale === 'fr' ? 375 : 1280, height: 850, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: (process.env.TUTOR_URL || 'http://localhost:3000') + `/${locale}/three-body/lagrange` });
    await waitFor("document.readyState==='complete'&&!!document.querySelector('#global-tutor-trigger')");
    await delay(500);
    for (const [index, [slug, name]] of cases.entries()) {
      await waitFor(`location.pathname==='/${locale}/three-body/${slug}'&&document.querySelector('#orbit-solution-title')?.textContent.trim().startsWith(${JSON.stringify(name)})&&!!document.querySelector('${help}')`);
      if (index === 0) await evaluate('window.orbitHelpDocument=true');
      else assert.equal(await evaluate('window.orbitHelpDocument'), true, 'Orbit links preserve the document and global provider');
      const request = await ask(help);
      assert.equal(request.locale, locale);
      assert.equal(request.mode, 'explain');
      assert.equal(request.intent, 'explain_context');
      assert.deepEqual({ ...request.context, draftConfiguration: undefined }, { kind: 'three-body', stage: 'orbit', slug, draftConfiguration: undefined });
      assert.equal(request.context.draftConfiguration.bodies.length, 3);
      assert.equal(request.messages.at(-1).content, messages.ThreeBody.detail.explainQuestion.replace('{name}', name));
      assert.equal(request.messages.at(-1).role, 'user');
      if (index < cases.length - 1) await click('.next-orbit a');
    }
    // Existing help buttons without a custom question retain their translated default.
    await click(`a[href="/${locale}/three-body#gallery"]`);
    await waitFor("document.querySelector('[data-active-stage]')?.dataset.activeStage==='gallery'");
    await click('button[aria-controls="three-body-experiment"]');
    await waitFor("document.querySelector('[data-active-stage]').dataset.activeStage==='experiment'");
    const request = await ask('[data-explain-topic="simulation"]');
    assert.equal(request.messages.at(-1).content, messages.Tutor.helpQuestions.simulation);
    assert.equal(request.context.stage, 'experiment');
    console.log(`PASS ${locale}: six orbit names/slugs, localized questions, single requests, route changes, shared history, focus and unchanged default help`);
  }
  assert.equal(requests.length, 21);
  assert.deepEqual(errors, []);
  const exited = once(chrome, 'exit'); await send('Browser.close'); await exited;
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome.exitCode === null && chrome.signalCode === null) { chrome.kill(); await once(chrome, 'exit'); }
  await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
