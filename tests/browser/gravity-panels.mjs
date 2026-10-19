// Run with a local app server: node tests/browser/gravity-panels.mjs
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
    const stageIds = ['gravity-discovery', 'gravity-understanding', 'gravity-laboratory', 'gravity-challenges'];
    const stage = async (id, keyboard = false) => {
        if (await evaluate(`location.hash===${q('#' + id)}&&!document.getElementById(${q(id)}).hidden`)) return;
        const selector = `[data-stage-tag="${id}"]`;
        if (keyboard) {
            await evaluate(`document.querySelector(${q(selector)}).focus()`);
            await press('Enter');
        } else await click(selector);
        await waitFor(`location.hash===${q('#' + id)}&&!document.getElementById(${q(id)}).hidden`);
        assert.equal(await evaluate(`document.querySelector('[data-stage-tag][aria-current="step"]').dataset.stageTag`), id);
        await delay(120);
    };
    const challengeLayout = async () => {
        await stage('gravity-challenges', true);
        const result = await evaluate(`(()=>{const stage=document.getElementById('gravity-challenges'),card=stage.querySelector('[data-practice]');return {panels:stage.querySelectorAll('[data-gravity-split-panels],[data-panel-toggle],[data-panel-select],[data-understanding-simulation]').length,width:card.getBoundingClientRect().width,available:stage.clientWidth,overflow:document.documentElement.scrollWidth-innerWidth}})()`);
        assert.equal(result.panels, 0);
        assert.ok(result.width <= result.available && result.width > 250, JSON.stringify(result));
        assert.ok(result.overflow<=0);
    };
    const records = [];
    await call('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{const original=fetch;window.aiCalls=0;window.fetch=(input,...rest)=>{if(String(input).includes('/api/ai')){window.aiCalls++;return Promise.resolve(Response.json({text:'Test reply'}))}return original(input,...rest)}})()` });
    await call('Page.navigate', { url: (process.env.PANELS_URL || 'http://localhost:3000') + '/es/gravity#gravity-discovery' });
    await waitFor(`!!document.querySelector('#gravity-discovery [data-panel-toggle=left]')&&!document.getElementById('gravity-discovery').hidden`);
    await delay(500);
    const root = id => `#${id} [data-gravity-split-panels]`;
    const measure = async (id) => evaluate(`(()=>{const root=document.querySelector(${q(root(id))}),grid=root.querySelector('[data-gravity-stage-layout]');return {state:grid.dataset.collapsed,overflow:document.documentElement.scrollWidth-innerWidth,width:grid.clientWidth,panels:[...grid.children].map(p=>{const c=p.querySelector('[id]');const r=p.getBoundingClientRect();return {width:r.width,height:r.height,open:p.dataset.open,inert:c.inert,visible:getComputedStyle(p).display!=='none',contentWidth:c.getBoundingClientRect().width,contentHeight:c.getBoundingClientRect().height,contentOverflow:c.scrollWidth-c.clientWidth,cardHeight:c.firstElementChild.getBoundingClientRect().height}})}})()`);
    for (const [width, height] of [[1440, 900], [1280, 800], [1440, 768]]) {
        await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        for (const id of stageIds.slice(0, 3)) {
            await stage(id);
            await delay(300);
            if (id === 'gravity-discovery') {
                for (let tab = 0; tab < 4; tab++) {
                    await evaluate(`[...document.querySelectorAll('#gravity-discovery [role=tab]')][${tab}].click()`);
                    await delay(80);
                    const view = await measure(id);
                    assert.ok(view.overflow <= 0);
                    assert.ok(Math.abs(view.panels[0].cardHeight - view.panels[1].cardHeight) < 1);
                }
            }
            const initial = await measure(id);
            assert.equal(initial.state, 'none');
            assert.ok(Math.abs(initial.panels[0].width - initial.panels[1].width) < 1);
            assert.ok(Math.abs(initial.panels[0].cardHeight - initial.panels[1].cardHeight) < 1, JSON.stringify({ id, initial }));
            const controlled = await evaluate(`document.querySelector(${q(root(id) + ' [data-panel-toggle=left]')}).getAttribute('aria-controls')`);
            assert.ok(controlled);
            await click(root(id) + ' [data-panel-toggle=left]');
            const during = await measure(id);
            await delay(300);
            const left = await measure(id);
            assert.equal(left.panels[0].width, 48);
            assert.equal(left.panels[0].inert, true);
            assert.ok(left.panels[1].width > initial.panels[1].width);
            assert.ok(during.panels[0].width > 48 && during.panels[0].width < initial.panels[0].width, 'grid interpolates');
            await click(root(id) + ' [data-panel-toggle=right]');
            await delay(300);
            const right = await measure(id);
            assert.equal(right.panels[1].width, 48);
            assert.equal(right.panels[0].inert, false);
            assert.equal(right.panels[1].inert, true);
            assert.equal(await evaluate(`(()=>{const body=document.querySelector(${q(root(id))}).querySelector('[data-side=right] [inert]');body.querySelector('input,button,[tabindex]')?.focus();return body.contains(document.activeElement)})()`), false);
            await evaluate(`document.querySelector(${q(root(id) + ' [data-panel-toggle=right]')}).focus()`);
            await press('Enter');
            await delay(300);
            const restored = await measure(id);
            assert.equal(restored.state, 'none');
            for (const r of [initial, during, left, right, restored])
                assert.ok(r.overflow <= 0, JSON.stringify({ id, width, r }));
            records.push({ id, width, height, initial, during, left, right, restored });
        }
        await challengeLayout();
    }
    // State and focus: education tab, incomplete formula draft, slider and checked challenge.
    await stage('gravity-discovery');
    await click('#gravity-discovery [role=tab]:last-child');
    const historyId = await evaluate(`document.querySelector('#gravity-discovery [role=tab][aria-selected=true]').id`);
    await click(root('gravity-discovery') + ' [data-panel-toggle=left]');
    await click(root('gravity-discovery') + ' [data-panel-toggle=left]');
    await delay(300);
    assert.equal(await evaluate(`document.querySelector('#gravity-discovery [role=tab][aria-selected=true]').id`), historyId);
    await stage('gravity-understanding');
    await evaluate(`void(window.originalFormula=document.querySelector('#gravity-understanding input[name=mass1]'))`);
    const mass = '#gravity-understanding input[name=mass1]';
    await evaluate(`document.querySelector(${q(mass)}).focus();document.querySelector(${q(mass)}).select()`);
    await call('Input.insertText', { text: '60,5' });
    const distance = '#gravity-understanding input[name=distance]';
    await evaluate(`document.querySelector(${q(distance)}).focus();document.querySelector(${q(distance)}).select()`);
    await call('Input.insertText', { text: '1e-' });
    await click(root('gravity-understanding') + ' [data-panel-toggle=right]');
    assert.equal(await evaluate('document.activeElement.dataset.panelToggle'), 'right');
    await click(root('gravity-understanding') + ' [data-panel-toggle=right]');
    await delay(300);
    assert.equal(await evaluate(`document.querySelector(${q(distance)}).value`), '1e-');
    assert.equal(await evaluate(`document.querySelector(${q(mass)}).value`), '60,5');
    assert.equal(await evaluate(`window.originalFormula===document.querySelector('#gravity-understanding input[name=mass1]')`), true);
    await stage('gravity-laboratory');
    await evaluate(`document.querySelector('#gravity-laboratory input[type=range]').focus()`);
    await press('ArrowRight');
    const slider = await evaluate(`document.querySelector('#gravity-laboratory input[type=range]').value`);
    await click(root('gravity-laboratory') + ' [data-panel-toggle=right]');
    await click(root('gravity-laboratory') + ' [data-panel-toggle=right]');
    await delay(300);
    assert.equal(await evaluate(`document.querySelector('#gravity-laboratory input[type=range]').value`), slider);
    await stage('gravity-challenges');
    assert.ok(await evaluate(`!!document.querySelector('[data-practice]')`));
    for (const [width, height] of [[375, 667], [320, 600]]) {
        await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
        for (const id of stageIds.slice(0, 3)) {
            await stage(id);
            await delay(300);
            for (const side of ['left', 'right', 'left']) {
                await evaluate(`document.querySelector(${q(root(id) + ` [data-panel-select=${side}]`)}).focus()`);
                await press('Enter');
                await delay(260);
                const r = await measure(id);
                assert.equal(r.panels.filter(p => p.visible).length, 1);
                assert.equal(r.panels[side === 'left' ? 1 : 0].inert, true);
                assert.ok(r.overflow <= 0, JSON.stringify({ id, width, r }));
                assert.equal(r.panels[side === 'left' ? 0 : 1].contentOverflow, 0, JSON.stringify({ id, width, r }));
                records.push({ id, width, height, side, ...r });
            }
        }
        await challengeLayout();
    }
    // Resize while a formula input has focus: transfer to the visible mobile switch.
    await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await stage('gravity-understanding');
    await delay(300);
    await evaluate(`document.querySelector(${q(mass)}).focus()`);
    await call('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
    await delay(300);
    assert.equal(await evaluate('document.activeElement.dataset.panelSelect'), 'left');
    await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await delay(100);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#gravity-understanding [data-gravity-stage-layout]')).transitionDuration`), '0s');
    await click(root('gravity-understanding') + ' [data-panel-toggle=left]');
    assert.equal((await measure('gravity-understanding')).panels[0].width, 48);
    assert.equal(await evaluate('window.aiCalls'), 0);
    // All localized tags, one stage navigation, and the adaptive practice entry.
    for (const locale of ['es', 'en', 'fr']) {
        const t = JSON.parse(fs.readFileSync(`messages/${locale}.json`, 'utf8')).Gravity;
        await call('Page.navigate', { url: (process.env.PANELS_URL || 'http://localhost:3000') + `/${locale}/gravity?panel-audit=${locale}#gravity-discovery` });
        await waitFor(`document.documentElement.lang==='${locale}' && !!document.querySelector('[data-stage-tag]')`);
        await evaluate('window.sameDocument=true');
        for (const [width,height] of [[1440,900],[1280,800],[1440,768],[375,667],[320,600]]) {
            await call('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:width<768});
            for (const id of stageIds) {
                await stage(id,true);
                assert.equal(await evaluate('window.sameDocument'),true);
                assert.equal(await evaluate(`document.querySelectorAll('[data-gravity-stage-tags]').length`),1);
                assert.equal(await evaluate(`document.querySelectorAll('#gravity-stage-selector').length`),0);
                const tags=await evaluate(`[...document.querySelectorAll('[data-stage-tag]')].map(e=>({text:e.textContent,overflow:e.scrollWidth-e.clientWidth,height:e.getBoundingClientRect().height}))`);
                assert.deepEqual(tags.map(e=>e.text),Object.values(t.stageTags).map((title,index)=>`0${index+1} · ${title}`));
                assert.ok(tags.every(e=>e.overflow<=0&&e.height>=44));
                assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
            }
            await challengeLayout();
        }
        assert.equal(await evaluate('window.aiCalls'),0);
        console.log('PASS',locale,'tags, keyboard navigation, all five viewports, full-width challenges, adaptive practice entry');
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(join(tmpdir(), 'gravity-panels-results.json'), JSON.stringify(records, null, 2));
    console.log('PASS stages 01–03, all five viewports, 50/50 and 48px rails, interpolated grid, no double collapse, equal card heights, mobile switching, state preservation, focus transfer, reduced motion, no overflow/errors/API calls.');
    await send('Browser.close');
})().catch(error => { console.error(error); process.exitCode = 1; chrome.kill(); }).finally(() => { for (const { timeout } of pending.values())
    clearTimeout(timeout); setTimeout(() => { try {
    rmSync(profile, { recursive: true, force: true });
}
catch { /* Chrome may still be releasing its temporary profile. */ } }, 500); });
