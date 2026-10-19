// node tests/browser/gravity-only-tutor.mjs
// Isolated browser test of the actual provider, dialog and conversation hook.
// A tiny router/intl fixture avoids a running Next server or OpenAI credentials.
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
const directory = mkdtempSync(join(tmpdir(), 'gravity-only-tutor-'));
let chrome;
const pending = new Map();
try {
  const routeFile = join(directory, 'router.js');
  writeFileSync(routeFile, `import {useSyncExternalStore} from 'react';
    let route='/es/gravity#gravity-discovery';const listeners=new Set();
    export const useRoute=()=>useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>route);
    export const usePathname=()=>useRoute().split('#')[0].replace(/^\\/(es|en|fr)(?=\\/|$)/,'');
    export const navigate=value=>{route=value;listeners.forEach(fn=>fn())};`);
  const intlFile = join(directory, 'intl.js');
  writeFileSync(intlFile, `import {useRoute} from './router';
    import es from ${JSON.stringify(join(root, 'messages/es.json'))};
    import en from ${JSON.stringify(join(root, 'messages/en.json'))};
    import fr from ${JSON.stringify(join(root, 'messages/fr.json'))};
    const dictionaries={es,en,fr};export const useLocale=()=>useRoute().split('/')[1];
    export const useTranslations=namespace=>{const locale=useLocale();return(key,values={})=>{
      const text=(namespace+'.'+key).split('.').reduce((value,part)=>value[part],dictionaries[locale]);
      return text.replace(/\\{(\\w+)\\}/g,(_,name)=>String(values[name]));}};
    export const useFormatter=()=>{const locale=useLocale();return{number:(value,options)=>new Intl.NumberFormat(locale,options).format(value)}};`);
  const loaderFile = join(directory, 'loader.cjs');
  writeFileSync(loaderFile, `module.exports=source=>require(${JSON.stringify(require.resolve('typescript'))}).transpileModule(source,{compilerOptions:{module:99,target:7,jsx:4}}).outputText;`);
  const cssLoader = join(directory, 'css.cjs');
  writeFileSync(cssLoader, `module.exports=source=>'module.exports='+JSON.stringify(Object.fromEntries([...source.matchAll(/\\.([a-zA-Z][\\w-]*)/g)].map(match=>[match[1],match[1]])))+';';`);
  const entry = join(directory, 'entry.tsx');
  writeFileSync(entry, `import React,{useLayoutEffect} from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
    import {TutorProvider,TutorContextBridge} from '@/features/ai/presentation/providers/TutorProvider';
    import {useTutorEnvironment} from '@/features/ai/presentation/providers/tutorEnvironment';
    import {orbits} from '@/features/three-body/data/orbits';import {useRoute,navigate} from './router';
    window.slugs=orbits.map(orbit=>orbit.slug);window.requests=[];window.aborts=0;window.hold=false;
    window.fetch=(_url,options)=>{window.requests.push(JSON.parse(options.body));return new Promise((resolve,reject)=>{
      if(window.hold)options.signal.addEventListener('abort',()=>{window.aborts++;reject(new DOMException('Aborted','AbortError'))},{once:true});
      else resolve(Response.json({text:'Educational response'}));});};
    function Page(){const route=useRoute();const {openTutor}=useTutorEnvironment();
      useLayoutEffect(()=>{window.launchTutor=()=>openTutor()},[openTutor]);
      return <main data-route={route}>{route.split('#')[0].endsWith('/gravity')&&<TutorContextBridge context={{kind:'gravity',stage:'gravity-discovery',parameters:{mass1:40,mass2:40,distance:8}}}/>}</main>;}
    createRoot(document.getElementById('root')).render(<TutorProvider><Page/></TutorProvider>);
    window.navigate=route=>flushSync(()=>navigate(route));`);
  await new Promise((resolveBuild, reject) => {
    const compiler = webpack({
      mode: 'production', devtool: false, entry, optimization: { minimize: false }, performance: { hints: false },
      output: { path: directory, filename: 'bundle.js' },
      resolve: { extensions: ['.tsx', '.ts', '.js'], alias: {
        '@/i18n/navigation$': routeFile, 'next-intl$': intlFile, '@': join(root, 'src'),
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
  await call('Page.setDocumentContent', { frameId: (await call('Page.getFrameTree')).frameTree.frame.id,
    html: '<!doctype html><html><body><div id="root"></div></body></html>' });
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
  const navigate = async (route) => {
    await evaluate(`window.navigate(${JSON.stringify(route)})`);
    await waitFor(`document.querySelector('main').dataset.route===${JSON.stringify(route)}`);
  };
  const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await waitFor("!!document.querySelector('#global-tutor-trigger')");
  const slugs = await evaluate('window.slugs');
  assert.equal(slugs.length, 6);
  const records = [];
  for (const locale of ['es', 'en', 'fr']) {
    await navigate(`/${locale}/gravity#gravity-discovery`);
    await click('#global-tutor-trigger');
    await waitFor("document.querySelector('#global-tutor-dialog').open");
    await evaluate('window.hold=false');
    await click('[data-explain-experiment]');
    await waitFor("document.querySelector('[role=log]').textContent.includes('Educational response')");
    assert.equal(await evaluate('window.requests.at(-1).locale'), locale);
    await evaluate('window.hold=true');
    await click('[data-explain-experiment]');
    await waitFor("document.querySelector('[role=log]').getAttribute('aria-busy')==='true'");
    await evaluate('void (window.previousDialog=document.querySelector("#global-tutor-dialog"))');
    const requests = await evaluate('window.requests.length');
    const aborts = await evaluate('window.aborts');
    await navigate(`/${locale}/three-body#discover`);
    await waitFor('window.aborts>' + aborts);
    assert.equal(await evaluate('window.previousDialog.open'), false);
    assert.equal(await evaluate('window.previousDialog.isConnected'), false);
    for (const path of ['/three-body#discover', '/three-body#gallery', '/three-body#experiment', ...slugs.map((slug) => '/three-body/' + slug)]) {
      await navigate(`/${locale}${path}`);
      await evaluate('window.launchTutor()');
      assert.equal(await evaluate("document.querySelectorAll('#global-tutor-trigger,#global-tutor-dialog').length"), 0);
      assert.equal(await evaluate('window.requests.length'), requests);
    }
    await navigate(`/${locale}/gravity#gravity-discovery`);
    assert.equal(await evaluate("document.querySelector('#global-tutor-dialog').open"), false);
    await click('#global-tutor-trigger');
    await waitFor("document.querySelector('#global-tutor-dialog').open");
    await evaluate('window.hold=false');
    await click('[data-explain-experiment]');
    await waitFor('window.requests.length>' + requests + "&&!document.querySelector('[role=log]').getAttribute('aria-busy').includes('true')");
    records.push({ locale, excludedRoutes: 9, closedOnNavigation: true, pendingRequestAborted: true, gravityReopened: true });
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, records }, null, 2));
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill(); await once(chrome, 'exit');
  }
  rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
