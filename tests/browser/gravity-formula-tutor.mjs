// Run with a local app server: node tests/browser/gravity-formula-tutor.mjs
// TUTOR_REAL=1 opts into two real OpenAI requests (requires configured server).
// Override PANELS_URL and CHROME_PATH when needed. No external test dependencies.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const chromePath = process.env.CHROME_PATH || [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find(existsSync);
assert.ok(chromePath, 'Set CHROME_PATH to a Chrome/Chromium executable');
const profile = mkdtempSync(join(tmpdir(), 'gravity-chrome-'));
const chrome = spawn(chromePath, [
    '--headless=new', '--remote-debugging-pipe', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
let sequence = 0, buffer = '';
const pending = new Map();
const errors = [];
chrome.stdio[4].on('data', data => {
    buffer += data.toString();
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
        const raw = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        if (!raw)
            continue;
        const message = JSON.parse(raw);
        if (message.id) {
            const call = pending.get(message.id);
            if (call) {
                clearTimeout(call.timeout);
                pending.delete(message.id);
                if (message.error)
                    call.reject(message.error);
                else
                    call.resolve(message.result);
            }
        }
        else if (message.method === 'Runtime.exceptionThrown')
            errors.push(message.params.exceptionDetails.text);
        else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error')
            errors.push(message.params.args.map(a => a.value ?? a.description).join(' '));
    }
});
function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 20000);
        pending.set(id, { resolve, reject, timeout });
        chrome.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
    });
}
const delay = ms => new Promise(r => setTimeout(r, ms));
(async () => {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const call = (method, params) => send(method, params, sessionId);
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Page.bringToFront');
    const evaluate = async (expression) => { const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }).catch(error => { throw Error(`${expression}: ${JSON.stringify(error)}`); }); if (r.exceptionDetails)
        throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
    const waitFor = async (expression, label = expression) => { for (let i = 0; i < 180; i++) {
        if (await evaluate(expression))
            return;
        await delay(100);
    } throw Error('Not ready: ' + label); };
    const q = JSON.stringify;
    const press = async (key, modifiers = 0) => { const codes = { Enter: 13, ArrowDown: 40, ArrowUp: 38, ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35, Escape: 27, Tab: 9 }; const p = { key, code: key, windowsVirtualKeyCode: codes[key], modifiers }; await call('Input.dispatchKeyEvent', { type: 'keyDown', ...p, ...(key === 'Enter' ? { text: '\r' } : {}) }); await call('Input.dispatchKeyEvent', { type: 'keyUp', ...p }); await delay(80); };
    const click = async (selector) => { await evaluate(`(()=>{const e=document.querySelector(${q(selector)});if(!e)throw Error('Missing '+${q(selector)});e.click()})()`); await delay(80); };
    const real = process.env.TUTOR_REAL === '1';
    await call('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{const original=fetch;window.tutorRequests=[];window.tutorReplies=[];window.fetch=async(input,options)=>{if(!String(input).includes('/api/ai'))return original(input,options);const request=JSON.parse(options.body);window.tutorRequests.push(request);const response=${real ? 'await original(input,options)' : 'await new Promise(resolve=>setTimeout(()=>resolve(Response.json({text:"Formula explanation",proposal:{action:"set_gravity_parameters",parameters:{mass1:80,mass2:null,distance:null}}})),400))'};window.tutorReplies.push({status:response.status,body:await response.clone().json()});return response}})()` });
    const records=[];
    for (const locale of real ? ['es'] : ['es','en','fr']) {
      await call('Emulation.setDeviceMetricsOverride', { width:1280,height:800,deviceScaleFactor:1,mobile:false });
      await call('Page.navigate', {url:(process.env.PANELS_URL||'http://localhost:3000')+`/${locale}/gravity?formula-audit=${Date.now()}#gravity-understanding`});
      await waitFor(`!!document.querySelector('[data-explain-formula]')&&!document.getElementById('gravity-understanding').hidden`);
      await delay(600);
      assert.equal(await evaluate('window.tutorRequests.length'),0);
      const field='#gravity-understanding input[name=mass1]';
      await evaluate(`document.querySelector(${q(field)}).focus();document.querySelector(${q(field)}).select()`);
      await call('Input.insertText',{text:'50'});
      await press('Tab');
      assert.equal(await evaluate('window.tutorRequests.length'),0);
      await evaluate(`document.querySelector('[data-explain-formula]').focus()`);
      await press('Enter');
      // A second activation while pending must not launch another request.
      await click('[data-explain-formula]');
      await waitFor(`!!document.querySelector('#global-tutor-dialog[open]')`);
      await waitFor(`window.tutorReplies.length===1 && document.querySelector('[role=log]').getAttribute('aria-busy')==='false'`);
      assert.equal(await evaluate('window.tutorRequests.length'),1);
      const request=await evaluate('window.tutorRequests[0]');
      assert.equal(request.intent,'explain_formula');
      assert.equal(request.locale,locale);
      assert.equal(request.context.stage,'gravity-understanding');
      assert.equal(request.context.parameters.mass1,50);
      assert.equal(await evaluate('window.tutorReplies[0].status'),200);
      assert.equal(await evaluate(`document.querySelector(${q(field)}).value`),'50');
      await evaluate(`document.querySelector('#global-tutor-question').focus()`);
      await call('Input.insertText',{text:'Explícamelo más fácil'});
      await click('#global-tutor-dialog button[type=submit]');
      await waitFor(`window.tutorReplies.length===2 && document.querySelector('[role=log]').getAttribute('aria-busy')==='false'`);
      const follow=await evaluate('window.tutorRequests[1]');
      assert.equal(follow.messages.length,3);
      assert.equal(follow.intent,undefined);
      assert.equal(await evaluate('window.tutorReplies[1].status'),200);
      await press('Escape');
      assert.equal(await evaluate(`document.activeElement.hasAttribute('data-explain-formula')`),true);
      for(const [width,height] of [[1440,900],[1280,800],[1440,768],[375,667],[320,600]]) {
        await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
        if(width<768) await click('#gravity-understanding [data-panel-select=right]');
        await delay(200);
        const result=await evaluate(`(()=>{const b=document.querySelector('[data-explain-formula]'),r=b.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,width:r.width,height:r.height,label:b.textContent.trim()}})()`);
        assert.ok(result.overflow<=0,JSON.stringify(result));
        assert.ok(result.height>=44);
        records.push({locale,width,height,...result});
      }
      console.log('PASS',locale,real?'real OpenAI responses':'mocked transport','current context, single request, history, focus, five viewports');
      if(real) console.log(JSON.stringify(await evaluate('window.tutorReplies')));
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(join(tmpdir(),'gravity-formula-tutor-results.json'),JSON.stringify(records,null,2));
    await send('Browser.close');
})().catch(error => { console.error(error); process.exitCode = 1; chrome.kill(); }).finally(() => { for (const { timeout } of pending.values())
    clearTimeout(timeout); setTimeout(() => { try {
    rmSync(profile, { recursive: true, force: true });
}
catch { /* Chrome may still be releasing its temporary profile. */ } }, 500); });
