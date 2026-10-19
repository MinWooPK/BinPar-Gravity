// node tests/browser/inline-tutor.mjs
// Real stage 02/03/04 components, shared conversation and CSS.
// Router/intl fixtures and mock API responses avoid external credentials.
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
const directory = mkdtempSync(join(tmpdir(), 'inline-tutor-'));
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
    import {TutorProvider} from '@/features/ai/presentation/providers/TutorProvider';
    import {GravityParametersProvider,useGravityParameters} from '@/features/gravity/presentation/providers/GravityParametersProvider';
    import {GravityIntroduction} from '@/features/gravity/presentation/components/GravityIntroduction';
    import {GravityLab} from '@/features/gravity/presentation/components/challenges/GravityLab';
    import {GravityJourney,GravityJourneyPanel} from '@/features/gravity/presentation/components/GravityJourneyTabs';
    import {GravityFormulaAccess} from '@/features/gravity/presentation/components/understanding/GravityFormulaAccess';
    import {gravityStageById} from '@/features/gravity/application/gravityJourney';
    import {useRoute,navigate} from './router';
    window.requests=[];window.failNext=false;window.hold=false;window.aborts=0;
    window.fetch=(url,options)=>{const body=JSON.parse(options.body);window.requests.push({url,body});
      if(url==='/api/practice')return Promise.resolve(Response.json({error:'not_configured'},{status:503}));
      if(window.failNext){window.failNext=false;return Promise.resolve(Response.json({error:'unavailable'},{status:503}));}
      const data={text:'Response '+window.requests.length+' '+body.context.stage+' '+body.messages.at(-1).content,
        proposal:window.nextProposal??{action:'set_gravity_parameters',parameters:{mass1:80,mass2:null,distance:null}}};
      if(window.hold)return new Promise((resolve,reject)=>{window.release=()=>resolve(Response.json(data));options.signal.addEventListener('abort',()=>{window.aborts++;reject(new DOMException('Aborted','AbortError'))},{once:true})});
      return Promise.resolve(Response.json(data));};
    function Parameters(){const {parameters}=useGravityParameters();window.parameters=parameters;return null;}
    function Page(){const route=useRoute();return <main data-route={route}>{route.endsWith('/gravity')&&<GravityParametersProvider><Parameters/><GravityFormulaAccess>
      <GravityJourney introduction={<p>Gravity</p>}>
        <GravityJourneyPanel stage={gravityStageById['gravity-discovery']}><p>Discovery</p></GravityJourneyPanel>
        <GravityJourneyPanel stage={gravityStageById['gravity-understanding']}><GravityIntroduction/></GravityJourneyPanel>
        <GravityLab/>
      </GravityJourney>
    </GravityFormulaAccess></GravityParametersProvider>}</main>}
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
  await call('Page.setDocumentContent', { frameId: (await call('Page.getFrameTree')).frameTree.frame.id,
    html: `<!doctype html><html><head><style>${tailwind}</style><style>body{padding:16px;margin:0}main{max-width:1200px;margin:auto}</style></head><body><div id="root"></div></body></html>` });
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
  const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
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
  const inline='[data-inline-tutor="gravity-understanding"]';
  const log=inline+' [role=log]';
  const settled=()=>waitFor(`document.querySelector('${log}').getAttribute('aria-busy')==='false'`);
  await resize(1280);
  await waitFor('!!document.querySelector("#gravity-understanding")');
  await stage('gravity-understanding');
  await waitFor(`!!document.querySelector('${inline}')&&!document.querySelector('#global-tutor-trigger')`);
  assert.equal(await evaluate("document.querySelector('#global-tutor-dialog')"),null);
  await click(inline+' [data-tutor-action="formula"]');await settled();
  assert.equal(await evaluate('window.requests.at(-1).url'),'/api/ai');
  assert.equal(await evaluate('window.requests.at(-1).body.intent'),'explain_formula');
  assert.ok(await evaluate(`document.querySelector('${log}').textContent.includes('Response')`));
  for(const [action,terms] of [['constant',['constant']],['masses',['mass1','mass2']],['distance',['distance']]]){
    await click(inline+' [data-tutor-action="'+action+'"]');await settled();
    for(const term of terms)assert.equal(await evaluate(`document.querySelector('#gravity-understanding [data-formula-variable="${term}"]').dataset.active`),'true');
  }
  assert.equal(await evaluate(`document.querySelectorAll('${inline} [data-tutor-proposal]').length`),0);
  assert.deepEqual(await evaluate('window.parameters'),{mass1:40,mass2:40,distance:8});
  const previousForce=await evaluate("document.querySelector('#gravity-understanding input[name=force]').value");
  await input('#gravity-understanding input[name=mass1]','60');
  await waitFor('window.parameters.mass1===60');
  assert.notEqual(await evaluate("document.querySelector('#gravity-understanding input[name=force]').value"),previousForce);
  await input(inline+' textarea','Explain these current values');
  await click(inline+' button[type=submit]');await settled();
  assert.equal(await evaluate('window.requests.at(-1).body.context.parameters.mass1'),60);
  for(const mode of ['simplify','example']){
    await click(inline+' [data-tutor-action="'+mode+'"]');await settled();
    assert.equal(await evaluate('window.requests.at(-1).body.mode'),mode);
  }
  await evaluate('window.failNext=true');await click(inline+' [data-tutor-action="constant"]');await settled();
  await waitFor(`!!document.querySelector('${inline} [role=alert]')`);
  // Retry is the only button adjacent to the alert.
  await click(inline+' [role=alert] + button');await settled();
  assert.equal(await evaluate(`document.querySelector('${inline} [role=alert]')`),null);
  const count=await evaluate(`document.querySelectorAll('${log} [data-role]').length`);
  const right='#gravity-understanding [data-side=right]';
  const width=await evaluate(`document.querySelector('${right}').getBoundingClientRect().width`);
  await click('#gravity-understanding [data-panel-toggle=left]');
  await evaluate('new Promise(resolve=>setTimeout(resolve,300))');
  assert.ok(await evaluate(`document.querySelector('${right}').getBoundingClientRect().width>${width}`));
  await click('#gravity-understanding [data-panel-toggle=left]');
  await click('#gravity-understanding button[aria-label^="Restablecer laboratorio"]');
  await waitFor('window.parameters.mass1===40');
  assert.equal(await evaluate(`document.querySelectorAll('${log} [data-role]').length`),count);
  assert.equal(await evaluate(`document.querySelector('${log}').getBoundingClientRect().height<=384`),true);
  // Formula stage responses arriving after navigation stay in their own session.
  await evaluate('window.hold=true');await click(inline+' [data-tutor-action="distance"]');
  await waitFor(`document.querySelector('${log}').getAttribute('aria-busy')==='true'`);
  await stage('gravity-laboratory');
  const lab='[data-inline-tutor="gravity-laboratory"]';
  const labLog=lab+' [role=log]';
  const labSettled=()=>waitFor(`document.querySelector('${labLog}').getAttribute('aria-busy')==='false'`);
  const key=async name=>{
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name});
  };
  const sliders='#gravity-laboratory input[type=range]';
  const pendingProposal=lab+' [data-tutor-proposal=pending]';
  const askLab=async(text,parameters)=>{
    await evaluate(`window.nextProposal={action:'set_gravity_parameters',parameters:${JSON.stringify({mass1:null,mass2:null,distance:null,...parameters})}}`);
    await input(lab+' textarea',text);await click(lab+' button[type=submit]');await labSettled();
  };
  await waitFor(`!!document.querySelector('${lab}')&&!document.querySelector('#global-tutor-trigger')`);
  assert.equal(await evaluate("document.querySelector('#global-tutor-dialog')"),null);
  assert.equal(await evaluate(`document.querySelectorAll('${labLog} [data-role]').length`),0);
  await evaluate('window.hold=false;window.release()');
  await click('#gravity-laboratory [data-experiment-explain]');await labSettled();
  assert.equal(await evaluate('window.requests.at(-1).body.intent'),'explain_experiment');
  assert.equal(await evaluate('window.requests.at(-1).body.context.stage'),'gravity-laboratory');
  assert.equal(await evaluate('window.requests.at(-1).body.messages.length'),1);
  assert.deepEqual(await evaluate('window.requests.at(-1).body.context.parameters'),{mass1:40,mass2:40,distance:8});
  assert.equal(await evaluate(`document.querySelectorAll('${pendingProposal}').length`),0);
  const aiCount=await evaluate('window.requests.length');
  await evaluate(`document.querySelector('${sliders}').focus()`);await key('ArrowRight');
  await waitFor('window.parameters.mass1===41');
  assert.equal(await evaluate('window.requests.length'),aiCount);
  await waitFor(`document.querySelector('${lab} [data-tutor-context-changed]')?.textContent.includes('Los parámetros han cambiado')`);
  await click(lab+' [data-tutor-action="explain-experiment"]');await labSettled();
  assert.equal(await evaluate('window.requests.at(-1).body.context.parameters.mass1'),41);
  assert.equal(await evaluate(`document.querySelector('${lab} [data-tutor-context-changed]')`),null);
  for(const action of ['increase-mass','increase-distance']){
    await click(lab+' [data-tutor-action="'+action+'"]');await labSettled();
    assert.equal(await evaluate(`document.querySelectorAll('${pendingProposal}').length`),0);
  }
  // Both the legacy button and quick action configure the inline composer without an AI call.
  const beforeConfigure=await evaluate('window.requests.length');
  await click('#gravity-laboratory [data-experiment-configure]');
  assert.equal(await evaluate(`document.activeElement.matches('${lab} textarea')`),true);
  await waitFor(`!!document.querySelector('${lab} textarea').getAttribute('aria-describedby')`);
  await click(lab+' [data-tutor-action="configure-experiment"]');
  assert.equal(await evaluate('window.requests.length'),beforeConfigure);
  const sphere='#gravity-laboratory [data-understanding-simulation] [data-simulation-variable=mass1]';
  const radiusBefore=await evaluate(`document.querySelector('${sphere}').getAttribute('r')`);
  const forceBefore=await evaluate("document.querySelector('#gravity-laboratory [data-simulation-variable=force] output').getAttribute('aria-label')");
  await askLab('Pon la primera masa en 80 kg',{mass1:80});
  assert.equal(await evaluate(`document.querySelectorAll('${pendingProposal}').length`),1);
  assert.equal(await evaluate('window.parameters.mass1'),41);
  await click(pendingProposal+' [data-proposal-apply]');
  await waitFor('window.parameters.mass1===80');
  assert.equal(await evaluate(`document.querySelector('${sliders}').value`),'80');
  assert.ok(await evaluate(`Number(document.querySelector('${sphere}').getAttribute('r'))>${radiusBefore}`));
  assert.notEqual(await evaluate("document.querySelector('#gravity-laboratory [data-simulation-variable=force] output').getAttribute('aria-label')"),forceBefore);
  assert.equal(await evaluate(`document.querySelectorAll('${lab} [data-tutor-proposal=applied]').length`),1);
  // Cancel, revision checks and response validation preserve laboratory values.
  await askLab('Pon la segunda masa en 80 kg',{mass2:80});
  await click(pendingProposal+' [data-proposal-cancel]');
  assert.equal(await evaluate('window.parameters.mass2'),40);
  await askLab('Reduce la distancia a 6 metros',{distance:6});
  await evaluate(`document.querySelectorAll('${sliders}')[2].focus()`);await key('ArrowRight');
  await waitFor('window.parameters.distance===8.1');
  await click(pendingProposal+' [data-proposal-apply]');
  assert.equal(await evaluate('window.parameters.distance'),8.1);
  assert.equal(await evaluate(`document.querySelectorAll('${lab} [data-tutor-proposal=stale]').length`),1);
  await askLab('Pon la primera masa en 101 kg',{mass1:101});
  assert.equal(await evaluate(`document.querySelectorAll('${pendingProposal}').length`),0);
  assert.equal(await evaluate('window.parameters.mass1'),80);
  assert.ok(await evaluate(`document.querySelector('${labLog}').textContent.includes('El laboratorio admite masas')`));
  await askLab('Pon la segunda masa en 80 kg',{mass2:80});
  await click(pendingProposal+' [data-proposal-apply]');
  await waitFor('window.parameters.mass2===80');
  await click('#gravity-laboratory [data-experiment-view="formula"]');
  assert.equal(await evaluate("document.querySelector('#gravity-laboratory input[name=mass1]').value"),'80');
  assert.equal(await evaluate("document.querySelector('#gravity-laboratory input[name=mass2]').value"),'80');
  assert.ok(await evaluate(`document.querySelector('${lab}').getBoundingClientRect().width>0`));
  await click('#gravity-laboratory [data-experiment-view="experiment"]');
  const labCount=await evaluate(`document.querySelectorAll('${labLog} [data-role]').length`);
  await stage('gravity-understanding');await settled();
  assert.equal(await evaluate("document.querySelector('#global-tutor-dialog')"),null);
  assert.equal(await evaluate(`document.querySelectorAll('${log} [data-role]').length`),count+2);
  await stage('gravity-laboratory');
  assert.equal(await evaluate(`document.querySelectorAll('${labLog} [data-role]').length`),labCount);
  assert.deepEqual(await evaluate('window.parameters'),{mass1:80,mass2:80,distance:8.1});
  // The global tutor still works in Discovery, using its own session.
  await stage('gravity-discovery');
  await waitFor("!!document.querySelector('#global-tutor-trigger')");
  await click('#global-tutor-trigger');
  await waitFor("document.querySelector('#global-tutor-dialog').open");
  assert.equal(await evaluate("document.querySelectorAll('#global-tutor-dialog [data-role]').length"),0);
  await stage('gravity-challenges');
  assert.equal(await evaluate("document.querySelector('#global-tutor-trigger')"),null);
  await click('#gravity-challenges [data-practice] button');
  await waitFor("window.requests.at(-1).url==='/api/practice'");
  assert.equal(await evaluate('window.requests.at(-1).body.action'),'start');
  await waitFor("document.querySelector('#gravity-challenges [role=alert]')!==null");
  await stage('gravity-understanding');
  for(const width of [390,320]){
    await resize(width);await click('#gravity-understanding [data-panel-select=right]');
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
    assert.equal(await evaluate(`document.querySelector('${inline}').getBoundingClientRect().width>0`),true);
    const before=await evaluate(`document.querySelectorAll('${log} [data-role]').length`);
    await click('#gravity-understanding [data-panel-select=left]');
    await click('#gravity-understanding [data-panel-select=right]');
    assert.equal(await evaluate(`document.querySelectorAll('${log} [data-role]').length`),before);
  }
  await stage('gravity-laboratory');
  for(const width of [1280,390,320]){
    await resize(width);
    if(width<1024)await click('#gravity-laboratory [data-panel-select=right]');
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
    assert.ok(await evaluate(`document.querySelector('${labLog}').getBoundingClientRect().height<=384`));
    if(width>=1024){
      const before=await evaluate(`document.querySelector('${lab}').getBoundingClientRect().width`);
      await click('#gravity-laboratory [data-panel-toggle=left]');
      await evaluate('new Promise(resolve=>setTimeout(resolve,300))');
      assert.ok(await evaluate(`document.querySelector('${lab}').getBoundingClientRect().width>${before}`));
      await click('#gravity-laboratory [data-panel-toggle=left]');
    }else{
      await click('#gravity-laboratory [data-panel-select=left]');
      await click('#gravity-laboratory [data-panel-select=right]');
    }
    assert.equal(await evaluate(`document.querySelectorAll('${labLog} [data-role]').length`),labCount);
  }
  // Locales change copy without altering session isolation or request validation.
  for(const locale of ['en','fr']){
    await evaluate(`window.navigate('/${locale}/gravity')`);
    await click(lab+' [data-tutor-action="explain-experiment"]');await labSettled();
    assert.equal(await evaluate('window.requests.at(-1).body.locale'),locale);
    assert.equal(await evaluate('window.requests.at(-1).body.context.parameters.mass1'),80);
    assert.ok(await evaluate(`document.querySelector('${lab} h3').textContent.includes('${locale==='en'?'Experiment':'Expérimente'}')`));
  }
  await stage('gravity-understanding');
  // Locales change only copy, not the deterministic concept-to-symbol mapping.
  for(const locale of ['en','fr']){
    await evaluate(`window.navigate('/${locale}/gravity')`);
    await click(inline+' [data-tutor-action="constant"]');await settled();
    assert.equal(await evaluate('window.requests.at(-1).body.locale'),locale);
  }
  await evaluate('window.hold=true');await click(inline+' [data-tutor-action="constant"]');
  await waitFor(`document.querySelector('${log}').getAttribute('aria-busy')==='true'`);
  await evaluate("window.navigate('/fr/three-body')");
  await waitFor('window.aborts===1');
  assert.equal(await evaluate('document.querySelectorAll("[data-inline-tutor],#global-tutor-trigger,#global-tutor-dialog").length'),0);

  assert.deepEqual(errors, []);
  console.log('Passed: inline API conversation, retries, real formula/reset, deterministic highlights, read-only stage 02, preserved history/panels, separated late responses, stage 03 inline proposals/apply/cancel/stale/limits, live slider context, no automatic requests, stage 01 modal, stage 04 endpoint, ES/EN/FR and mobile layout.');
  const exited=once(chrome,'exit');await send('Browser.close');await exited;
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill(); await once(chrome, 'exit');
  }
  rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
