// Run against the local app: node tests/browser/gallery-playback.mjs
// Override GALLERY_URL (origin) and CHROME_PATH when needed. No test dependencies.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const executable = process.env.CHROME_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync);
assert.ok(executable, 'Set CHROME_PATH to Chrome/Chromium');
const directory = mkdtempSync(join(tmpdir(), 'gallery-playback-'));
const chrome = spawn(executable, ['--headless=new', '--remote-debugging-pipe',
  '--no-first-run', '--no-default-browser-check', `--user-data-dir=${directory}`, 'about:blank'],
{ stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
const pending = new Map(), errors = [];
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
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  // Count actual orbit drawing mutations, excluding the independent starfield.
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.orbitDraws={};window.galleryDocument={};
    new MutationObserver(records=>{for(const {target} of records){
      if(!target.matches('[data-orbit-body]'))continue;
      const svg=target.closest('svg[data-orbit]');if(!svg)continue;
      const key=(svg.closest('.orbit-card')?'gallery:':'detail:')+svg.dataset.orbit;
      window.orbitDraws[key]=(window.orbitDraws[key]||0)+1;
    }}).observe(document,{subtree:true,attributes:true,attributeFilter:['transform']});
  ` });
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
    throw new Error('Not ready: ' + expression);
  };
  const click = selector => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||e.closest('[inert],[hidden]'))throw Error('Unavailable '+${JSON.stringify(selector)});e.click()})()`);
  const gallery = '#three-body-gallery';
  const card = slug => `${gallery} article:has(svg[data-orbit="${slug}"])`;
  const play = slug => `${card(slug)} button[aria-pressed]`;
  const next = `${gallery} button[aria-controls="orbit-gallery-carousel"]:last-child`;
  const filter = index => `${gallery} [role="group"]:first-child button:nth-child(${index})`;
  const back = 'a[href="/es/three-body#gallery"]';
  const detailControls = '[data-orbit-detail-layout] figure [role="group"] button:first-of-type';
  const draws = prefix => evaluate(`Object.fromEntries(Object.entries(window.orbitDraws).filter(([key])=>key.startsWith(${JSON.stringify(prefix)})))`);
  const assertStopped = async prefix => {
    await delay(150); const before = await draws(prefix); await delay(300);
    assert.deepEqual(await draws(prefix), before, 'No animation frames for ' + prefix);
  };
  const assertRunning = async slug => {
    await evaluate(`document.querySelector('${card(slug)} svg').scrollIntoView({block:'center',behavior:'instant'})`);
    const before = await evaluate(`window.orbitDraws[${JSON.stringify('gallery:' + slug)}]||0`);
    await waitFor(`(window.orbitDraws[${JSON.stringify('gallery:' + slug)}]||0)>${before + 3}`);
  };
  const assertPlayback = async () => {
    for (const [slug, playing] of [['lagrange', true], ['figura-de-ocho', true], ['butterfly-i', false]]) {
      assert.deepEqual(await evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(play(slug))});return [b.getAttribute('aria-pressed'),b.title,b.getAttribute('aria-label')]})()`),
        [String(playing), playing ? 'Pausar' : 'Reproducir', `${playing ? 'Pausar' : 'Reproducir'}: ${slug === 'lagrange' ? 'Lagrange' : slug === 'figura-de-ocho' ? 'Figura de ocho' : 'Butterfly I'}`]);
    }
  };
  const visitAndReturn = async slug => {
    await evaluate("window.scrollTo({top:140,behavior:'instant'});window.galleryDocument.marker='retained'");
    const savedScroll = await evaluate('scrollY');
    assert.ok(savedScroll > 0, 'Exercise nonzero gallery scroll');
    const status = await evaluate(`document.querySelector('${gallery} [role="status"]').textContent`);
    await click(`${card(slug)} a`);
    await waitFor(`location.pathname==='/es/three-body/${slug}'&&!!document.querySelector('[data-orbit-detail-layout]')`);
    assert.equal(await evaluate('window.galleryDocument.marker'), 'retained', 'Client navigation preserves the layout');
    await assertStopped('gallery:');
    // Starting and pausing the detail player must not change gallery preferences.
    const initiallyPlaying = await evaluate(`document.querySelector('${detailControls}').textContent.includes('Pausar')`);
    if (!initiallyPlaying) await click(detailControls);
    const before = await evaluate(`window.orbitDraws['detail:${slug}']||0`);
    await waitFor(`(window.orbitDraws['detail:${slug}']||0)>${before + 3}`);
    await assertStopped('gallery:');
    await click(detailControls); await assertStopped('detail:');
    await click(back);
    await waitFor("location.pathname==='/es/three-body'&&document.querySelector('[data-active-stage]')?.dataset.activeStage==='gallery'");
    await waitFor(`Math.abs(scrollY-${savedScroll})<=1`);
    assert.equal(await evaluate(`document.querySelector('${gallery} [role="status"]').textContent`), status, 'Carousel page preserved');
    await assertStopped('detail:');
  };
  for (const width of [1440, 375]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 600, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: 'about:blank' });
    await waitFor("location.href==='about:blank'");
    await call('Page.navigate', { url: (process.env.GALLERY_URL || 'http://localhost:3000') + '/es/three-body#gallery' });
    await waitFor("document.querySelector('[data-active-stage]')?.dataset.activeStage==='gallery'&&!!document.querySelector('.orbit-card button[aria-pressed]')");
    await delay(500);
    assert.equal(await evaluate("document.querySelectorAll('.orbit-card button[aria-pressed=true]').length"), 0, 'Reload starts paused');
    assert.equal(await evaluate("document.querySelectorAll('.orbit-card a').length"), 6);
    await click(play('lagrange')); await assertRunning('lagrange');
    // Even repeated toggles in one turn must use the latest provider state.
    await evaluate(`document.querySelector('${play('lagrange')}').click();document.querySelector('${play('lagrange')}').click()`);
    if (width < 640) { await click(next); await delay(500); await assertStopped('gallery:lagrange'); }
    await click(play('figura-de-ocho')); await assertRunning('figura-de-ocho');
    await assertPlayback(); await assertStopped('gallery:butterfly-i');
    await visitAndReturn(width < 640 ? 'figura-de-ocho' : 'lagrange');
    await assertPlayback(); await assertRunning(width < 640 ? 'figura-de-ocho' : 'lagrange');
    if (width < 640) await assertStopped('gallery:lagrange');
    // A filtered second page must survive its own detail round trip as well.
    await click(filter(4)); await delay(500); await click(next); await delay(500);
    const filteredSlug = width < 640 ? 'goggles' : 'yin-yang-i';
    await click(play(filteredSlug)); await assertRunning(filteredSlug);
    await visitAndReturn(filteredSlug);
    assert.equal(await evaluate(`document.querySelector('${filter(4)}').getAttribute('aria-pressed')`), 'true', 'Category preserved');
    assert.equal(await evaluate(`document.querySelector('${play(filteredSlug)}').getAttribute('aria-pressed')`), 'true');
    await assertRunning(filteredSlug);
    await click(filter(1)); await delay(500); await assertPlayback();
    await click('button[aria-controls="three-body-discover"]');
    await waitFor("document.querySelector('[data-active-stage]').dataset.activeStage==='discover'");
    await assertStopped('gallery:');
    await click('button[aria-controls="three-body-gallery"]');
    await waitFor("document.querySelector('[data-active-stage]').dataset.activeStage==='gallery'");
    await assertPlayback(); await assertRunning('lagrange');
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'), 'No horizontal overflow');
    console.log(`PASS ${width}px: independent Play/Pause, detail navigation, filter, carousel page, scroll, inactive/off-page suspension and resume`);
  }
  assert.deepEqual(errors, []);
  const exited = once(chrome, 'exit'); await send('Browser.close'); await exited;
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome.exitCode === null && chrome.signalCode === null) { chrome.kill(); await once(chrome, 'exit'); }
  await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
