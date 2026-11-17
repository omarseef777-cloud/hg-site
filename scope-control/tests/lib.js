// Shared helpers for the browser checks: serve dist/ without network, expose the program scope, fake shared store.
const { chromium, devices } = require('playwright');const fs=require('fs'),path=require('path');
const MARK='<script>\n(function(){\nconst D=window.SCOPE;';
const hook=h=>h.replace(MARK,'<script>\n(function(){window.__ev=function(s){return eval(s)};\nconst D=window.SCOPE;');
// in-memory store with the db surface the program uses; data kept in localStorage so it survives a reload
const MOCK=`(()=>{const L=()=>{try{return JSON.parse(localStorage.getItem('__mockdb')||'{}')}catch(_){return {}}},W=s=>localStorage.setItem('__mockdb',JSON.stringify(s));
 const off=()=>localStorage.getItem('__mockoff')==='1',subs=new Set(),fire=()=>{if(!off())subs.forEach(f=>f())},err={code:'unavailable',message:'offline'};
 const snap=(s,p)=>({id:p.split('/').pop(),exists:p in s,data:()=>s[p]?JSON.parse(JSON.stringify(s[p])):undefined,metadata:{fromCache:false,hasPendingWrites:false}});
 const doc=p=>({id:p.split('/').pop(),path:p,get:async()=>{if(off())throw err;return snap(L(),p)},
  set:async d=>{if(off())throw err;const s=L();s[p]=JSON.parse(JSON.stringify(d));W(s);setTimeout(fire,5)},
  update:async d=>{if(off())throw err;const s=L();s[p]=Object.assign({},s[p],d);W(s);setTimeout(fire,5)},
  delete:async()=>{if(off())throw err;const s=L();delete s[p];W(s);setTimeout(fire,5)},
  onSnapshot(cb){const f=()=>{try{cb(snap(L(),p))}catch(e){console.error('snap',p,e)}};subs.add(f);setTimeout(()=>{if(!off())f()},30);return()=>subs.delete(f)}});
 const coll=c=>({where:()=>coll(c),orderBy:()=>coll(c),limit:()=>coll(c),doc:id=>doc(c+'/'+id),
  onSnapshot(cb){const f=()=>{const s=L(),docs=Object.keys(s).filter(k=>k.startsWith(c+'/')&&k.split('/').length===c.split('/').length+1).map(k=>snap(s,k));try{cb({docs,size:docs.length,empty:!docs.length,metadata:{fromCache:false,hasPendingWrites:false},docChanges:()=>[]})}catch(e){console.error('coll',c,e)}};subs.add(f);setTimeout(()=>{if(!off())f()},30);return()=>subs.delete(f)},
  get:async()=>{if(off())throw err;const s=L(),docs=Object.keys(s).filter(k=>k.startsWith(c+'/')).map(k=>snap(s,k));return {docs,empty:!docs.length,size:docs.length}}});
 const user={id:async()=>'u1',canEdit:async()=>true,can:async()=>true,isOwner:()=>true,profiles:async ids=>Object.fromEntries(ids.map(i=>[i,{name:'Test'}]))};
 window.claude={use:async n=>n==='db'?{doc,collection:coll}:n==='user'?user:null}})();`;
async function open(dir,{live=false,device=null,viewport={width:1366,height:820}}={}){
  const browser=await chromium.launch();const ctx=await browser.newContext(device?{...devices[device],deviceScaleFactor:1}:{viewport});
  await ctx.route('http://app.test/**',r=>{const p=decodeURIComponent(new URL(r.request().url()).pathname.slice(1))||'index.html';const f=path.join(dir,p);
    if(p==='index.html')return r.fulfill({body:hook(fs.readFileSync(f,'utf8')),contentType:'text/html'});return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''})});
  await ctx.route(/^https?:\/\/(?!app\.test)/,r=>r.abort());
  if(live)await ctx.addInitScript(MOCK);await ctx.addInitScript(()=>{window.print=()=>{};window.open=()=>null});
  const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push((e.stack||e.message).split('\n').slice(0,2).join(' | ')));
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_/.test(m.text()))errs.push('console: '+m.text().slice(0,200))});page.on('dialog',d=>d.dismiss().catch(()=>{}));
  await page.goto('http://app.test/index.html',{waitUntil:'load',timeout:300000});await page.waitForTimeout(2500);
  const E=s=>page.evaluate(x=>window.__ev(x),s);return {browser,ctx,page,errs,E};}
module.exports={open,hook,MOCK};
