// Run with a local app server: node tests/browser/gravity-experiment-tutor.mjs
// TUTOR_REAL=1 opts into three real OpenAI requests (requires configured server).
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

    const real=process.env.TUTOR_REAL==='1';
    await call('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const original=fetch;window.requests=[];window.replies=[];window.invalidProposal=false;window.fetch=async(input,options)=>{if(!String(input).includes('/api/ai'))return original(input,options);const request=JSON.parse(options.body);window.requests.push(request);const reply=${real ? 'await original(input,options)' : 'await new Promise(resolve=>setTimeout(()=>resolve(Response.json({text:"Educational response",proposal:{action:"set_gravity_parameters",parameters:{mass1:window.invalidProposal?101:80,mass2:null,distance:12}}})),350))'};window.replies.push({status:reply.status,body:await reply.clone().json()});return reply}})()`});
    const slider='#gravity-laboratory input[type=range]';
    const values=()=>evaluate(`[...document.querySelectorAll('${slider}')].map(e=>Number(e.value))`);
    const editSlider=async(key)=>{await evaluate(`document.querySelector('${slider}').focus()`);await press(key);};
    const submit=async(question)=>{
      const count=await evaluate('window.replies.length');
      await evaluate(`document.querySelector('#global-tutor-question').focus()`);
      await call('Input.insertText',{text:question});
      await click('#global-tutor-dialog button[type=submit]');
      await waitFor(`window.replies.length===${count+1}&&document.querySelector('[role=log]').getAttribute('aria-busy')==='false'`);
      assert.equal(await evaluate('window.replies.at(-1).status'),200);
    };
    const records=[];
    for(const locale of real?['es']:['es','en','fr']){
      await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
      await call('Page.navigate',{url:(process.env.PANELS_URL||'http://localhost:3100')+`/${locale}/gravity?experiment=${Date.now()}#gravity-laboratory`});
      await waitFor(`!!document.querySelector('[data-experiment-explain]')&&!document.getElementById('gravity-laboratory').hidden`);
      await delay(500);
      await editSlider('ArrowRight');
      assert.deepEqual(await values(),[41,40,8]);
      assert.equal(await evaluate('window.requests.length'),0);
      await evaluate(`document.querySelector('[data-experiment-explain]').focus()`);
      await press('Enter');
      await click('[data-experiment-explain]');
      await waitFor(`window.replies.length===1&&document.querySelector('[role=log]').getAttribute('aria-busy')==='false'`);
      const request=await evaluate('window.requests[0]');
      assert.equal(request.locale,locale);
      assert.equal(request.intent,'explain_experiment');
      assert.equal(request.context.stage,'gravity-laboratory');
      assert.deepEqual(request.context.parameters,{mass1:41,mass2:40,distance:8});
      assert.equal(await evaluate('window.requests.length'),1);
      assert.equal(await evaluate('window.replies[0].status'),200);
      assert.equal(await evaluate(`document.querySelectorAll('[data-tutor-proposal]').length`),0);
      assert.deepEqual(await values(),[41,40,8]);
      await press('Escape');
      assert.equal(await evaluate(`document.activeElement.hasAttribute('data-experiment-explain')`),true);
      await editSlider('ArrowLeft');
      await evaluate(`document.querySelector('[data-experiment-configure]').focus()`);
      await press('Enter');
      await waitFor(`!!document.querySelector('#global-tutor-dialog[open]')`);
      assert.equal(await evaluate('window.requests.length'),1);
      assert.equal(await evaluate('document.activeElement.id'),'global-tutor-question');
      assert.ok(await evaluate(`document.querySelector('#tutor-configure-hint').textContent.length>20`));
      assert.deepEqual(await values(),[40,40,8]);
      const beforeSvg=await evaluate(`document.querySelector('#gravity-laboratory circle[data-simulation-variable=mass1]').getAttribute('r')`);
      const beforeForce=await evaluate(`document.querySelector('#gravity-laboratory [data-simulation-variable=force] output').getAttribute('aria-label')`);
      const question='Duplica la primera masa y aumenta la distancia a 12 metros';
      await submit(question);
      assert.equal(await evaluate('window.requests.at(-1).intent'),undefined);
      assert.equal(await evaluate('window.requests.at(-1).messages.length'),3);
      await waitFor(`!!document.querySelector('[data-tutor-proposal=pending]')`);
      assert.deepEqual(await values(),[40,40,8]);
      await click('[data-proposal-cancel]');
      assert.ok(await evaluate(`!!document.querySelector('[data-tutor-proposal=cancelled]')`));
      assert.deepEqual(await values(),[40,40,8]);
      await submit(question);
      await click('[data-proposal-apply]');
      assert.ok(await evaluate(`!!document.querySelector('[data-tutor-proposal=applied]')`));
      assert.deepEqual(await values(),[80,40,12]);
      assert.notEqual(await evaluate(`document.querySelector('#gravity-laboratory circle[data-simulation-variable=mass1]').getAttribute('r')`),beforeSvg);
      assert.notEqual(await evaluate(`document.querySelector('#gravity-laboratory [data-simulation-variable=force] output').getAttribute('aria-label')`),beforeForce);
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('#gravity-understanding input[name]')].filter(e=>e.name!=='force').map(e=>Number(e.value))`),[80,40,12]);
      await press('Escape');
      assert.equal(await evaluate(`document.activeElement.hasAttribute('data-experiment-configure')`),true);
      if(!real){
        await editSlider('ArrowLeft'); // 79, allows a new proposed 80
        await click('[data-experiment-configure]');
        await submit('Pon la masa 1 en 80 kg');
        await press('Escape');
        await editSlider('ArrowRight'); await editSlider('ArrowLeft');
        await click('[data-experiment-configure]');
        await click('[data-proposal-apply]');
        assert.ok(await evaluate(`!!document.querySelector('[data-tutor-proposal=stale]')`));
        assert.deepEqual(await values(),[79,40,12]);
        await evaluate('window.invalidProposal=true');
        await submit('Pon la masa 1 en 101 kg');
        assert.equal(await evaluate(`document.querySelectorAll('[data-proposal-apply]').length`),0);
        assert.deepEqual(await values(),[79,40,12]);
        await press('Escape');
      }
      const expected=await values();
      for(const [width,height] of [[1440,900],[1280,800],[1440,768],[375,667],[320,600]]){
        await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
        if(width<768){
          await click('#gravity-laboratory [data-panel-select=left]');
          await click('#gravity-laboratory [data-panel-select=right]');
        }else{
          await click('#gravity-laboratory [data-panel-toggle=right]');
          await click('#gravity-laboratory [data-panel-toggle=right]');
        }
        await delay(300);
        const view=await evaluate(`({overflow:document.documentElement.scrollWidth-innerWidth,buttons:[...document.querySelectorAll('[data-experiment-configure],[data-experiment-explain]')].map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,label:e.textContent.trim()}})})`);
        assert.ok(view.overflow<=0,JSON.stringify(view));
        assert.ok(view.buttons.every(b=>b.height>=44&&b.width>0));
        assert.deepEqual(await values(),expected);
        records.push({locale,width,height,...view});
        if(locale==='es' && (width===1280 || width===375)){
          const {data}=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
          fs.writeFileSync(join(tmpdir(),`experiment-tutor-${width}.png`),Buffer.from(data,'base64'));
        }
      }
      console.log('PASS',locale,real?'real OpenAI':'mocked API','explain, configure, context, read-only, cancel/apply, formula sync, panels, responsive',real?'':'stale and invalid proposals');
      if(real) console.log(JSON.stringify(await evaluate('window.replies')));
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(join(tmpdir(),'gravity-experiment-tutor-results.json'),JSON.stringify(records,null,2));
    await send('Browser.close');
})().catch(error => { console.error(error); process.exitCode = 1; chrome.kill(); }).finally(() => { for (const { timeout } of pending.values())
    clearTimeout(timeout); setTimeout(() => { try {
    rmSync(profile, { recursive: true, force: true });
}
catch { /* Chrome may still be releasing its temporary profile. */ } }, 500); });
