// node tests/browser/global-tutor.mjs
// Global tutor, real Gravity stages, Three Body experiment, persistence and CSS.
// Router/intl fixtures and mock API responses avoid external credentials.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { checkGravityRangeWarning } from './check-gravity-range-warning.mjs';

const require = createRequire(import.meta.url);
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = resolve('.');
const directory = mkdtempSync(join(tmpdir(), 'global-tutor-'));
let chrome;
const pending = new Map();
try {
  const routeFile = join(directory, 'router.js');
  writeFileSync(routeFile, `import {useSyncExternalStore} from 'react';
    let route='/es/gravity';const listeners=new Set();
    export const useRoute=()=>useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>route);
    export const usePathname=()=>useRoute().split('#')[0].replace(/^\\/(es|en|fr)(?=\\/|$)/,'');
    export const navigate=value=>{route=value;listeners.forEach(fn=>fn())};`);
  const intlFile = join(directory, 'intl.js');
  writeFileSync(intlFile, `import {useRoute} from './router';
    import es from ${JSON.stringify(join(root, 'messages/es.json'))};
    import en from ${JSON.stringify(join(root, 'messages/en.json'))};
    import fr from ${JSON.stringify(join(root, 'messages/fr.json'))};
    const dictionaries={es,en,fr};export const useLocale=()=>useRoute().split('/')[1];
    export const useTranslations=namespace=>{const locale=useLocale();const translate=(key,values={})=>{
      const text=(namespace+'.'+key).split('.').reduce((value,part)=>value[part],dictionaries[locale]);
      return text.replace(/\\{(\\w+)\\}/g,(_,name)=>String(values[name]));};translate.rich=(key,values={})=>translate(key,values).replace(/<[^>]+>/g,'');return translate;};
    export const useFormatter=()=>{const locale=useLocale();return{number:(value,options)=>new Intl.NumberFormat(locale,options).format(value)}};`);
  const loaderFile = join(directory, 'loader.cjs');
  writeFileSync(loaderFile, `module.exports=source=>require(${JSON.stringify(require.resolve('typescript'))}).transpileModule(source,{compilerOptions:{module:99,target:7,jsx:4}}).outputText;`);
  const cssLoader = join(directory, 'css.cjs');
  writeFileSync(cssLoader, `module.exports=function(source){
    const prefix=require('node:path').basename(this.resourcePath).replace(/[^a-zA-Z]/g,'');
    const names=Object.fromEntries([...source.matchAll(/\\.([a-zA-Z][\\w-]*)/g)].map(match=>[match[1],prefix+'_'+match[1]]));
    const css=source.replace(/:global\\(([^)]+)\\)/g,'$1').replace(/\\.([a-zA-Z][\\w-]*)/g,(_,name)=>'.'+names[name]);
    return 'const style=document.createElement("style");style.textContent='+JSON.stringify(css)+';document.head.append(style);module.exports='+JSON.stringify(names)+';';};`);
  const entry = join(directory, 'entry.tsx');
  writeFileSync(entry, `import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
    import {useTutorActions} from '@/features/ai/presentation/providers/tutorEnvironment';
    import {TutorProvider} from '@/features/ai/presentation/providers/TutorProvider';
    import {GravityParametersProvider,useGravityParameters} from '@/features/gravity/presentation/providers/GravityParametersProvider';
    import {GravityIntroduction} from '@/features/gravity/presentation/components/GravityIntroduction';
    import {GravityLab} from '@/features/gravity/presentation/components/challenges/GravityLab';
    import {GravityJourney,GravityJourneyPanel} from '@/features/gravity/presentation/components/GravityJourneyTabs';
    import {GravityFormulaAccess,GravityFormulaButton} from '@/features/gravity/presentation/components/understanding/GravityFormulaAccess';
    import {gravityStageById} from '@/features/gravity/application/gravityJourney';
    import {useRoute,navigate} from './router';
    import {TutorContextBridge} from '@/features/ai/presentation/providers/TutorProvider';
    import {ExplainWithAI} from '@/features/ai/presentation/components/ExplainWithAI';
    import {ThreeBodyExperiment} from '@/features/three-body/presentation/components/experiment/ThreeBodyExperiment';
    import {simulateExperiment} from '@/features/three-body/domain/experiment-simulation';
    import {detectPeriodicity} from '@/features/three-body/domain/periodicity-detection';
    window.Worker=class {terminate(){this.stopped=true}postMessage({id,config}){setTimeout(()=>{if(this.stopped)return;try{const trajectory=simulateExperiment(config);const {duration,samples,bounds}=trajectory;const periodicity=detectPeriodicity(trajectory,{G:config.gravity,masses:config.bodies.map(b=>b.mass)});this.onmessage?.({data:{id,ok:true,result:{duration,samples,bounds,periodicity}}})}catch{this.onmessage?.({data:{id,ok:false,error:'tooClose'}})}},10)}};
    
    window.requests=[];window.failNext=false;window.hold=false;window.aborts=0;
    window.fetch=(url,options)=>{const body=JSON.parse(options.body);window.requests.push({url,body});
      if(url==='/api/practice')return Promise.resolve(Response.json({error:'not_configured'},{status:503}));
      if(window.failNext){window.failNext=false;return Promise.resolve(Response.json({error:'unavailable'},{status:503}));}
      const data={text:'Response '+window.requests.length+' '+body.context.stage+' '+body.messages.at(-1).content,
        proposal:body.context.kind==='gravity'&&body.context.stage==='gravity-laboratory'&&!body.intent ? {action:'set_gravity_parameters',parameters:{mass1:80,mass2:null,distance:null}} : null};
      if(window.hold)return new Promise((resolve,reject)=>{window.release=()=>resolve(Response.json(data));options.signal.addEventListener('abort',()=>{window.aborts++;reject(new DOMException('Aborted','AbortError'))},{once:true})});
      return Promise.resolve(Response.json(data));};
    function Parameters(){window.openTutor=useTutorActions().openTutor;const {parameters}=useGravityParameters();window.parameters=parameters;return null;}
    function ThreeBody(){const [stage,setStage]=React.useState('gallery');window.selectThreeStage=setStage;return <div><button onClick={()=>setStage('experiment')}>Experiment</button>{stage!=='experiment'?<><TutorContextBridge context={{kind:'three-body',stage}}/><ExplainWithAI topic="threeBody"/></>:<ThreeBodyExperiment/>}</div>}
    function Page(){const route=useRoute();const slug=route.split('/three-body/')[1];return <main data-route={route}>{route.endsWith('/gravity')&&<GravityParametersProvider><Parameters/><GravityFormulaAccess>
      <GravityFormulaButton/>
      <GravityJourney introduction={<p>Gravity</p>}>
        <GravityJourneyPanel stage={gravityStageById['gravity-discovery']}><p>Discovery</p></GravityJourneyPanel>
        <GravityJourneyPanel stage={gravityStageById['gravity-understanding']}><GravityIntroduction/></GravityJourneyPanel>
        <GravityLab/>
      </GravityJourney>
    </GravityFormulaAccess></GravityParametersProvider>}{route.endsWith('/three-body')&&<ThreeBody/>}{slug&&<><TutorContextBridge context={{kind:'three-body',stage:'orbit',slug}}/><ExplainWithAI topic="orbit"/></>}</main>}
    createRoot(document.getElementById('root')).render(<TutorProvider><Page/></TutorProvider>);
    window.navigate=route=>flushSync(()=>navigate(route));`);
  const {compile}=require('@tailwindcss/node');const {Scanner}=require('@tailwindcss/oxide');
  const compiled=await compile(readFileSync(join(root,'src/app/globals.css'),'utf8'),{base:join(root,'src/app'),onDependency:()=>{}});
  const scanner=new Scanner({sources:[{base:join(root,'src'),pattern:'**/*.{ts,tsx}',negated:false}]});
  const tailwind=compiled.build(scanner.scan());
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
  await call('Page.bringToFront');
  await call('Emulation.setFocusEmulationEnabled', { enabled: true });
  const htmlFile=join(directory,'index.html');
  writeFileSync(htmlFile,`<!doctype html><html><head><meta charset="utf-8"><style>${tailwind}</style><style>body{padding:16px;margin:0}main{max-width:1200px;margin:auto}</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);
  await call('Page.navigate',{url:'file://'+htmlFile});
  const evaluate = async (expression) => {
    const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }).catch(error => { throw new Error(expression.slice(0, 400) + ': ' + error.message); });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  const waitFor = async (expression) => {
    for (let i = 0; i < 400; i++) {
      if (await evaluate(expression)) return;
      await new Promise((resolveWait) => setTimeout(resolveWait, 20));
    }
    throw new Error(`Not ready: ${expression}`);
  };
  const click=async selector=>{
    assert.ok(await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&e.getBoundingClientRect().width>0&&!e.closest('[inert]')})()`),`Visible, interactive control: ${selector}`);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  };
  const key=async name=>{
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:name==='Escape'?27:name==='Tab'?9:0});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:name==='Escape'?27:name==='Tab'?9:0});
  };
  const input=async(selector,text)=>{
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus();document.querySelector(${JSON.stringify(selector)}).select()`);
    await call('Input.insertText',{text});
  };
  const stage=async id=>{
    await evaluate(`location.hash='#${id}';window.dispatchEvent(new Event('hashchange'))`);
    await waitFor(`document.querySelector('[data-active-stage]').dataset.activeStage==='${id}'`);
  };
  const resize=async width=>{
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  };
  const settled=()=>waitFor("document.querySelector('#global-tutor-dialog [role=log]')?.getAttribute('aria-busy')==='false'");
  const count=()=>evaluate("document.querySelectorAll('#global-tutor-dialog [data-role]').length");
  const open=async()=>{await click('#global-tutor-trigger');await waitFor("document.querySelector('#global-tutor-dialog').open")};
  const close=async()=>{await key('Escape');await waitFor("!document.querySelector('#global-tutor-dialog').open")};
  const ask=async text=>{await input('#global-tutor-question',text);await click('#global-tutor-dialog button[type=submit]');await settled()};
  const navigate=async path=>{await evaluate(`window.navigate('${path}')`);await waitFor(`document.querySelector('main').dataset.route==='${path}'`)};
  await resize(1280);
  await waitFor("!!document.querySelector('#global-tutor-trigger')");
  assert.equal(await evaluate('window.requests.length'),0);
  // The production drawer currently has no visible launcher; exercise its public
  // trigger in this fixture without adding controls to the application.
  for (const locale of ['es','en','fr']) {
    await navigate('/'+locale+'/gravity');
    await click('[data-formula-trigger]');
    await waitFor("document.querySelector('#gravity-formula-dialog').open");
    await checkGravityRangeWarning({ call, evaluate, input, locale,
      root:'#gravity-formula-dialog', presentation:'drawer',
      physicalValues:()=>evaluate('[window.parameters.mass1,window.parameters.mass2,window.parameters.distance]'),
    });
    await key('Escape');
    await waitFor("!document.querySelector('#gravity-formula-dialog').open");
  }
  await navigate('/es/gravity');
  await stage('gravity-understanding');
  assert.equal(await evaluate('document.querySelectorAll("[data-inline-tutor],[data-content-tab=tutor]").length'),0);
  // Each help icon sends exactly once, even with two synchronous clicks.
  await evaluate(`document.querySelector('#gravity-understanding [data-explain-topic=formula]').click();document.querySelector('#gravity-understanding [data-explain-topic=formula]').click()`);
  await waitFor("document.querySelector('#global-tutor-dialog').open");await settled();
  assert.equal(await evaluate('window.requests.length'),1);
  assert.equal(await evaluate('window.requests[0].body.context.stage'),'gravity-understanding');
  assert.equal(await evaluate('window.requests[0].body.intent'),'explain_context');
  const oldestQuestion=await evaluate('window.requests[0].body.messages.at(-1).content');
  await click('#global-tutor-dialog [data-tutor-action=constant]');await settled();
  assert.equal(await evaluate("document.querySelector('#gravity-understanding [data-formula-variable=constant]').dataset.active"),'true');
  const before=await count();await close();await open();assert.equal(await count(),before);
  await close();await stage('gravity-laboratory');await open();
  await ask('Pon la primera masa en 80 kg');
  assert.equal(await evaluate('window.parameters.mass1'),40);
  await click('[data-proposal-apply]');await waitFor('window.parameters.mass1===80');
  assert.equal(await evaluate("document.querySelector('#gravity-laboratory input[type=range]').value"),'80');
  assert.equal(await evaluate("document.querySelector('[data-tutor-proposal=applied]')!==null"),true);
  // New questions take a fresh route context; history remains intact.
  const storedCount=await count();
  await navigate('/es/three-body');
  assert.equal(await count(),storedCount);
  await ask('Describe esta galería');
  assert.equal(await evaluate('window.requests.at(-1).body.context.stage'),'gallery');
  for(const slug of ['lagrange','figura-de-ocho','butterfly-i','goggles','moth-i','yin-yang-i']){
    await navigate('/es/three-body/'+slug);
    await ask('Explica la órbita '+slug);
    assert.equal(await evaluate('window.requests.at(-1).body.context.slug'),slug);
  }
  await navigate('/es/three-body');await close();
  await evaluate("window.selectThreeStage('experiment')");
  await waitFor("!!document.querySelector('[data-explain-topic=simulation]')");
  await click('[data-explain-topic=simulation]');await settled();
  assert.equal(await evaluate('window.requests.at(-1).body.context.configuration.bodies.length'),3);
  await close();
  await evaluate("(()=>{const buttons=[...document.querySelectorAll('button')];const button=buttons.find(b=>b.textContent.includes('Ejecutar simulación'));if(!button)throw Error(JSON.stringify(buttons.map(b=>b.textContent)));button.click()})()");
  await waitFor("!!document.querySelector('[data-explain-topic=periodicity]')");
  await click('[data-explain-topic=periodicity]');await settled();
  assert.equal(await evaluate('window.requests.at(-1).body.context.status'),'complete');
  assert.equal(await evaluate('window.requests.at(-1).body.context.result.detected'),true);
  await navigate('/es');await ask('¿Qué puedo aprender aquí?');
  assert.equal(await evaluate('window.requests.at(-1).body.context.kind'),'home');
  // Exceed the cap deliberately, then compare the actual surviving transcript.
  for(let index=0;index<4;index++)await ask('Persistencia '+index);
  assert.equal(await count(),30);
  const transcript=()=>evaluate(`[...document.querySelectorAll('#global-tutor-dialog [data-role]')].map(element=>({role:element.dataset.role,content:element.querySelector('p').textContent}))`);
  const beforeReload=await transcript();
  assert.ok(beforeReload.every(message=>message.content!==oldestQuestion));
  const persisted=await evaluate("JSON.parse(localStorage.getItem('gravity-lab:tutor:v1'))");
  assert.equal(persisted.messages.length,30);
  assert.deepEqual(persisted.messages.map(({role,content})=>({role,content})),beforeReload);
  assert.ok(persisted.messages.every(m=>!('proposal'in m)&&!('source'in m)&&!('request'in m)));
  // Reload the same origin: restore text, never requests or pending authorizations.
  await call('Page.reload');await waitFor("!!document.querySelector('#global-tutor-trigger')&&window.requests?.length===0");
  await open();await waitFor(`document.querySelectorAll('#global-tutor-dialog [data-role]').length===${persisted.messages.length}`);
  assert.deepEqual(await transcript(),beforeReload);
  assert.equal(await evaluate('document.querySelectorAll("[data-proposal-apply]").length'),0);
  assert.equal(await evaluate('window.requests.length'),0);
  await evaluate('window.failNext=true');await ask('Prueba de error');
  await waitFor("!!document.querySelector('#global-tutor-dialog [role=alert]')");
  await click('#global-tutor-dialog [role=alert] + button');await settled();
  assert.equal(await evaluate("!!document.querySelector('#global-tutor-dialog [role=alert]')"),false);
  const proposalsBeforePractice=await evaluate('document.querySelectorAll("[data-proposal-apply]").length');
  assert.equal(proposalsBeforePractice,1);
  const parametersBeforePractice=await evaluate('window.parameters');
  await close();await stage('gravity-challenges');await open();
  await click('#global-tutor-dialog [data-tutor-action=current]');await settled();
  assert.equal(await evaluate('window.requests.at(-1).body.context.stage'),'gravity-challenges');
  assert.equal(await evaluate('document.querySelectorAll("[data-proposal-apply]").length'),proposalsBeforePractice);
  // Historical proposals remain visible, but cannot apply after changing context.
  await click('[data-proposal-apply]');
  await waitFor("!!document.querySelector('[data-tutor-proposal=stale]')");
  assert.deepEqual(await evaluate('window.parameters'),parametersBeforePractice);
  await close();await click('#gravity-challenges [data-practice] button');
  await waitFor("window.requests.at(-1).url==='/api/practice'");
  await open();
  for(const width of [1280,390,320]){
    await resize(width);
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
    assert.ok(await evaluate("document.querySelector('#global-tutor-dialog').getBoundingClientRect().width<=innerWidth"));
    await evaluate("document.querySelector('#global-tutor-dialog button').focus()");await key('Tab');
    assert.ok(await evaluate("document.querySelector('#global-tutor-dialog').contains(document.activeElement)"));
  }
  for(const locale of ['en','fr']){
    await navigate('/'+locale);await ask('Hello '+locale);
    assert.equal(await evaluate('window.requests.at(-1).body.locale'),locale);
  }
  // Clearing aborts a pending response; it cannot recreate deleted history.
  await evaluate('window.hold=true');
  await input('#global-tutor-question','Slow question');await click('#global-tutor-dialog button[type=submit]');
  await waitFor("document.querySelector('#global-tutor-dialog [role=log]').getAttribute('aria-busy')==='true'");
  await click('#global-tutor-dialog header button');
  await waitFor('window.aborts===1');
  assert.equal(await count(),0);
  assert.equal(await evaluate("localStorage.getItem('gravity-lab:tutor:v1')"),null);
  await close();
  assert.equal(await evaluate('document.activeElement.id'),'global-tutor-trigger');
  await call('Page.reload');
  await waitFor("!!document.querySelector('#global-tutor-trigger')&&window.requests?.length===0");
  await open();
  assert.equal(await count(),0);
  assert.equal(await evaluate("localStorage.getItem('gravity-lab:tutor:v1')"),null);
  assert.equal(await evaluate('window.requests.length'),0);
  assert.deepEqual(errors, []);
  console.log('Passed: one global chat, contextual single-send help, formula highlighting, confirmed/stale proposals, shared route history, last 30 messages persisted and restored, no stored authorizations, API retry, clear/abort and empty reload, independent practice endpoint, real experiment periodicity, six orbits, all locales, mobile and keyboard.');
  const exited=once(chrome,'exit');await send('Browser.close');await exited;
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill(); await once(chrome, 'exit');
  }
  rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
