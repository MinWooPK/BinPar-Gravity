// node tests/browser/gravity-split-panels.mjs
// Real split-panel component, CSS and shared parameter provider in Chrome.
// Stateful child fixtures verify preservation, synchronization and keyboard access.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = resolve('.');
const directory = mkdtempSync(join(tmpdir(), 'gravity-split-panels-'));
let chrome;
const pending = new Map();
try {
  const intlFile = join(directory, 'intl.js');
  writeFileSync(intlFile, `import es from ${JSON.stringify(join(root, 'messages/es.json'))};
    export const useTranslations=()=> (key,values={})=>es.Gravity.panels[key].replace(/\\{(\\w+)\\}/g,(_,name)=>String(values[name]));`);
  const loaderFile = join(directory, 'loader.cjs');
  writeFileSync(loaderFile, `module.exports=source=>require(${JSON.stringify(require.resolve('typescript'))}).transpileModule(source,{compilerOptions:{module:99,target:7,jsx:4}}).outputText;`);
  const cssLoader = join(directory, 'css.cjs');
  writeFileSync(cssLoader, `module.exports=source=>{
    const names=Object.fromEntries([...source.matchAll(/\\.([a-zA-Z][\\w-]*)/g)].map(match=>[match[1],match[1]]));
    return 'const style=document.createElement("style");style.textContent='+JSON.stringify(source)+';document.head.append(style);module.exports='+JSON.stringify(names)+';';};`);
  const entry = join(directory, 'entry.tsx');
  writeFileSync(entry, `import React,{useState,useEffect} from 'react';import {createRoot} from 'react-dom/client';
    import {GravitySplitPanels} from '@/features/gravity/presentation/components/shared/GravitySplitPanels';
    import {GravityParametersProvider,useGravityParameters} from '@/features/gravity/presentation/providers/GravityParametersProvider';
    window.mounts={left:0,right:0};
    function Card({side}){const [count,setCount]=useState(0);const {parameters,setParameters}=useGravityParameters();
      useEffect(()=>{window.mounts[side]++},[]);
      return <section data-card={side} data-discovery-education={side==='left'?'':undefined}>
        <h2>{side} card</h2><input aria-label={side+' draft'} defaultValue="original"/>
        <button data-count={side} onClick={()=>setCount(count+1)}>{count}</button>
        <button data-mass={side} onClick={()=>setParameters(p=>({...p,mass1:p.mass1+1}))}>Change mass</button>
        <output data-value={side}>{parameters.mass1}</output></section>}
    createRoot(document.getElementById('root')).render(<GravityParametersProvider>
      <GravitySplitPanels leftLabel="Education" rightLabel="Science" left={<Card side="left"/>} right={<Card side="right"/>}/>
    </GravityParametersProvider>);`);
  await new Promise((resolveBuild, reject) => {
    const compiler = webpack({
      mode: 'production', devtool: false, entry, optimization: { minimize: false }, performance: { hints: false },
      output: { path: directory, filename: 'bundle.js' },
      resolve: { extensions: ['.tsx', '.ts', '.js'], alias: {
        'next-intl$': intlFile, '@': join(root, 'src'),
        react: join(root, 'node_modules/react'), 'react-dom': join(root, 'node_modules/react-dom'),
      } },
      module: { rules: [{ test: /\.tsx?$/, use: loaderFile }, { test: /\.css$/, use: cssLoader }] },
    });
    compiler.run((error, stats) => compiler.close(() => {
      if (error || stats.hasErrors()) reject(error ?? new Error(stats.toString({ all: false, errors: true })));
      else resolveBuild();
    }));
  });

  const executable = process.env.CHROME_PATH || [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
  ].find(existsSync);
  assert.ok(executable, 'Set CHROME_PATH to Chrome/Chromium');
  chrome = spawn(executable, ['--headless=new', '--remote-debugging-pipe', '--disable-background-networking',
    '--no-first-run', '--no-default-browser-check', `--user-data-dir=${join(directory, 'profile')}`, 'about:blank'],
  { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
  let sequence = 0, buffer = '';
  const errors = [];
  chrome.stdio[3].on('error', () => {});
  chrome.stdio[4].on('data', (data) => {
    buffer += data.toString();
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
      const raw = buffer.slice(0, end); buffer = buffer.slice(end + 1);
      if (!raw) continue;
      const message = JSON.parse(raw);
      const request = pending.get(message.id);
      if (request) {
        clearTimeout(request.timeout); pending.delete(message.id);
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
      else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args);
    }
  });
  chrome.on('exit', () => { for (const request of pending.values()) request.reject(new Error('Chrome exited')); });
  const send = (method, params = {}, sessionId) => new Promise((resolveCall, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 10000);
    pending.set(id, { resolve: resolveCall, reject, timeout });
    chrome.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call('Runtime.enable');
  await call('Page.enable');
  await call('Page.bringToFront');
  await call('Emulation.setFocusEmulationEnabled', { enabled: true });
  await call('Page.setDocumentContent', { frameId: (await call('Page.getFrameTree')).frameTree.frame.id,
    html: `<!doctype html><html><head><style>
      *{box-sizing:border-box}body{margin:20px;background:#080c14;color:white}
      [data-card]{border:1px solid #30364b;border-radius:14px;padding:16px;min-height:300px}
      h2{margin:0 0 10px}input{max-width:100%}button{min-height:44px}
      @media(min-width:1024px){[role=group]{display:none}}
    </style></head><body><div id="root"></div></body></html>` });
  const evaluate = async (expression) => {
    const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  await evaluate(readFileSync(join(directory, 'bundle.js'), 'utf8'));
  const waitFor = async (expression) => {
    for (let i = 0; i < 400; i++) {
      if (await evaluate(expression)) return;
      await new Promise((resolveWait) => setTimeout(resolveWait, 20));
    }
    throw new Error(`Not ready: ${expression}`);
  };
  const resize = async width => {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  };
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const rect = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`);
  const toggle = '[data-panel-toggle="left"]';
  const left = '[data-side="left"]';
  const right = '[data-side="right"]';
  const grid = '[data-gravity-stage-layout]';
  const settle = () => evaluate('new Promise(resolve=>setTimeout(resolve,300))');
  const assertRail = async () => {
    const rail = await rect(left), control = await rect(toggle), expanded = await rect(right);
    const gap = await evaluate(`parseFloat(getComputedStyle(document.querySelector('${grid}')).columnGap)`);
    assert.equal(rail.width, 48);
    assert.ok(Math.abs(expanded.width + rail.width + gap - (await rect(grid)).width) < 1);
    assert.ok(Math.abs(control.top + control.height / 2 - rail.top - rail.height / 2) < 1);
    assert.ok(Math.abs(control.left + control.width / 2 - rail.left - rail.width / 2) < 1);
    assert.ok(control.left >= rail.left && control.right <= rail.right);
    assert.equal(rail.top, expanded.top);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${left}')).borderRadius`), '14px');
    assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('${left}')).backgroundImage`), 'none');
    assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('${left}')).boxShadow`), 'none');
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  };
  await resize(1280);
  await waitFor('!!document.querySelector("[data-panel-toggle]")');
  assert.equal(await evaluate('document.querySelectorAll("[data-panel-toggle]").length'), 1);
  assert.equal(await evaluate(`document.querySelector('${toggle}').getAttribute('aria-expanded')`), 'true');
  assert.ok(Math.abs((await rect(left)).width - (await rect(right)).width) < 1);
  const button = await rect(toggle), panel = await rect(left);
  assert.ok(button.width >= 44 && button.height >= 44);
  assert.equal(Math.round(panel.right - button.right), 10);
  assert.equal(Math.round(button.top - panel.top), 10);
  await evaluate(`window.leftInput=document.querySelector('[data-card="left"] input');window.leftInput.value='preserved';void 0`);
  await click('[data-count="left"]');
  // Native keyboard activation and focus retention when collapsing.
  await evaluate(`document.querySelector('${toggle}').focus()`);
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await waitFor(`document.querySelector('${toggle}').getAttribute('aria-expanded')==='false'`);
  await settle();
  await assertRail();
  assert.equal(await evaluate('window.leftInput.closest("[inert]")!==null'), true);
  assert.equal(await evaluate(`document.activeElement.matches('${toggle}')`), true);
  // Hidden children stay mounted and receive live updates from the actual provider.
  const previousMass = await evaluate('Number(document.querySelector("[data-value=right]").textContent)');
  await click('[data-mass="right"]');
  await waitFor(`Number(document.querySelector('[data-value="left"]').textContent)===${previousMass + 1}`);
  await waitFor(`document.querySelector('[data-value="left"]').textContent===document.querySelector('[data-value="right"]').textContent`);
  await click('[data-count="right"]');
  await click(toggle);
  await settle();
  assert.ok(Math.abs((await rect(left)).width - (await rect(right)).width) < 1);
  assert.equal(await evaluate(`window.leftInput===document.querySelector('[data-card="left"] input')&&window.leftInput.value==="preserved"`), true);
  assert.deepEqual(await evaluate('Array.from(document.querySelectorAll("[data-count]")).map(el=>el.textContent)'), ['1','1']);
  // Desktop collapse state survives mobile panel selection and resizing.
  await click(toggle);
  await evaluate(`document.querySelector('${toggle}').focus()`);
  await resize(390);
  await waitFor(`document.activeElement.matches('[data-panel-select="left"]')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('${toggle}')).display`), 'none');
  assert.equal(await evaluate('window.leftInput.closest("[inert]")===null'), true);
  await click('[data-panel-select="right"]');
  await waitFor(`document.querySelector('${right}').dataset.open==='true'`);
  assert.equal(await evaluate('window.leftInput.closest("[inert]")!==null'), true);
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await click('[data-panel-select="left"]');
  await evaluate('window.leftInput.focus()');
  await resize(1280);
  await waitFor(`document.activeElement.matches('${toggle}')`);
  await settle();
  await assertRail();
  await click(toggle);
  await settle();
  // Moving to mobile while the right input has focus restores focus to the selector.
  await evaluate(`document.querySelector('[data-card="right"] input').focus()`);
  await resize(320);
  await waitFor(`document.activeElement.matches('[data-panel-select="left"]')`);
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await resize(1280);
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('${grid}')).transitionDuration`), '0s');
  assert.deepEqual(await evaluate('window.mounts'), { left: 1, right: 1 });

  assert.deepEqual(errors, []);
  console.log("Passed: equal widths, visible 48px rail with centered control, single top-right control when open, keyboard, focus, mobile, reduced motion, preserved state and parameter synchronization.");
  const exited = once(chrome, 'exit');
  await send('Browser.close');
  await exited;
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill(); await once(chrome, 'exit');
  }
  rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
