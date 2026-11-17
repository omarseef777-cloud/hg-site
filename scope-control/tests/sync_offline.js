// Offline edits + conflict test against a fake shared store.
// node tests/sync_offline.js [dist]
// The fake store lives in localStorage ('__mockdb') so it survives a page reload; '__mockoff' = offline.
const { chromium } = require('playwright');const fs=require('fs'),path=require('path');
const DIR=path.resolve(process.argv[2]||path.join(__dirname,'../dist'));
const hook=h=>h.replace('<script>\n(function(){\nconst D=window.SCOPE;','<script>\n(function(){window.__ev=function(s){return eval(s)};\nconst D=window.SCOPE;');
const MOCK=`(()=>{const L=()=>{try{return JSON.parse(localStorage.getItem('__mockdb')||'{}')}catch(_){return {}}},W=s=>localStorage.setItem('__mockdb',JSON.stringify(s));
 const off=()=>localStorage.getItem('__mockoff')==='1',subs=new Set(),fire=()=>{if(!off())subs.forEach(f=>f())},err={code:'unavailable',message:'offline'};
 const snap=(s,p)=>({id:p.split('/').pop(),exists:p in s,data:()=>s[p]?JSON.parse(JSON.stringify(s[p])):undefined,metadata:{fromCache:false,hasPendingWrites:false}});
 const doc=p=>({id:p.split('/').pop(),path:p,
  get:async()=>{if(off())throw err;return snap(L(),p)},
  set:async d=>{if(off())throw err;const s=L();s[p]=JSON.parse(JSON.stringify(d));W(s);setTimeout(fire,5)},
  update:async d=>{if(off())throw err;const s=L();s[p]=Object.assign({},s[p],d);W(s);setTimeout(fire,5)},
  delete:async()=>{if(off())throw err;const s=L();delete s[p];W(s);setTimeout(fire,5)},
  onSnapshot(cb){const f=()=>{try{cb(snap(L(),p))}catch(e){console.error('snap',p,e)}};subs.add(f);setTimeout(()=>{if(!off())f()},30);return()=>subs.delete(f)}});
 const coll=c=>({where:()=>coll(c),orderBy:()=>coll(c),limit:()=>coll(c),
  onSnapshot(cb){const f=()=>{const s=L(),docs=Object.keys(s).filter(k=>k.startsWith(c+'/')&&k.split('/').length===c.split('/').length+1).map(k=>snap(s,k));try{cb({docs,size:docs.length,empty:!docs.length,metadata:{fromCache:false,hasPendingWrites:false},docChanges:()=>[]})}catch(e){console.error('coll',c,e)}};subs.add(f);setTimeout(()=>{if(!off())f()},30);return()=>subs.delete(f)},
  get:async()=>{if(off())throw err;const s=L(),docs=Object.keys(s).filter(k=>k.startsWith(c+'/')).map(k=>snap(s,k));return {docs,empty:!docs.length,size:docs.length}},doc:id=>doc(c+'/'+id)});
 const user={id:async()=>'u1',canEdit:async()=>true,can:async()=>true,isOwner:()=>true,profiles:async ids=>Object.fromEntries(ids.map(i=>[i,{name:'Test'}]))};
 window.__mockFire=fire;window.__mockWrite=(p,d)=>{const s=L();s[p]=d;W(s);fire()};
 window.claude={use:async n=>n==='db'?{doc,collection:coll}:n==='user'?user:null}})();`;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const errs=[];let ok=true;
 await ctx.route('http://app.test/**',r=>{const p=decodeURIComponent(new URL(r.request().url()).pathname.slice(1))||'index.html';const f=path.join(DIR,p);
   if(p==='index.html')return r.fulfill({body:hook(fs.readFileSync(f,'utf8')),contentType:'text/html'});return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''})});
 await ctx.route(/^https?:\/\/(?!app\.test)/,r=>r.abort());await ctx.addInitScript(MOCK);
 const page=await ctx.newPage();page.on('pageerror',e=>errs.push(e.message));page.on('dialog',d=>d.dismiss());
 const E=s=>page.evaluate(x=>window.__ev(x),s),wait=ms=>page.waitForTimeout(ms);
 const T=(name,cond)=>{console.log((cond?'PASS ':'FAIL ')+name);if(!cond)ok=false};
 await page.goto('http://app.test/index.html',{waitUntil:'load',timeout:300000});await wait(3000);
 const [K1,K2]=await E("items.filter(i=>i.type==='Pit'&&S(i.key)!=='Installed').slice(0,2).map(i=>i.key)");
 const P1=await E(`'st/'+encId(${JSON.stringify(K1)})`),P2=await E(`'st/'+encId(${JSON.stringify(K2)})`);
 // 1) offline edits
 await page.evaluate(()=>localStorage.setItem('__mockoff','1'));
 await E(`setStatus(${JSON.stringify(K1)},'Installed');setStatus(${JSON.stringify(K2)},'Installed');POS['TEST-MINE']=[4700,1500];save('scope.pos',POS)`);await wait(6000);
 T('offline edits kept in the outbox',(await E("OBX.length"))>=3);
 // 2) someone else, online: changes K2 and adds another position
 await page.evaluate(([P2,K2])=>{const s=JSON.parse(localStorage.getItem('__mockdb')||'{}');s[P2]={id:K2,v:{s:'Precast Yard',prev:'Not Cast',date:'2026-11-17'},by:'u2',at:new Date().toISOString()};
   const pos=(s['cfg/pos']&&s['cfg/pos'].v)||{};pos['TEST-OTHER']=[4710,1510];s['cfg/pos']={v:pos,by:'u2',at:new Date().toISOString()};localStorage.setItem('__mockdb',JSON.stringify(s))},[P2,K2]);
 // 3) reload, back online
 await page.evaluate(()=>localStorage.setItem('__mockoff','0'));await page.reload({waitUntil:'load'});await wait(9000);
 const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('__mockdb')||'{}'));
 T('offline status saved after reload',st[P1]&&st[P1].v&&st[P1].v.s==='Installed');
 T('other user change not overwritten',st[P2]&&st[P2].v&&st[P2].v.s==='Precast Yard');
 T('screen shows the other user change',(await E(`S(${JSON.stringify(K2)})`))==='Precast Yard');
 T('positions merged (both kept)',!!(st['cfg/pos']&&st['cfg/pos'].v['TEST-MINE']&&st['cfg/pos'].v['TEST-OTHER']));
 T('conflict badge shown',(await page.evaluate(()=>(document.getElementById('sycfx')||{}).textContent||''))==='⚠ 1 not saved');
 // 4) choose mine
 await page.click('#sycfx');await wait(300);await page.screenshot({path:path.join(__dirname,'out','conflict.png')});
 await page.click('[data-cfx="m0"]');await wait(1500);
 const st2=await page.evaluate(()=>JSON.parse(localStorage.getItem('__mockdb')||'{}'));
 T('"Use mine" writes mine',st2[P2]&&st2[P2].v&&st2[P2].v.s==='Installed');
 T('outbox empty',(await E("OBX.length"))===0);
 T('no page errors',errs.length===0);if(errs.length)console.log(errs.join('\n'));
 await b.close();process.exit(ok?0:1)})();
