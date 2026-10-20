// node tests/browser/gravity-practice-ui.mjs
// Real practice presentation, session hook, navigation and CSS; deterministic API fixtures.
// Router/intl fixtures and mock API responses avoid external credentials.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = resolve('.');
const directory = mkdtempSync(join(tmpdir(), 'practice-ui-'));
let chrome;
const pending = new Map();
try {
  const routeFile = join(directory, 'router.js');
  writeFileSync(routeFile, `import {createElement,useSyncExternalStore} from 'react';
    let route='/es/gravity';const listeners=new Set();
    export const useRoute=()=>useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>route);
    export const usePathname=()=>useRoute().split('#')[0].replace(/^\\/(es|en|fr)(?=\\/|$)/,'');
    export const navigate=value=>{route=value;listeners.forEach(fn=>fn())};export const Link=({children,...props})=>createElement('a',props,children);export const useRouter=()=>({replace:(path,{locale})=>navigate('/'+locale+path)});`);
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

  const entry = join(directory,'entry.tsx');
  writeFileSync(entry, `import React from 'react';import {createRoot} from 'react-dom/client';
    import {TutorProvider} from '@/features/ai/presentation/providers/TutorProvider';
    import {GravityScreen} from '@/features/gravity/presentation/components/GravityScreen';
    import {Header} from '@/components/layout/Header';
    import {Footer} from '@/components/layout/Footer';
    import {expectedAnswer,evaluateAnswer} from '@/features/gravity/domain/practice/evaluation';
    import {navigate} from './router';
    window.navigate=navigate;window.expectedAnswer=expectedAnswer;window.requests=[];window.emptyReport=false;window.hold=false;
    let history=[],question;const concepts=['attraction','mass','km','power','force'];
    window.fetch=async(url,options)=>{
      if(url!=='/api/practice')throw Error('Unexpected API');
      const request=JSON.parse(options.body);window.requests.push(request);
      if(window.hold)await new Promise(resolve=>{window.release=()=>{window.hold=false;resolve()}});
      if(window.failNext){window.failNext=false;return Response.json({error:'unavailable'},{status:503})}
      if(request.action==='start')history=[];
      if(request.action!=='answer')question={id:'q'+history.length,number:history.length+1,concept:concepts[history.length],difficulty:history.length===4?3:1,a:history.length===2?0.01:40,b:40,r:8,exponent:-9,scene:'laboratory',hint:'units',reinforcement:history.length===1};
      let feedback;
      if(request.action==='answer'){
        const attempt=evaluateAnswer(question,request.answer,request.usedHint);history.push(attempt);
        feedback={...attempt,explanation:'Explanation from the API.\\nThe original text is preserved.',steps:['Step one: review the relationship.','Step two: check the units.']};
        if(window.longFeedback)feedback.explanation+='\\n'+('A longer explanation preserves the original reasoning and units. '.repeat(80));
      }
      const report=history.length===5?{summary:'Learning summary from the API.\\nBased only on these five answers.',strengths:window.emptyReport?[]:['Strength from the API.'],review:window.emptyReport?[]:['Review from the API.'],recommendations:[{stage:'gravity-discovery',text:'Discovery recommendation.'},{stage:'gravity-understanding',text:'Understanding recommendation.'},{stage:'gravity-laboratory',text:'Laboratory recommendation.'}]}:undefined;
      const view={token:'fixture-'+history.length,question,count:history.length,score:history.filter(a=>a.correct).length,hints:history.filter(a=>a.usedHint).length,history:history.map(({question,correct,usedHint})=>({concept:question.concept,correct,usedHint})),feedback,report};
      window.view=view;return Response.json(view);
    };
    function App(){return <TutorProvider><Header/><main className="min-w-0 flex-1"><GravityScreen/></main><Footer/></TutorProvider>}
    createRoot(document.getElementById('root')).render(<App/>);`);
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
  writeFileSync(htmlFile,`<!doctype html><html><head><meta charset="utf-8"><style>${tailwind}</style><style>html{height:100%}body{margin:0}#root{display:flex;flex-direction:column;min-height:100dvh;height:100%}</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);
  await call('Page.navigate',{url:'file://'+htmlFile+'#gravity-challenges'});
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
  const input=async(selector,text)=>{
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus();document.querySelector(${JSON.stringify(selector)}).select()`);
    await call('Input.insertText',{text});
  };
  const stage=async id=>{
    await evaluate(`location.hash='#${id}';window.dispatchEvent(new Event('hashchange'))`);
    await waitFor(`document.querySelector('[data-active-stage]').dataset.activeStage==='${id}'`);
  };
  const resize=async(width,height=1000)=>{
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  };

  const dictionaries=Object.fromEntries(['es','en','fr'].map(locale=>[locale,JSON.parse(readFileSync(join(root,'messages',locale+'.json'),'utf8')).Practice]));
  const settle=()=>waitFor("document.querySelector('[data-practice]').getAttribute('aria-busy')==='false'");
  const button=async text=>{
    const selector=await evaluate(`(()=>{const b=[...document.querySelectorAll('[data-practice] button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!b)throw Error('Missing '+${JSON.stringify(text)});b.setAttribute('data-click-target','');return '[data-click-target]'})()`);
    await click(selector);await evaluate("document.querySelector('[data-click-target]')?.removeAttribute('data-click-target')");
    await settle();
  };
  const summary=async text=>{
    await evaluate(`(()=>{const s=[...document.querySelectorAll('[data-practice] summary')].find(s=>s.textContent.trim()===${JSON.stringify(text)});s.focus()})()`);
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await evaluate('new Promise(resolve=>requestAnimationFrame(resolve))');
  };
  const checkViewport=async(label,width,height=1000)=>{
    await resize(width,height);await evaluate('new Promise(resolve=>setTimeout(resolve,260))');
    assert.ok(await evaluate("document.documentElement.scrollWidth<=innerWidth"),'No document overflow '+label+' '+width);
    assert.ok(await evaluate("(()=>{const p=document.querySelector('[data-practice]');return p.scrollWidth<=p.clientWidth+1})()"),'No card overflow');
    if(label!=='report')assert.ok(await evaluate("(()=>{const row=document.querySelector('[data-practice-help]').parentElement;return [...row.querySelectorAll('span')].every(s=>s.getClientRects().length===1)})()"),'Badges keep their background and border together');
    if(width<640 && label==='question')assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-practice] fieldset')).gridTemplateColumns.split(' ').length"),1);
    const action=label==='report'?'[data-practice-restart]':'[data-practice-check]';
    await evaluate(`document.querySelector('${action}').scrollIntoView({block:'end',behavior:'instant'})`);
    const unobscured=await evaluate(`(()=>{const a=document.querySelector('${action}'),t=document.querySelector('#global-tutor-trigger');const r=a.getBoundingClientRect(),b=t.getBoundingClientRect();return r.height>=44&&(r.bottom<=b.top||r.top>=b.bottom||r.right<=b.left||r.left>=b.right)})()`);
    assert.ok(unobscured,'Action clear of tutor '+width);
    assert.ok(await evaluate(`(()=>{const r=document.querySelector('${action}').getBoundingClientRect(),f=document.querySelector('footer').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.bottom<=f.top})()`),'Action visible and clear of footer '+width);
    if(label==='report')await evaluate("document.querySelector('[data-practice-report]').scrollIntoView({block:'start',behavior:'instant'})");
    else await evaluate("document.querySelector('[data-practice-question]').scrollIntoView({block:'start',behavior:'instant'})");
    const {data}=await call('Page.captureScreenshot',{format:'png'});writeFileSync(join(tmpdir(),`practice-ui-${label}-${width}.png`),Buffer.from(data,'base64'));
  };
  const answer=async(correct=true)=>{
    const question=await evaluate('window.view.question');
    const value=await evaluate('window.expectedAnswer(window.view.question)');
    if(typeof value==='string')await click(`[data-practice] input[value="${correct?value:question.concept==='attraction'?'repel':'half'}"]`);
    else{
      const scientific=['force','power'].includes(question.concept);
      const exponent=scientific?Math.floor(Math.log10(Math.abs(value))):0;
      await input('[data-practice] input:not([type=number])',String(correct?value/10**exponent:value/10**exponent+100));
      if(scientific){assert.ok(await evaluate("document.querySelector('[data-practice-check]').disabled"));await input('[data-practice] input[type=number]',String(exponent));}
    }
  };
  await waitFor("!!document.querySelector('[data-practice]')&&document.querySelector('[data-active-stage]')?.dataset.activeStage==='gravity-challenges'");
  for(const locale of ['es','en','fr']){
    const t=dictionaries[locale];await evaluate(`window.navigate('/${locale}/gravity')`);await resize(1280);
    await button(locale==='es'?t.start:t.restart);
    for(let n=1;n<=5;n++){
      assert.equal(await evaluate('window.view.question.number'),n);
      assert.ok(await evaluate("document.querySelector('[data-practice-check]').disabled"));
      assert.equal(await evaluate("document.querySelector('[data-practice] progress').value"),n-1);
      assert.equal(await evaluate("document.activeElement.hasAttribute('data-practice-question')"),true);
      const questionText=await evaluate("document.querySelector('[data-practice-question]').textContent");
      assert.ok(questionText.trim().length>20);
      if(n===1){
        const calls=await evaluate('window.requests.length');await button(t.hint);
        const layout=await evaluate("(()=>{const b=document.querySelector('[data-practice-help] button'),h=document.getElementById(b.getAttribute('aria-controls')),a=document.querySelector('[data-practice] fieldset');return{expanded:b.getAttribute('aria-expanded'),hidden:h.getAttribute('aria-hidden'),before:!!(h.compareDocumentPosition(a)&Node.DOCUMENT_POSITION_FOLLOWING),text:h.textContent}})()");
        assert.equal(layout.expanded,'true');assert.equal(layout.hidden,'false');assert.ok(layout.before);assert.ok(layout.text.trim());
        await button(t.hideHint);assert.equal(await evaluate("document.querySelector('[data-practice-help] button').getAttribute('aria-expanded')"),'false');
        assert.equal(await evaluate('window.requests.length'),calls);
        await button(t.hint);
        if(locale==='es')for(const width of [320,375,768,1024,1440])await checkViewport('question',width);
        if(locale==='es')await checkViewport('question',320,600);
        await button(t.hideHint);await resize(1280);
      }
      if(n===3){
        await stage('gravity-understanding');await stage('gravity-challenges');
        assert.equal(await evaluate('window.view.question.number'),3);
        await input('[data-practice] input:not([type=number])','invalid');assert.ok(await evaluate("document.querySelector('[data-practice-check]').disabled"));
      }
      if(n===4&&locale==='es'){
        for(const width of [320,375,768,1024,1440]){
          await checkViewport('scientific',width);
          if(width<640)assert.ok(await evaluate("(()=>{const [a,b]=document.querySelectorAll('[data-practice] input');return a.getBoundingClientRect().bottom<b.getBoundingClientRect().top})()"));
        }
        await resize(1280);
      }
      if(n===4&&locale!=='es'){
        await checkViewport('scientific',375,667);
        await resize(1280);
      }
      await answer(n!==1);
      await evaluate(`window.longFeedback=${locale==='es'&&n===4}`);
      if(n===2){
        await evaluate('window.hold=true');await click('[data-practice-check]');
        await waitFor("document.querySelector('[data-practice]').getAttribute('aria-busy')==='true'");
        assert.ok(await evaluate("document.querySelector('[data-practice-check]').disabled"));
        assert.equal(await evaluate("document.querySelector('[data-practice-check]').textContent.trim()"),t.checking);
        await evaluate('window.release()');await settle();
      }else await button(t.check);
      assert.equal(await evaluate('window.view.count'),n);
      assert.equal(await evaluate('window.view.feedback.correct'),n!==1);
      if(n<5){
        assert.equal(await evaluate("document.querySelector('[data-practice-feedback]').dataset.correct"),String(n!==1));
        assert.ok(await evaluate("!!document.activeElement.closest('[data-practice-feedback]')"));
        assert.equal(await evaluate("document.querySelector('[data-practice-feedback] p + p').textContent"),await evaluate('window.view.feedback.explanation'));
        assert.equal(await evaluate("document.querySelectorAll('[data-practice-feedback] li').length"),2);
        assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-practice-feedback]')).animationDuration"),'0.22s');
        // Desktop places feedback beside the answer; its heading is already visible.
        const columns=await evaluate("(()=>{const f=document.querySelector('[data-practice-feedback]').getBoundingClientRect(),q=document.querySelector('[data-practice-question]').getBoundingClientRect();return f.x>q.x&&f.top>=0&&f.top<innerHeight})()");
        assert.ok(columns);
        if(locale==='es'&&n===4){
          for(const [width,height] of [[1280,800],[1024,768],[375,667],[320,600]]){
            await resize(width,height);
            await evaluate("document.querySelector('[data-practice-feedback]').scrollIntoView({block:'start',behavior:'instant'})");
            if(width>=1024){
              assert.ok(await evaluate("(()=>{const p=document.querySelector('[data-practice-feedback]').parentElement;p.scrollTop=0;p.focus();return p.clientHeight>0&&p.scrollHeight>p.clientHeight})()"),'Long desktop feedback scrolls independently');
              await call('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End',windowsVirtualKeyCode:35});
              await call('Input.dispatchKeyEvent',{type:'keyUp',key:'End',code:'End',windowsVirtualKeyCode:35});
              await waitFor("(()=>{const p=document.querySelector('[data-practice-feedback]').parentElement;return p.scrollTop+p.clientHeight>=p.scrollHeight-2})()");
            }else{
              await evaluate("document.querySelector('[data-practice-feedback] li:last-child').scrollIntoView({block:'center',behavior:'instant'})");
            }
            assert.ok(await evaluate("(()=>{const f=document.querySelector('[data-practice-feedback]'),r=f.querySelector('li:last-child').getBoundingClientRect(),p=f.parentElement.getBoundingClientRect();return r.top>=Math.max(0,p.top)&&r.bottom<=Math.min(innerHeight,p.bottom)+1&&document.documentElement.scrollWidth<=innerWidth})()"),'End of long feedback remains reachable '+width);
            const {data}=await call('Page.captureScreenshot',{format:'png'});
            writeFileSync(join(tmpdir(),`practice-ui-long-feedback-${width}.png`),Buffer.from(data,'base64'));
          }
          await resize(1280);
        }
        if(locale==='es'&&n===1){await evaluate('new Promise(resolve=>setTimeout(resolve,260))');const {data}=await call('Page.captureScreenshot',{format:'png'});writeFileSync(join(tmpdir(),'practice-ui-feedback.png'),Buffer.from(data,'base64'));}
        await button(t.next);
      }
    }
    assert.equal(await evaluate('window.view.score'),4);assert.equal(await evaluate('window.view.hints'),1);
    assert.equal(await evaluate('window.view.history.length'),5);
    assert.equal(await evaluate("document.querySelector('[data-practice-score]').textContent"),t.scoreValue.replace('{score}','4').replace('{total}','5'));
    assert.ok(await evaluate("document.querySelector('[data-practice-percentage]').textContent.includes('80')"));
    assert.ok(await evaluate("document.querySelector('[data-practice-report] h4')===document.activeElement"));
    assert.equal(await evaluate("document.querySelector('[data-practice-report] section p').textContent"),await evaluate('window.view.report.summary'));
    if(locale==='es')for(const width of [320,375,768,1024,1440])await checkViewport('report',width);
    if(locale==='es')await checkViewport('report',375,667);
    if(locale!=='es')await checkViewport('report',320,600);
    await summary(t.history);
    assert.equal(await evaluate("document.querySelector('[data-practice-report] summary').getAttribute('aria-expanded')"),'true');
    assert.equal(await evaluate("document.querySelectorAll('[data-practice-history] > li').length"),5);
    assert.ok(await evaluate(`document.querySelector('[data-practice-history]').textContent.includes(${JSON.stringify(t.hintUsed)})`));
    await summary(t.history);
    assert.equal(await evaluate("document.querySelector('[data-practice-report] summary').getAttribute('aria-expanded')"),'false');
    await summary(t.lastFeedback);
    assert.equal(await evaluate("document.querySelector('[data-practice-report] [data-practice-feedback] p + p').textContent"),await evaluate('window.view.feedback.explanation'));
    for(const stageId of ['gravity-discovery','gravity-understanding','gravity-laboratory']){
      await click(`[data-practice-report] a[href="#${stageId}"]`);
      await waitFor(`document.querySelector('[data-active-stage]').dataset.activeStage==='${stageId}'`);
      await stage('gravity-challenges');assert.ok(await evaluate("!!document.querySelector('[data-practice-report]')"));
    }
    console.log('PASS '+locale+': five questions, hints, valid/invalid answers, feedback, progress, score 4/5 and 80%, history, recommendations and preserved navigation');
  }
  // Boundary scores and empty report lists must never claim unobserved strengths.
  const t=dictionaries.fr;await resize(1280);await evaluate('window.emptyReport=true');
  for(const allCorrect of [false,true]){
    await button(t.restart);
    assert.equal(await evaluate('window.view.count'),0);assert.equal(await evaluate("!!document.querySelector('[data-practice-report]')"),false);
    for(let n=1;n<=5;n++){await answer(allCorrect);await button(t.check);if(n<5)await button(t.next)}
    assert.equal(await evaluate('window.view.score'),allCorrect?5:0);
    assert.ok(await evaluate(`document.querySelector('[data-practice-percentage]').textContent.includes('${allCorrect?100:0}')`));
    for(const text of [t.noStrengths,t.noReview])assert.ok(await evaluate(`document.querySelector('[data-practice-report]').textContent.includes(${JSON.stringify(text)})`));
  }
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await button(t.restart);await button(t.hint);
  assert.equal(await evaluate("getComputedStyle(document.getElementById(document.querySelector('[data-practice-help] button').getAttribute('aria-controls'))).transitionDuration"),'0s');
  await answer();await evaluate('window.failNext=true');await button(t.check);
  assert.ok(await evaluate("!!document.querySelector('[data-practice] [role=alert]')"));
  assert.equal(await evaluate('window.view.count'),0);await button(t.retry);assert.equal(await evaluate('window.view.count'),1);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-practice-feedback]')).animationName"),'none');
  assert.deepEqual(errors,[]);
  console.log('PASS responsive 320/375/768/1024/1440, short viewports, long feedback and keyboard scroll, badges, footer/tutor clearance, focus, loading, restart, 0%/100%, empty lists, animations/reduced motion and API retry');
  const exited=once(chrome,'exit');await send('Browser.close');await exited;
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout);
  pending.clear();
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill(); await once(chrome, 'exit');
  }
  await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
